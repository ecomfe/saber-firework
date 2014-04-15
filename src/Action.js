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
     * 绑定事件
     *
     * @inner
     */
    function bindEvents(action) {
        var events = action.events || {};

        var fn;
        Object.keys(events).forEach(function (name) {
            fn = events[name];
            if (name.indexOf(':') < 0) {
                action.on(name, fn);
            }
            else {
                var items = name.split(':');
                var item = items[0].trim();
                if (item && items[1]) {
                    action[item].on(items[1].trim(), bind(fn, action));
                }
            }
        });
    }

    /**
     * Action
     *
     * @constructor
     */
    function Action(options) {
        Abstract.call(this);

        extend(this, options);

        this.model = new Model(this.model || {});
        this.view = new View(this.view || {});

        this.emit('init');
    }

    inherits(Action, Abstract);

    /**
     * 加载页面
     * 完成数据请求，页面渲染
     *
     * @public
     */
    Action.prototype.enter = function (url, query, main) {
        this.url = url;
        this.query = extend({}, query);

        this.view.beforeRender(main);
        this.emit('enter');

        return this.model.fetch(this.query).then(bind(this.view.render, this.view));
    };

    Action.prototype.wakeup = function (url, query) {
        this.url = url;
        this.query = extend({}, query);

        this.emit('wakeup');
        this.view.wakeup();
        return Resolver.resolved();
    };

    Action.prototype.redirect = function (url, query, force) {
        router.redirect(url, query, force);
    };

    Action.prototype.ready = function () {
        bindEvents(this);
        this.view.ready();
        this.emit('ready');
    };

    Action.prototype.complete = function () {
        this.emit('complete');
    };

    Action.prototype.leave = function () {
        this.emit('leave');
        this.dispose();
    };

    Action.prototype.sleep = function () {
        this.emit('sleep');
        this.view.sleep();
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
