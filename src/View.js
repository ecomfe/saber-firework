/**
 * @file View
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var dom = require('saber-dom');
    var etpl = require('etpl');
    var widget = require('saber-widget');
    var router = require('saber-router');
    var eventHelper = require('./event');
    var globalConfig = require('./config');

    var Abstract = require('./Abstract');

    /**
     * 代理DOM事件KEY
     *
     * @const
     * @type{string}
     */
    var KEY_DELEGATE = '__delegate__';

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
        return fn[KEY_DELEGATE] = function (e) {
            return fn.call(view, this, e);
        };
    }

    /**
     * 绑定DOM事件
     *
     * @inner
     * @param {View} view
     */
    function bindDomEvents(view) {
        var type;
        var selector;
        var fn;
        var events = view.domEvents || {};
        Object.keys(events).forEach(function (name) {
            fn = events[name];
            name = name.split(':');
            type = name[0].trim();
            selector = name[1] ? name[1].trim() : undefined;
            view.addDomEvent(view.main, type, selector, fn);
        });
    }

    /**
     * 编译模版
     *
     * @public
     * @param {View} view
     * @param {string|Array.<string>} str 模版
     */
    function compileTemplate(view, str) {
        if (!Array.isArray(str)) {
            str = [str];
        }

        // 添加全局的模版
        str = str.concat(globalConfig.template || []);

        str = str.join('');

        // 新建模版引擎
        var tplEngine = new etpl.Engine();

        // 拷贝etpl命名空间的filter、配置
        tplEngine.options = etpl.options;
        tplEngine.filters = etpl.filters;

        // 保存默认render
        var defaultRender = tplEngine.compile(str);
        // 保存原始的render
        var orgRender = tplEngine.render;

        view.template = tplEngine;
        // 重载render以支持无target的情况
        view.template.render = function (name, data) {
            var res = '';
            // 如果只有一个参数 或者target为null
            // 则使用默认render
            if (arguments.length < 2 || !name) {
                res = defaultRender(name || data);
            }
            else {
                res = orgRender.call(this, name, data);
            }

            return res;
        };
    }

    /**
     * View
     *
     * @constructor
     * @param {Object} options 配置信息
     * @param {string|Array.<string>} options.template 模版字符串
     * @param {string=} options.templateMainTarget 模版主target 用于初始化视图
     * @param {string=} options.className 容器元素附加className
     * @param {Object=} events view事件
     * @param {Object=} domEvents DOM事件
     */
    function View(options) {

        options = options || {};

        Abstract.call(this, options);

        this.init();

        // 修改原始配置项
        // 只在第一次加载view的时候才编译模版
        options.template = this.template;
    }

    inherits(View, Abstract);

    /**
     * 初始化
     *
     * @public
     */
    View.prototype.init = function () {
        this.template = this.template || '';
        // 如果是字符串或者数组
        // 则表示模版还未编译
        if (Array.isArray(this.template)
            || typeof this.template === 'string'
        ) {
            compileTemplate(this, this.template);
        }

        // 绑定了事件的DOM元素集合
        // 用于View销毁时卸载事件绑定
        this.bindElements = [];

        Abstract.prototype.init.call(this);
    };

    /**
     * 设置容器元素
     *
     * @public
     * @param {HTMLElement} ele 视图容器元素
     */
    View.prototype.setMain = function (ele) {
        this.main = ele;
    };

    /**
     * 渲染视图
     *
     * @public
     * @param {Object} data
     *
     * @fires View#beforerender
     *        View#afterrender
     */
    View.prototype.render = function (data) {
        if (!this.main) {
            return;
        }

        if (this.className) {
            this.main.className += ' ' + this.className;
        }

        /**
         * 渲染前事件
         *
         * @event
         * @param {Object} 渲染数据
         */
        this.emit('beforerender', data);

        this.main.innerHTML =
            this.template.render(this.templateMainTarget, data);

        /**
         * 渲染后事件
         *
         * @event
         * @param {Object} 渲染数据
         */
        this.emit('afterrender', data);
    };

    /**
     * 视图就绪
     * 主要进行事件绑定
     *
     * @public
     * @fires View#ready
     */
    View.prototype.ready = function () {
        bindDomEvents(this);

        /**
         * 试图就绪事件
         *
         * @event
         */
        this.emit('ready');
    };

    /**
     * 选取视图中的DOM元素
     *
     * @public
     * @param {string} selector 选择器
     * @param {HTMLElement=} context 上下文
     * @return {HTMLElement|Array.<HTMLElement>}
     */
    View.prototype.query = function (selector, context) {
        context = context || this.main || document.body;
        return dom.query(selector, context);
    };

    /**
     * 选取视图中的DOM元素
     *
     * @public
     * @param {string} selector 选择器
     * @param {HTMLElement=} context 上下文
     * @return {HTMLElement|Array.<HTMLElement>}
     */
    View.prototype.queryAll = function (selector, context) {
        context = context || this.main || document.body;
        return dom.queryAll(selector, context);
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
    View.prototype.redirect = function (url, query, options) {
        router.redirect(url, query, options);
    };


    /**
     * Superseded by `addDomEvent`
     *
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
     * Superseded by `removeDomEvent`
     *
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

    /*
     * 绑定DOM事件
     * 会对进行绑定的DOM元素进行管理，方便自动卸载
     *
     * @public
     * @param {HTMLElement} ele
     * @param {string} type 事件类型
     * @param {string=} selector 子元素选择器
     * @param {function(element,event)} fn 事件处理函数，this指针为View对象
     */
    View.prototype.addDomEvent = function (ele, type, selector, fn) {
        if (this.bindElements.indexOf(ele) < 0) {
            this.bindElements.push(ele);
        }
        if (!fn) {
            fn = selector;
            selector = undefined;
        }
        eventHelper.on(ele, type, selector, delegateDomEvent(this, fn));
    };

    /*
     * 卸载DOM事件
     *
     * @public
     * @param {HTMLElement} ele
     * @param {string} type 事件类型
     * @param {string=} selector 子元素选择器
     * @param {function} fn 事件处理函数
     */
    View.prototype.removeDomEvent = function (ele, type, selector, fn) {
        if (!fn) {
            fn = selector;
            selector = undefined;
        }
        if (fn[KEY_DELEGATE]) {
            eventHelper.off(ele, type, selector, fn[KEY_DELEGATE]);
        }
    };

    /**
     * 视图销毁
     *
     * @public
     * @fires View#dispose
     */
    View.prototype.dispose = function () {
        /**
         * 视图销毁事件
         *
         * @event
         */
        this.emit('dispose');

        // 解除事件绑定
        this.bindElements.forEach(function (ele) {
            eventHelper.clear(ele);
        });
        this.bindElements = [];

        // 销毁页面的widget
        widget.dispose(this.main);

        // 解除元素引用
        this.main = null;
    };

    /**
     * 视图离开
     *
     * @public
     * @fires View#leave
     */
    View.prototype.leave = function () {
        /**
         * 视图离开事件
         *
         * @event
         */
        this.emit('leave');
    };

    /**
     * 视图休眠
     *
     * @public
     * @fires View#sleep
     */
    View.prototype.sleep = function () {
        /**
         * 视图休眠事件
         *
         * @event
         */
        this.emit('sleep');
    };

    /**
     * 视图唤醒
     *
     * @public
     * @param {Object} data
     *
     * @fires View#wakeup
     */
    View.prototype.wakeup = function (data) {
        /**
         * 视图唤醒事件
         *
         * @event
         */
        this.emit('wakeup', data);
    };

    return View;
});
