/**
 * @file Action
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var extend = require('saber-lang/extend');
    var bind = require('saber-lang/bind');
    var router = require('saber-router');
    var Resolver = require('saber-promise');

    var Abstract = require('./Abstract');
    var View = require('./View');
    var Model = require('./Model');

    /**
     * Action
     *
     * @constructor
     * @param {Object} options 配置参数
     * @param {Object} options.view view配置项
     * @param {Object} options.model model配置项
     * @param {Object=} options.events 事件
     */
    function Action(options) {
        Abstract.call(this, options);
        this.init();
        this.emit('init');
    }

    inherits(Action, Abstract);

    /**
     * 初始化
     *
     * @public
     */
    Action.prototype.init = function () {
        var Constructor;

        if (this.view
            && this.view.constructor !== Object
        ) {
            Constructor = this.view.constructor;
        }
        else {
            Constructor = View;
        }
        this.view = new Constructor(this.view);

        if (this.model
            && this.model.constructor !== Object
        ) {
            Constructor = this.model.constructor;
        }
        else {
            Constructor = Model;
        }
        this.model = new Constructor(this.model);

        Abstract.prototype.init.call(this);
    };

    /**
     * 页面跳转
     *
     * @public
     * @param {string} url 跳转地址
     * @param {Object=} query 查询条件
     * @param {Object=} options 跳转参数
     * @param {boolean} options.force 强制跳转（url相同时）
     * @param {boolean} options.noCache 不使用缓存的action
     */
    Action.prototype.redirect = function (url, query, options) {
        router.redirect(url, query, options);
    };

    /**
     * 加载页面
     *
     * 页面入口
     * 完成数据请求，页面渲染
     *
     * @public
     * @param {string} url 当前的访问地址
     * @param {Object} query 查询条件
     * @param {HTMLElement} main 视图容器
     */
    Action.prototype.enter = function (url, query, main, options) {
        this.url = url;
        this.query = extend({}, query);
        this.options = extend({}, options);

        this.view.setMain(main);
        this.emit('enter');

        return this.model.fetch(this.query)
                .then(bind(this.view.render, this.view));
    };

    /**
     * 唤醒页面
     *
     * @public
     * @param {string} url 当前的访问地址
     * @param {Object} query 查询条件
     * @param {Object} options 跳转参数
     * @return {Promise}
     */
    Action.prototype.wakeup = function (url, query, options) {
        this.url = url;
        this.query = extend({}, query);
        this.options = extend({}, options);

        this.emit('wakeup');
        this.view.wakeup();
        return Resolver.resolved();
    };

    /**
     * 页面就绪
     * 完成页面渲染转场后触发
     * 进行事件注册
     *
     * @public
     */
    Action.prototype.ready = function () {
        this.emit('ready');
        this.view.ready();
    };

    /**
     * 页面呈现完成
     * 业务逻辑处理的主要入口
     *
     * @public
     */
    Action.prototype.complete = function () {
        this.emit('complete');
    };

    /**
     * 页面离开
     *
     * @public
     * @return {boolean} 是否能离开页面
     */
    Action.prototype.leave = function () {
        var cancel = false;

        this.emit(
            'leave',
            function () {
                cancel = true;
            }
        );

        if (!cancel) {
            this.view.leave();
            this.dispose();
        }
        return !cancel;
    };

    /**
     * 页面休眠
     *
     * @public
     * @return {boolean} 是否能休眠页面
     */
    Action.prototype.sleep = function () {
        var cancel = false;

        this.emit(
            'sleep',
            function () {
                cancel = true;
            }
        );

        if (!cancel) {
            this.view.sleep();
        }
        return !cancel;
    };

    /**
     * 页面卸载
     *
     * @public
     */
    Action.prototype.dispose = function () {
        this.view.dispose();
        this.model.dispose();
    };

    return Action;
});
