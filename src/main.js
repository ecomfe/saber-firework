/**
 * @file main
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Emitter = require('saber-emitter');
    var Resolver = require('saber-promise');
    var Tap = require('saber-tap');
    var extend = require('saber-lang/extend');
    var bind = require('saber-lang/bind');
    var curry = require('saber-lang/curry');
    var router = require('saber-router');
    var viewport = require('saber-viewport');
    var Action = require('./Action');

    var globalConfig = require('./config');

    var STATUS_IDLE = 0;
    var STATUS_LOAD = 1;
    var filters = [];
    var cachedAction = {};
    var waitingRoute;
    var cur = {};

    cur.status = STATUS_IDLE;


    /**
     * 获取全局配置的附加处理器
     *
     * @inner
     * @param {string} name
     * @param {function|undefined}
     */
    function getProcessor(name) {
        var processor = globalConfig.processor || {};
        return processor[name];
    }

    /**
     * 当前状态设置
     *
     * @inner
     * @param {number} status
     * @param {boolean} force
     */
    function setStatus(status, force) {
        clearTimeout(cur.statusTimer);
        if (status == STATUS_LOAD && !force) {
            // 设置状态回复计时器
            // 在Action加载过久时支持用户切换页面
            cur.statusTimer = setTimeout(
                function () {
                    cur.status = STATUS_IDLE;
                },
                globalConfig.timeout
            );
        }

        cur.status = status;
    }

    /**
     * 停止加载action
     *
     * @inner
     */
    function stopLoadAction() {
        // 恢复当前的hash
        if (cur.path) {
            router.reset(cur.path);
        }
        // 设置状态为空闲
        setStatus(STATUS_IDLE);
        // 清理等待的route信息
        waitingRoute = null;
    }

    /**
     * action加载完成
     *
     * @inner
     */
    function finishLoad() {
        // 设置状态为空闲
        setStatus(STATUS_IDLE);
        // 尝试加载之前被阻塞的action
        tryLoadAction();
    }

    /**
     * 加载Action
     *
     * @inner
     * @param {Object} config 路由信息
     * @param {string} config.path 请求路径
     * @param {Object} config.action action配置
     * @param {Object} config.query 查询条件
     * @param {boolean=} config.cached 是否缓存action
     * @param {Object=} config.transition 转场配置
     * @param {Object} config.options 跳转参数
     * @param {boolean=} config.optins.noCache 不使用缓存action
     */
    function loadAction(config) {

        // 处理当前正在工作的Action
        // 如果action的leave或者sleep返回false阻止离开则停止加载action
        if (cur.action
            && !cur.action[cur.route.cached ? 'sleep' : 'leave']()
        ) {
            stopLoadAction();
            return;
        }

        // 获取新Action
        var action;
        if (config.cached) {
            action = cachedAction[config.path];
        }
        if (!action) {
            var Constructor;
            if (config.action
                && config.action.constructor !== Object
            ) {
                Constructor = config.action.constructor;
            }
            else {
                Constructor = Action;
            }
            action = new Constructor(config.action);
        }

        // 获取页面转场配置参数
        var transition = config.transition || {};
        // 调用全局配置中的处理函数进行转场参数处理
        var processor = getProcessor('transition'); 
        if (processor) {
            extend(transition, processor(config, cur.route) || {});
        }

        // 如果请求路径没有变化（只改变了Query）
        // 取消转场效果
        if (config.path == cur.path) {
            transition.type = false;
        }

        var page = viewport.load(config.path, { cached: config.cached });

        /**
         * 触发全局事件
         *
         * @inner
         * @type {string} eventName 事件名称
         */
        var fireEvent = (
            function (eventArgBack, eventArgFront) {
                return function (eventName) {
                    exports.emit(eventName, eventArgBack, eventArgFront);
                };
            }
        )(
            {
                action: action,
                page: page
            },
            {
                action: cur.action,
                page: cur.page
            }
        );

        // 在转场结束时触发afterlaod事件
        page.on('afterenter', curry(fireEvent, 'afterload'));
        // 触发beforeload事件
        fireEvent('beforeload');

        /**
         * 开始转场动画
         *
         * @inner
         */
        function startTransition() {
            // 转场开始前 设置强制设置为加载状态
            // 清除状态重置定时器，防止干扰转场动画
            setStatus(STATUS_LOAD, true);
            // 触发`beforetransition`
            fireEvent('beforetransition');

            // 保存相关信息
            if (config.cached) {
                cachedAction[config.path] = action;
            }
            cur.route = config;
            cur.page = page;
            cur.action = action;
            cur.path = config.path;

            return page.enter(transition.type, transition);
        }

        /**
         * action加载失败处理
         *
         * @inner
         */
        function enterFail() {
            fireEvent('error');

            page.remove(true);
            action.dispose();

            if (cur.path) {
                router.reset(cur.path);
            }

            return Resolver.rejected();
        }

        var finished;
        // 如果action未缓存
        // 则使用enter
        if (!cachedAction[config.path] || config.options.noCache) {
            finished = action
                        .enter(config.path, config.query, page.main, config.options)
                        .then(startTransition, enterFail)
                        .then(bind(action.ready, action));
        }
        else {
            action.wakeup(config.path, config.query, config.options);
            finished = startTransition();
        }

        finished
            .then(bind(action.complete, action))
            .then(finishLoad, finishLoad);
    }

    /**
     * 执行filter
     *
     * @inner
     * @param {Object} route 路由信息
     * @return {Promise}
     */
    function executeFilter(route) {
        var resolver = new Resolver();
        var index = 0;

        /**
         * 终止action加载
         *
         * @inner
         */
        function stop() {
            index = -1;
            next();
        }

        /**
         * 跳过后续的filter
         * 如果不带参数则跳过剩余所有的filter
         *
         * @inner
         * @param {number} num 跳过后续filter的数量
         */
        function jump(num) {
            index += num || filters.length;
            next();
        }

        /**
         * 执行下一个filter
         *
         * @inner
         */
        function next() {
            var item = filters[index++];

            if (!item) {
                resolver[index > 0 ? 'resolve' : 'reject'](route);
            }
            else if ( !item.url
                || (item.url instanceof RegExp && item.url.test(route.path))
                || item.url == route.path
            ) {
                item.filter(route, next, stop, jump);
            }
            else {
                next();
            }
        }

        next();
        return resolver.promise();
    }

    /**
     * 尝试加载Action
     *
     * @inner
     */
    function tryLoadAction() {
        // 如果没有待加载的路由信息
        // 或者当前不是空闲状态
        // 都不再继续加载Action
        if (!waitingRoute || cur.status != STATUS_IDLE) {
            return;
        }

        setStatus(STATUS_LOAD);

        // 执行filter
        executeFilter(waitingRoute)
            .then(
                function () {
                    // filter完成 继续加载页面
                    var route = waitingRoute;
                    waitingRoute = null;
                    loadAction(route);
                },
                // filter阻止加载
                stopLoadAction
            );
    }

    /**
     * 路由导向
     *
     * @inner
     * @param {option} config 路由配置
     * @param {string} path 请求路径
     * @param {Object} query 查询条件
     * @param {Object} options 跳转参数
     */
    function routeTo(config, path, query, options) {
        // 设置当前的路由信息
        waitingRoute = extend({}, config);
        waitingRoute.path = path;
        waitingRoute.query = query;
        waitingRoute.options = options;

        // 尝试加载Action
        tryLoadAction();
    }

    /**
     * 扩展全局配置项
     *
     * @inner
     * @param {Object} 配置项
     * @return {Object}
     */
    function extendGlobalConfig(options) {
        var config = extend(globalConfig, options);

        if (!Array.isArray(config.template)) {
            config.template = [config.template];
        }

        return config;
    }

    var exports = {};

    Emitter.mixin(exports);

    /**
     * 加载path配置信息
     *
     * @public
     * @param {Object} paths
     */
    exports.load = function (paths) {
        if (!Array.isArray(paths)) {
            paths = [paths];
        }
        paths.forEach(function (item) {
            router.add(item.path, curry(routeTo, item));
        });
    };

    /**
     * 启动
     *
     * @public
     * @param {HTMLElement} main
     * @param {Object} options 全局配置信息 完整配置参考`./config.js`
     */
    exports.start = function (main, options) {
        // 扩展全局配置信息
        var config = extendGlobalConfig(options);

        // 初始化viewport
        viewport.init(main, config.viewport);

        // 启用无延迟点击
        Tap.mixin(document.body);

        // 初始化router
        router.config({
            index: config.index,
            path: config.path
        });
        router.start();
    };

    /**
     * 添加filter
     *
     * @param {string|RegExp=} url
     * @param {Function} filter
     */
    exports.addFilter = function (url, filter) {
        if (arguments.length == 1) {
            filter = url;
            url = null;
        }

        filters.push({
            url: url,
            filter: filter
        });
    };

    return exports;

});
