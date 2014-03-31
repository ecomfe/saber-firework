/**
 * @file 指令处理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    /**
     * 指令DOM属性前缀
     *
     * @const
     * @type {string}
     */
    var ATTR_PREFIX = 'c';

    /**
     * 指令集合
     *
     * @type {Object}
     */
    var directives = {};

    var exports = {};

    function eachDirective(callback) {
        Object.keys(directives).forEach(function (name) {
            callback(name, directives[name]);
        });
    }

    /**
     * 根据DOM自定义属性获取元素
     *
     * @inner
     * @param {HTMLElement} root 根节点
     * @param {string} name 属性名称
     * @return {Array}
     */
    function getElements(root, name) {
        var eles;

        name = ATTR_PREFIX + '-' + name;
        eles = root.querySelectorAll('[' + name + ']');
        return Array.prototype.slice.call(eles);
    }

    /**
     * 获取自定义属性
     *
     * @inner
     * @param {HTMLElement} ele
     * @param {string} name
     * @return {string}
     */
    function getAttribute(ele, name) {
        return ele.getAttribute(ATTR_PREFIX + '-' + name);
    }

    /**
     * 指令预处理
     * 在HTML模版生成阶段对模版进行处理
     *
     * @public
     * @param {VM} vm ViewModel
     * @param {HTMLElement} root
     */
    exports.preHandle = function (vm, root) {
        eachDirective(function (name, handler) {
            var attributeName = handler.attributeName || name;
            if (handler.preHandle) {
                handler.preHandle(vm, getElements(root, attributeName));
            }
        });
    };

    /**
     * 指令处理
     * 在完成模版渲染后处理
     *
     * @public
     * @param {VM} vm ViewModel
     * @param {HTMLElement} root
     */
    exports.handle = function (vm, root) {
        eachDirective(function (name, handler) {
            var attributeName = handler.attributeName || name;
            if (handler.handle) {
                getElements(root, attributeName).forEach(function (ele) {
                    handler.handle(ele, getAttribute(ele, attributeName), vm);
                });
            }
        });
    };

    /**
     * 指令注册
     *
     * @public
     * @param {string} name 指令名称
     * @param {object} handler 指令处理器
     */
    exports.register = function (name, handler) {
        if (directives[name]) {
            throw new Error('directive ' + name + ' duplicated');
        }
        else {
            directives[name] = handler;
        }
    };
    
    /**
     * 设置指令属性前缀
     *
     * @public
     * @param {string} str
     */
    exports.setPrefix = function (str) {
        if (str) {
            ATTR_PREFIX = str;
        }
    };

    // 载入默认指令
    exports.register('model', require('./directives/model'));
    exports.register('event', require('./directives/event'));
    exports.register('class', require('./directives/class'));

    return exports;
});
