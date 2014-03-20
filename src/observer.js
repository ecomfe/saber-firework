/**
 * @file 变量监控
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var util = require('./util');
    var Emitter = require('saber-emitter');

    var META_KEY = '__meta__';

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
            enumerable: false
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
            if (meta.key) {
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
        if (value !== oldValue) {
            bubble(this, ['change', key, value, oldValue]);
        }
    }

    /**
     * 监控对象初始化
     *
     * @inner
     * @param {Object} obj
     *
     */
    function initObject(obj) {
        var meta = obj[META_KEY];
        var values = meta.values = {};

        Object.keys(obj).forEach(function (key) {
            values[key] = obj[key];

            Object.defineProperty(obj, key, {
                set: function (value) {
                    var oldValue = values[key];
                    meta.emit('set', key, value, oldValue);
                    values[key] = value;

                    if (enableWatch(value)) {
                        value[META_KEY].parent = meta;
                        value[META_KEY].key = key;
                    }
                },
                get: function () {
                    meta.emit('get', key, values[key]);
                    return values[key];
                }
            });

            var value = values[key];
            if (enableWatch(value)) {
                value[META_KEY].parent = meta;
                value[META_KEY].key = key;
            }

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
     * 监控数组初始化
     *
     * @inner
     * @param {Array} array
     */
    function initArray(array) {
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
     * @parma {*} variable
     * @return {boolean}
     */
    exports.enable = enableWatch;

    return exports;
});
