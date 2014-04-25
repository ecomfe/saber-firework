/**
 * @file main
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Emitter = require('saber-emitter');
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
     * @param {number}
     */
    function setStatus(status) {
        if (status == STATUS_LOAD) {
            // 设置状态回复计时器
            // 在Action加载过久时支持用户切换页面
            cur.statusTimer = setTimeout(
                function () {
                    cur.status = STATUS_IDLE;
                },
                globalConfig.timeout
            );
        }
        else if (status == STATUS_IDLE) {
            clearTimeout(cur.statusTimer);
        }

        cur.status = status;
    }

    /**
     * Action加载完成处理
     *
     * @inner
     */
    function loadedAction() {
        cur.action.complete();
        setStatus(STATUS_IDLE);
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
     * @param {boolean=} config.cached 是否缓存路由
     * @param {Object=} config.transition 转场配置
     */
    function loadAction(config) {
        // 处理当前正在工作的Action
        if (cur.action) {
            // 如果需要缓存Action
            // 则调用sleep
            if (cur.route.cached) {
                cur.action.sleep();
            }
            // 否则调用leave 离开Action
            else {
                cur.action.leave();
            }
        }

        // 获取新Action
        var action;
        if (config.cached) {
            action = cachedAction[config.path];
        }
        if (!action) {
            var Constructor = config.action.constructor == Object
                                ? Action
                                : config.action.constructor;
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
        // 在转场结束时触发afterlaod事件
        page.on(
            'afterenter', 
            bind(exports.emit, exports, 'afterload', page, cur.page)
        );
        // 触发beforeload事件
        exports.emit('beforeload', page, cur.page);

        var finished;
        // 如果action未缓存
        // 则使用enter
        if (!cachedAction[config.path]) {
            finished = action.enter(config.path, config.query, page.main)
                        .then(function () {
                            return page.enter(transition.type, transition);
                        }).then(function () {
                            action.ready();
                        });
        }
        else {
            action.wakeup(config.path, config.query);
            finished = page.enter(transition.type, transition);
        }

        finished.then(loadedAction);

        if (config.cached) {
            cachedAction[config.path] = action;
        }

        cur.route = config;
        cur.page = page;
        cur.action = action;
        cur.path = config.path;
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
        loadAction(waitingRoute);
        waitingRoute = null;
    }

    /**
     * 路由导向
     *
     * @inner
     * @param {option} config 路由配置
     * @param {string} path 请求路径
     * @param {Object} query 查询条件
     */
    function routeTo(config, path, query) {
        // 设置当前的路由信息
        waitingRoute = extend({}, config);
        waitingRoute.path = path;
        waitingRoute.query = query;

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

    return exports;

});
