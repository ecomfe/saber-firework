/**
 * @file 变量监控
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var util = require('./util');
    var Emitter = require('saber-emitter');

    /**
     * 元数据key
     *
     * @const
     * @type {string}
     */
    var META_KEY = '__meta__';

    // 数组扩展
    var arrayProxy = {};
    
    // 需要重载的数组方法
    // 在运行这些方法后需要对数组元素进行重新绑定
    var arrayProxyMethods = ['pop', 'push', 'shift', 'splice', 'unshift', 'sort', 'reverse'];

    arrayProxyMethods.forEach(function (name) {
        arrayProxy[name] = function () {
            var meta = this[META_KEY];
            var len = this.length;

            var args = Array.prototype.slice.call(arguments);
            var res = Array.prototype[name].apply(this, args);

            if (len > this.length || name == 'splice') {
                if (Array.isArray(res)) {
                    res.forEach(function (item) {
                        disableWatch(item);
                    });
                }
                else {
                    disableWatch(res);
                }
            }

            // 重新链接子元素
            linkArray(this);

            // 触发'change'事件
            bubble(meta, ['change', meta.key]);

            return res;
        };
    });

    /**
     * 对象定义protected属性
     * 属性不可枚举
     *
     * @inner
     * @param {Object} obj
     * @param {string} name 属性名称
     * @param {*=} value 属性指
     */
    function defProtectedProperty(obj, name, value) {
        Object.defineProperty(obj, name, {
            value: value,
            enumerable: false,
            configurable: true
        });
    }

    /**
     * 判断变量是否正在被监控
     *
     * @inner
     * @param {*} variable
     * @return {boolean}
     */
    function isWatching(variable) {
        variable = variable || {};
        return !!variable[META_KEY];
    }

    /**
     * 冒泡触发事件
     *
     * @inner
     * @param {Object} meta 元数据
     * @param {Array} 事件参数
     */
    function bubble(meta, args) {
        var key = args[1];
        do {
            args[1] = key;
            meta.emit.apply(meta, args);
            // 组合父节点的key
            if (meta.hasOwnProperty('key')) {
                key = meta.key + '.' + key;
            }
        }
        while(meta = meta.parent);
    }

    /**
     * 默认的set事件处理函数
     *
     * @inner
     * @param {string} key
     * @param {*} value 新值
     * @param {*} oldValue 旧值
     */
    function defaultSetterHandler(key, value, oldValue) {
        // 如果值不相同则触发change事件
        if (value !== oldValue) {
            bubble(this, ['change', key, value, oldValue]);
        }
    }

    /**
     * 监控子对象
     *
     * @inner
     * @param {Object} child 子对象
     * @param {Object} parentMeta 父对象的元数据
     * @param {string} key 子对象key
     */
    function watchChild(child, parentMeta, key) {
        if (enableWatch(child)) {
            child[META_KEY].parent = parentMeta;
            child[META_KEY].key = key;
        }
    }

    /**
     * 解除监控
     *
     * @inner
     * @param {*} variable
     */
    function disableWatch(variable) {
        if (!isWatching(variable)) {
            return;
        }

        delete variable[META_KEY];

        Object.keys(variable).forEach(function (key) {
            disableWatch(variable[key]);
        });

        if (Array.isArray(variable)) {
            Object.keys(arrayProxy).forEach(function (key) {
                delete variable[key];
            });
        }
    }

    /**
     * 链接数组
     * 管理子元素
     *
     * @inner
     * @param {Array} array
     */
    function linkArray(array) {
        var meta = array[META_KEY];
        array.forEach(function (item, index) {
            watchChild(item, meta, index);
        });
    }

    /**
     * 监控对象初始化
     *
     * @inner
     * @param {Object} obj
     */
    function initObject(obj) {
        var meta = obj[META_KEY];
        var values = meta.values = {};

        Object.keys(obj).forEach(function (key) {
            values[key] = obj[key];

            Object.defineProperty(obj, key, {
                set: function (value) {
                    // 不用闭包中的meta
                    // 防止已经disableWatch后意外触发
                    var meta = this[META_KEY];
                    var oldValue = values[key];
                    values[key] = value;
                    // 监控新的子对象
                    if (meta) {
                        meta.emit('set', key, value, oldValue);
                        watchChild(value, meta, key);
                    }
                },
                get: function () {
                    var meta = this[META_KEY];
                    if (meta) {
                        meta.emit('get', key, values[key]);
                    }
                    return values[key];
                }
            });

            watchChild(values[key], meta, key);
        });
    }

    /**
     * 监控数组初始化
     *
     * @inner
     * @param {Array} array
     */
    function initArray(array) {
        // 链接子元素
        linkArray(array);

        // 扩展数组方法
        Object.keys(arrayProxy).forEach(function (key) {
            defProtectedProperty(array, key, arrayProxy[key]);
        });
    }

    /**
     * 启动变量监控
     *
     * @inner
     * @parm {*} variable
     * @return {boolean}
     */
    function enableWatch(variable) {
        var init;

        if (isWatching(variable)) {
            return true;
        }
        else if (util.typeof(variable) == 'Object') {
            init = initObject;
        }
        else if (Array.isArray(variable)) {
            init = initArray;
        }
        else {
            return false;
        }

        var meta = {};

        Emitter.mixin(meta);

        defProtectedProperty(variable, META_KEY, meta);

        init(variable);

        meta.on('set', defaultSetterHandler);

        return true;
    }

    /**
     * 监控变量变化
     * 只支持对象或者数组
     *
     * @inner
     * @param {*} variable
     * @param {Function} callback
     */
    function watch(variable, callback) {
        if (callback 
            && enableWatch(variable)
        ) {
            variable[META_KEY].on('change', callback);
        }
    }

    var exports = {};

    /**
     * 监控变量变化
     * 只支持对象或者数组
     *
     * @public
     * @param {*} variable
     * @param {Function} callback
     */
    exports.watch = watch;

    /**
     * 启动变量监控
     *
     * @public
     * @param {*} variable
     * @return {boolean}
     */
    exports.enable = enableWatch;

    /**
     * 取消变量监控
     *
     * @public
     * @param {*} variable
     */
    exports.disable = disableWatch;

    return exports;
});
