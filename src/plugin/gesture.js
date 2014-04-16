/**
 * @file 手势插件 借助Hammer提供手势事件注册
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Hammer = require('hammer');
    var eventHelper = require('../event');

    /**
     * 手势名称
     *
     * @inner
     * @type {Array.<string>}
     */
    var GESTURES = (function () {
            var res = [];
            Object.keys(Hammer.gestures).forEach(function (key) {
                res.push(Hammer.gestures[key].name);
            });
            return res;
        })();

    /**
     * 判断事件是否是手势
     *
     * @inner
     * @param {string} name
     * @return {boolean}
     */
    function isGestures(name) {
        var res = false;
        
        GESTURES.some(function (gesture) {
            return res = gesture.indexOf(name) === 0;
        });

        return res;
    }

    var plugin = {};  

    /**
     * 插件初始化
     *
     * @public
     */
    plugin.init = function () {
        // 使用全局代理的方式
        // 不单独处理事件注册
        Hammer(document.body);
    };

    /**
     * 事件检测
     * 判断是否由该插件来处理事件
     *
     * @public
     * @param {string} type 事件类型
     * @return {boolean}
     */
    plugin.detect = function (type) {
        // 不单独绑定事件
        return false;
    };

    /**
     * 事件绑定
     *
     * @public
     * @param {HTMLElement} ele DOM元素
     * @param {string} type 事件类型
     * @param {Function} fn 事件处理函
     */
    plugin.on = function (ele, type, fn) {};

    /**
     * 事件卸载
     *
     * @public
     * @param {HTMLElement} ele DOM元素
     * @param {string} type 事件类型
     * @param {Function} fn 事件处理函
     */
    plugin.off = function (ele, type, fn) {};

    // 注册插件
    eventHelper.register(plugin);
});
