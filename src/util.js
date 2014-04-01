/**
 * @file util
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {
    var exports = {};

    /**
     * 获取变量类型
     *
     * @public
     * @param {*} a
     * @return {string}
     */
    exports.typeof = function (a) {
        return Object.prototype.toString.call(a).slice(8, -1);
    };

    /**
     * 解析命令字符串
     * name: action | filter, ...
     *
     * @public
     * @param {string} str
     * @return {Array}
     */
    exports.parseCmd = function (str) {
        var res = [];

        str = str.split(',');
        str.forEach(function (item) {
            if (!item) {
                return;
            }
            item = item.trim();
            item = item.split(':');
            var cmd = {
                    name: item[0].trim()
                };

            if (item[1]) {
                item = item[1].trim();
                item = item.split('|');
                if (item[0]) {
                    cmd.action = item[0].trim();
                }
                if (item[1]) {
                    cmd.filter = item[1].trim();
                }
            }

            res.push(cmd);
        });

        return res;
    };

    /**
     * 延迟执行
     * setTimeout 0ms
     * 会对回调函数进行去重
     * 较`nextTick`，在用于触发页面渲染时延迟越大越好
     *
     * @public
     * @param {function} callback
     */
    exports.setTimeout = (function () {

        var callbacks = [];

        function callback() {
            var fns = callbacks.splice(0, callbacks.length);
            fns.forEach(function (fn) {
                fn();
            });
        }

        function addCallback(fn) {
            if (callbacks.indexOf(fn) < 0) {
                callbacks.push(fn);
            }
        }

        return function (fn) {
            addCallback(fn);
            setTimeout(
                function () {
                    callback();
                }, 
                0
            );
        };

    })();

    /**
     * 定义对象属性
     * 不会覆盖已有的同名属性
     * 属性默认可删除，可枚举
     *
     * @public
     * @param {Object} obj
     * @param {Object} properties
     */
    exports.defineProperties = function (obj, properties) {
        var item;
        var defaultOption = {
                configurable: true, 
                enumerable: true
            };

        Object.keys(properties).forEach(function (key) {
            if (obj.hasOwnProperty(key)) {
                delete properties[key];
                return;
            }

            item = properties[key];
            Object.keys(defaultOption).forEach(function (k) {
                if (!item.hasOwnProperty(k)) {
                    item[k] = defaultOption[k];
                }
            });
        });

        Object.defineProperties(obj, properties);
    };


    return exports;
});
