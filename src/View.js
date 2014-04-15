/**
 * @file View
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var extend = require('saber-lang/extend');
    var dom = require('saber-dom');
    var etpl = require('etpl');
    var eventHelper = require('./event');

    var Abstract = require('./Abstract');

    /*
     * 代理DOM事件
     * 调整this指针
     *
     * @inner
     * @param {View} view
     * @param {function} fn
     * @return {function}
     */
    function delegateDomEvent(view, fn) {
        return function (e) {
            return fn.call(view, this, e);
        };
    }

    /**
     * 事件绑定
     *
     * @inner
     * @param {View} view
     */
    function bindEvents(view) {
        // 绑定View事件
        var events = view.events || {};
        Object.keys(events).forEach(function (name) {
            view.on(name, events[name]);
        });

        // 绑定DOM事件
        var type;
        var selector;
        var fn;
        events = view.domEvents || {};
        Object.keys(events).forEach(function (name) {
            fn = delegateDomEvent(view, events[name]);
            name = name.split(':');
            type = name[0].trim();
            selector = name[1] ? name[1].trim() : undefined;
            view.attachEvent(view.main, type, selector, fn);
        });
    }

    /**
     * 获取模版字符串
     *
     * @inner
     * @param {Object} options view配置参数
     * @return {string}
     */
    function getTemplate(options) {
        var tpl = options.template;

        if (Array.isArray(tpl)) {
            tpl = tpl.join('\n\n');
        }

        return tpl;
    }

    /**
     * View
     * 
     * @constructor
     * @param {Object} options 配置信息
     * @param {string|Array.<string>} options.template 模版字符串
     * @param {string} options.templateMainTarget 模版主target 用于初始化视图
     * @param {string=} options.className 容器元素附加className
     * @param {Object=} events view事件
     * @param {Object=} domEvents DOM事件
     */
    function View(options) {
        Abstract.call(this);

        // 获取模版字符串进行编译
        if (options.template) {
            // 使用全局引擎编译
            // 以支持不同View之间的模版
            etpl.compile(getTemplate(options));
            // 直接修改原始配置
            // 不再编译已处理过的模版
            delete options.template;
        }

        extend(this, options);

        this.template = etpl;

        // 绑定了事件的DOM元素集合
        // 用于View销毁时卸载事件绑定
        this.bindElements = [];
    }

    inherits(View, Abstract);

    /**
     * 渲染视图前处理
     * 主要用于设置视图容器元素
     * 附加视图容器元素的className
     *
     * @public
     * @param {HTMLElement} 视图容器元素
     */
    View.prototype.beforeRender = function (ele) {
        this.main = ele;
        if (this.className) {
            ele.className += ' ' + this.className;
        }
    };

    /**
     * 渲染视图
     *
     * @public
     * @param {Object} data
     */
    View.prototype.render = function (data) {
        this.main.innerHTML = 
            this.template.render(this.templateMainTarget, data);
    };

    /**
     * 视图就绪
     * 主要进行事件绑定
     *
     * @public
     */
    View.prototype.ready = function () {
        bindEvents(this);
        this.emit('ready');
    };

    /**
     * 选取视图中的DOM元素
     *
     * @public
     * @param {string} selector 选择器
     * @return {HTMLElement|Array.<HTMLElement>}
     */
    View.prototype.query = function (selector) {
        return dom.query(selector, this.main || document.body);
    };

    /**
     * 绑定DOM事件
     * 会对进行绑定的DOM元素进行管理，方便自动卸载
     *
     * @public
     * @param {HTMLElement} ele
     * @param {string} type 事件类型
     * @param {string=} selector 子元素选择器
     * @param {function} fn 事件处理函数
     */
    View.prototype.attachEvent = function (ele, type, selector, fn) {
        if (this.bindElements.indexOf(ele) < 0) {
            this.bindElements.push(ele);
        }
        eventHelper.on(ele, type, selector, fn);
    };

    /**
     * 卸载DOM事件
     *
     * @public
     * @param {HTMLElement} ele
     * @param {string} type 事件类型
     * @param {string=} selector 子元素选择器
     * @param {function} fn 事件处理函数
     */
    View.prototype.detachEvent = function (ele, type, selector, fn) {
        eventHelper.off(ele, type, selector, fn);
    };

    /**
     * 视图销毁
     *
     * @public
     */
    View.prototype.dispose = function () {
        this.emit('dispose');
        this.bindElements.forEach(function (ele) {
            eventHelper.clear(ele);
        });
        this.main = null;
    };

    /**
     * 视图休眠
     *
     * @public
     */
    View.prototype.sleep = function () {
        this.emit('sleep');
    };

    /**
     * 视图唤醒
     *
     * @public
     */
    View.prototype.wakeup = function () {
        this.emit('wakeup');
    };

    return View;
});
