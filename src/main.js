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
    var viewport = require('saber-viewport');
    var mm = require('saber-mm');

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
     * @return {function|undefined}
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
        if (status === STATUS_LOAD && !force) {
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
     * 清除所有的缓存action
     *
     * @inner
     */
    function clearCache() {
        var action;
        Object.keys(cachedAction).forEach(function (path) {
            action = cachedAction[path];
            if (cur.action !== action) {
                action.dispose();
            }
        });
        cachedAction = {};
        viewport.delCache();
    }

    /**
     * 删除缓存的action
     *
     * @inner
     * @param {string} path
     */
    function delCache(path) {
        var action = cachedAction[path];
        if (!action) {
            return;
        }
        // 如果不是当前显示的action则进行dispose
        // 如果是当前显示的action，后续leave会处理
        if (cur.action !== action) {
            action.dispose();
        }
        delete cachedAction[path];
        viewport.delCache(path);
    }

    /**
     * 保存当前Action相关信息
     *
     * @inner
     * @param {Action} action
     * @param {Object} route
     * @param {Page} page
     */
    function dumpInfo(action, route, page) {
        if (action) {
            cur.action = action;
            if (route.cached) {
                cachedAction[route.path] = action;
            }
        }
        else {
            cur.action = null;
        }

        cur.route = route;
        cur.page = page;
        cur.path = route.path;
    }

    /**
     * 启动Action
     *
     * @inner
     * @param {Object} config 路由信息
     * @param {string} config.path 请求路径
     * @param {Object} config.action action配置
     * @param {Object} config.query 查询条件
     * @param {boolean=} config.cached 是否缓存action
     * @param {Object=} config.transition 转场配置
     * @param {Object} config.options 跳转参数
     * @param {boolean} config.options.force 强制跳转
     * @param {boolean=} config.optins.noCache 不使用缓存action
     * @param {Object} action
     */
    function enterAction(config, action) {
        var options = config.options || {};

        // 获取页面转场配置参数
        var transition = config.transition || {};
        // 调用全局配置中的处理函数进行转场参数处理
        var processor = getProcessor('transition');
        if (processor) {
            extend(transition, processor(config, cur.route) || {});
        }

        // 如果请求路径没有变化
        // 取消转场效果
        if (config.path === cur.path) {
            transition.type = false;
        }

        var page = viewport.load(
            config.path,
            {
                cached: config.cached,
                noCache: options.noCache
            }
        );

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
                route: extend({}, config),
                action: action,
                page: page
            },
            {
                route: extend({}, cur.route),
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
         * @param {boolean} error
         * @return {Promise}
         */
        function startTransition(error) {
            // 转场开始前 设置强制设置为加载状态
            // 清除状态重置定时器，防止干扰转场动画
            setStatus(STATUS_LOAD, true);
            // 触发`beforetransition`
            fireEvent('beforetransition');

            dumpInfo(!error && action, config, page);

            if (error) {
                return page
                        .enter(transition.type, transition)
                        .then(bind(Resolver.rejected, Resolver));
            }
            return page.enter(transition.type, transition);
        }

        var method;
        var delayMethods = ['complete'];
        var args = [config.path, config.query, config.url, options];

        /**
         * action加载失败处理
         *
         * @inner
         * @return {Promise}
         */
        function enterFail() {
            fireEvent('error');
            return startTransition(true);
        }

        /**
         * 转场正常完成处理
         *
         * @inner
         */
        function finishTransition() {
            delayMethods.forEach(function (name) {
                action[name]();
            });
            finishLoad();
        }

        // 如果没有缓存则使用enter
        // 否则使用wakeup
        if (!cachedAction[config.path]) {
            method = 'enter';
            // 补充enter参数
            args.unshift(page.main);
            // 没有缓存时还需要ready调用
            delayMethods.unshift('ready');
        }
        else {
            method = 'wakeup';
            // 已缓存时需要调用revived
            delayMethods.unshift('revived');
        }

        // 开始加载action
        action[method]
            .apply(action, args)
            // 开始转场操作
            .then(startTransition, enterFail)
            // 转场完成处理
            .then(finishTransition, finishLoad);
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
     * @param {boolean} config.options.force 强制跳转
     * @param {boolean=} config.optins.noCache 不使用缓存action
     */
    function loadAction(config) {
        var options = config.options || {};

        // 如果路径未发生变化
        // 只需要刷新当前action
        if (config.path === cur.path
            && !options.force
            && cur.action // 会有存在cur.path但不存在cur.action的情况，比如action加载失败
            && cur.action.refresh
        ) {
            cur.action.refresh(config.query, config.options).then(finishLoad);
            return;
        }

        if (options.noCache) {
            delCache(config.path);
        }

        // 处理当前正在工作的action
        if (cur.action) {
            cur.action[cachedAction[cur.path] ? 'sleep' : 'leave']();
        }

        // 首先尝试从cache中取action
        var action = cachedAction[config.path];

        // 没有从cache中获取到action就创建
        if (!action) {
            mm.create(config.action).then(curry(enterAction, config));
        }
        else {
            enterAction(config, action);
        }
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
                resolver.resolve(route);
            }
            else if (!item.url
                || (item.url instanceof RegExp && item.url.test(route.path))
                || item.url === route.path
            ) {
                item.filter(route, next, jump);
            }
            else {
                next();
            }
        }

        next();

        return resolver.promise();
    }

    /**
     * 首屏渲染
     *
     * @inner
     * @param {Page} page
     * @param {Object} action
     */
    function loadFirstScreen(page, action) {
        var route = waitingRoute;
        if (!route) {
            return;
        }

        function fireEvent(eventName) {
            exports.emit(
                eventName,
                {
                    route: null,
                    action: null,
                    page: null
                },
                {
                    route: route,
                    action: action,
                    page: page
                }
            );
        }

        fireEvent('beforeload');

        // 视图与数据已经ready了
        // 跳过enter
        action.view.setMain(page.main);
        // 使用初始化数据填充首屏model
        var initialData = window[globalConfig.initialDataKey];
        if (initialData) {
            action.model.fill(initialData);
        }

        fireEvent('beforetransition');

        action.ready(true);
        action.complete();

        fireEvent('afterload');

        dumpInfo(action, route, page);

        waitingRoute = null;

        finishLoad();
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
        if (!waitingRoute || cur.status !== STATUS_IDLE) {
            return;
        }

        // 设置当前状态为正在加载中
        setStatus(STATUS_LOAD);

        var path = waitingRoute.path;

        // 首屏渲染逻辑
        // 第一次加载action且能获取到起始页面
        var page;
        if (globalConfig.firstScreen && !cur.action
            && (page = viewport.front(path, {cached: waitingRoute.cached}))
        ) {
            mm.create(waitingRoute.action).then(curry(loadFirstScreen, page));
            return;
        }

        // 处理filter的执行结果
        function beforeLoad(route) {
            // 如果改变了path则以静默形式重新加载
            if (path !== route.path) {
                // 设置状态为空闲以支持跳转
                setStatus(STATUS_IDLE);
                globalConfig.router.redirect(route.path, route.query, route.options);
            }
            else {
                loadAction(route);
            }
        }

        // 执行filter
        executeFilter(waitingRoute).then(beforeLoad);
        // 进入加载流程了
        // 清除等待加载的route信息
        waitingRoute = null;
    }

    /**
     * 路由导向
     *
     * @inner
     * @param {option} config 路由配置
     * @param {string} path 请求路径
     * @param {Object} query 查询条件
     * @param {string} url 完整的URL
     * @param {Object} options 跳转参数
     */
    function routeTo(config, path, query, url, options) {
        // 设置当前的路由信息
        waitingRoute = extend({}, config);
        waitingRoute.path = path;
        waitingRoute.query = query;
        waitingRoute.options = options;
        waitingRoute.url = url;

        // 尝试加载Action
        tryLoadAction();
    }

    /**
     * 扩展全局配置项
     *
     * @inner
     * @param {Object} options 配置项
     * @return {Object}
     */
    function extendGlobalConfig(options) {
        var config = extend(globalConfig, options);

        if (!Array.isArray(config.template)) {
            config.template = [config.template];
        }

        // 如果没有指定路由器则使用默认的hash路由
        if (!config.router) {
            config.router = require('saber-router');
            config.router.controller(require('saber-router/controller/hash'));
        }

        return config;
    }

    var routes = [];
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

        // 如果还没有制定router
        // 则先缓存路由信息
        // 否则直接添加路由
        if (!globalConfig.router) {
            routes = routes.concat(paths);
        }
        else {
            paths.forEach(function (item) {
                globalConfig.router.add(item.path, curry(routeTo, item));
            });
        }
    };

    /**
     * 启动框架
     *
     * @public
     * @param {HTMLElement} main
     * @param {Object} options 全局配置信息 完整配置参考`./config.js`
     */
    exports.start = function (main, options) {
        // 扩展全局配置信息
        var config = extendGlobalConfig(options);

        var router = config.router;

        mm.config({
            template: config.template,
            templateConfig: config.templateConfig,
            router: router,
            Presenter: config.Presenter,
            View: config.View,
            Model: config.Model
        });

        // 初始化viewport
        viewport.init(main, config.viewport);

        // 启用无延迟点击
        Tap.mixin(document.body);

        // 添加路由
        routes.forEach(function (item) {
            router.add(item.path, curry(routeTo, item));
        });

        // 启动路由
        router.start();
    };

    /**
     * 添加filter
     *
     * @public
     * @param {string|RegExp=} url
     * @param {Function} filter
     */
    exports.addFilter = function (url, filter) {
        if (arguments.length === 1) {
            filter = url;
            url = null;
        }

        filters.push({
            url: url,
            filter: filter
        });
    };

    /**
     * 删除filter
     *
     * @public
     * @param {string|RegExp=} url
     */
    exports.removeFilter = function (url) {
        if (!url) {
            filters = [];
        }
        else {
            var index;
            var res = filters.some(function (item, i) {
                index = i;
                return item.url.toString() === url.toString();
            });
            if (res) {
                filters.splice(index, 1);
            }
        }
    };

    /**
     * 删除缓存的action
     *
     * @public
     * @param {string} path
     */
    exports.delCachedAction = function (path) {
        if (path) {
            delCache(path);
        }
        else {
            clearCache();
        }
    };

    /**
     * 停止App
     * For Test
     *
     * @public
     */
    exports.stop = function () {
        var router = globalConfig.router;

        router.stop();
        router.clear();
        routes = [];

        filters = [];
        waitingRoute = null;
        cur = {status: STATUS_IDLE};

        exports.delCachedAction();
    };

    return exports;

});
