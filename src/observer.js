/**
 * @file 变量监控
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var util = require('./util');
    var Emitter = require('saber-emitter');
    var extend = require('saber-lang/extend');
    var inherits = require('saber-lang/inherits');

    /**
     * 元数据key
     *
     * @const
     * @type {string}
     */
    var META_KEY = '__meta__';

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
            if (meta.key) {
                key = meta.key + '.' + key;
            }
        }
        while(meta = meta.parent);
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
        if (child = enableWatch(child)) {
            child[META_KEY].parent = parentMeta;
            child[META_KEY].key = key;
            parentMeta.values[key] = child;
        }
    }

    /**
     * 绑定代理对象的属性
     * 根据代理对象的元数据values
     * 进行属性的getter, setter设置
     *
     * @inner
     * @param {Object} proxy 代理对象
     */
    function bindProperty(proxy) {
        var meta = proxy[META_KEY];
        var values = meta.values;

        Object.keys(values).forEach(function (key) {
            Object.defineProperty(proxy, key, {
                enumerable: true,
                set: function (value) {
                    // 不用闭包中的meta
                    // 防止已经disableWatch后意外触发
                    var meta = this[META_KEY];
                    var oldValue = values[key];

                    values[key] = value;

                    if (meta) {
                        meta.emit('set', key, value, oldValue);
                        // 监控新的子对象
                        watchChild(value, meta, key);
                        disableWatch(oldValue);
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
     * 代理对象虚基类
     *
     * @constructor
     */
    function Proxy() {
        var meta = {};
        Emitter.mixin(meta);
        Object.defineProperty(this, META_KEY, {
            value: meta,
            enumerable: false,
            configurable: true
        });
    }

    /**
     * watch
     * 注册变量变化时的回调函数
     *
     * @public
     * @param {Function} callback
     */
    Proxy.prototype.watch = function (callback) {
        this[META_KEY].on('change', callback);
    };

    /**
     * 销毁代理对象
     *
     * @public
     */
    Proxy.prototype.dispose = function () {
        delete this[META_KEY];
    };

    /**
     * 对象监控代理
     *
     * @constructor
     */
    function ObjectProxy(obj) {
        Proxy.call(this);
        this[META_KEY].values = extend({}, obj || {});

        bindProperty(this);
    }

    inherits(ObjectProxy, Proxy);

    /**
     * 销毁代理对象
     * 返回监控的数据
     *
     * @public
     * @return {Object}
     */
    ObjectProxy.prototype.dispose = function () {
        var values = this[META_KEY];
        var res = {};
        Object.keys(values).forEach(function (key) {
            res[key] = disableWatch(values[key]);
        });
        Proxy.prototype.dispose.call(this);
        return res;
    };

    /**
     * 数组监控代理
     * 
     * @constructor
     */
    function ArrayProxy(array) {
        Proxy.call(this);
        array = array || [];
        this[META_KEY].values = array.slice();

        // 定义length
        Object.defineProperty(this, 'length', {
            enumerable: false,
            get: function () {
                return this[META_KEY] && this[META_KEY].values.length;
            }
        });

        bindProperty(this);
    }

    inherits(ArrayProxy, Proxy);

    // 将原始的数组方法复制到代理对象
    Object.keys(Array.prototype).forEach(function (key) {
        if (util.typeof(Array.prototype[key]) !== 'Function') {
            return;
        }

        ArrayProxy.prototype[key] = function () {
            var args = Array.prototype.slice.apply(arguments);
            return Array.prototype.apply(this[META_KEY].value, args);
        };
    });

    /**
     * 销毁代理对象
     * 返回监控的数据
     *
     * @public
     * @return {Array}
     */
    ArrayProxy.prototype.dispose = function () {
        var values = this[META_KEY];
        var res = [];
        values.forEach(function (item, index) {
            res[index] = disableWatch(item);
        });
        Proxy.prototype.dispose.call(this);
        return res;
    };

    // 需要特殊处理的数组方法
    // 在运行这些方法后需要对数组元素进行重新绑定
    var arrayProxyMethods = ['pop', 'push', 'shift', 'splice', 'unshift', 'sort', 'reverse'];

    arrayProxyMethods.forEach(function (name) {
        ArrayProxy.prototype[name] = function () {
            var meta = this[META_KEY];
            var len = this.length;

            // 解除子元素的绑定
            for (var i = 0; i < len; i++) {
                delete this[i];
            }

            var args = Array.prototype.slice.call(arguments);
            var res = Array.prototype[name].apply(meta.values, args);

            if (len > this.length || name == 'splice') {
                if (Array.isArray(res)) {
                    res = res.map(function (item) {
                        return disableWatch(item);
                    });
                }
                else {
                    res = disableWatch(res);
                }
            }

            // 重新绑定子元素
            bindProperty(this);

            // 触发'change'事件
            bubble(this[META_KEY], ['change', this[META_KEY].key]);

            return res;
        };
    });

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
     * 启动变量监控
     * 成功返回监控代理对象
     * 失败则返回false
     *
     * @inner
     * @parm {*} variable
     * @return {*}
     */
    function enableWatch(variable) {
        if (isWatching(variable)) {
            return variable;
        }
        else if (util.typeof(variable) == 'Object') {
            variable = new ObjectProxy(variable);
        }
        else if (Array.isArray(variable)) {
            variable = new ArrayProxy(variable);
        }
        else {
            return false;
        }

        variable[META_KEY].on('set', defaultSetterHandler);

        return variable;
    }

    /**
     * 解除监控
     * 返回监控的数据
     *
     * @inner
     * @param {*} variable
     * @return {*}
     */
    function disableWatch(variable) {
        if (!isWatching(variable)) {
            return variable;
        }

        return variable.dispose();
    }

    /**
     * 监控变量变化
     * 只支持对象或者数组
     * 返回监控代理对象
     *
     * @inner
     * @param {*} variable
     * @param {Function} callback
     * @return {*}
     */
    function watch(variable, callback) {
        if (callback 
            && (variable = enableWatch(variable))
        ) {
            variable.watch(callback);
        }

        return variable;
    }


    var exports = {};

    /**
     * 监控变量变化
     * 只支持对象或者数组
     * 返回监控代理对象
     *
     * @public
     * @param {*} variable
     * @param {Function} callback
     * @return {*}
     */
    exports.watch = watch;

    /**
     * 启动变量监控
     * 成功返回监控代理对象
     * 失败则返回false
     *
     * @public
     * @parma {*} variable
     * @return {*}
     */
    exports.enable = enableWatch;

    return exports;
});
