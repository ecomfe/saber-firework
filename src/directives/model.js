/**
 * @file model指令
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var encodeHTML = require('saber-string/encodeHTML');

    var exports = {};

    /**
     * 指令处理器集合
     * 根据DOM节点类型划分
     *
     * @type {Object}
     */
    var handlers = {};

    /**
     * checkbox元素处理器
     *
     * @inner
     * @param {HTMLElement} ele DOM接点
     * @param {string} name 绑定的变量名称
     * @param {VM} vm ViewModel
     */
    handlers.checkbox = function (ele, name, vm) {
        ele.checked = vm.getValue(name);
        ele.addEventListener(
            'click', 
            function () {
                vm.setValue(name, this.checked);
            }, 
            false
        );
    };

    /**
     * radio元素处理器
     *
     * @inner
     * @param {HTMLElement} ele DOM接点
     * @param {string} name 绑定的变量名称
     * @param {VM} vm ViewModel
     */
    handlers.radio = handlers.checkbox;

    /**
     * 输入框处理器
     *
     * @inner
     * @param {HTMLElement} ele DOM接点
     * @param {string} name 绑定的变量名称
     * @param {VM} vm ViewModel
     */
    handlers.text = function (ele, name, vm) {
        ele.value = vm.getValue(name);
        ele.addEventListener(
            'change',
            function () {
                vm.setValue(name, this.value.trim());
            },
            false
        );
        ele.addEventListener(
            'keypress',
            function (e) {
                if (e.keyCode == 13) {
                    this.blur();
                }
            },
            false
        );
    };

    /**
     * 默认处理器
     *
     * @inner
     * @param {HTMLElement} ele DOM接点
     * @param {string} name 绑定的变量名称
     * @param {VM} vm ViewModel
     */
    handlers.default = function (ele, name, vm) {
        ele.innerHTML = encodeHTML(vm.getValue(name));
    };

    /**
     * 指令处理
     *
     * @public
     * @param {HTMLElement} ele DOM接点
     * @param {string} value 指令属性值
     * @param {VM} vm ViewModel
     */
    exports.handle = function(ele, value, vm) {
        var tagName = ele.tagName.toLowerCase();
        if (tagName == 'input') {
            tagName = ele.type || 'text';
        }

        var handler = handlers[tagName];
        if (!handler) {
            handler = handlers.default;
        }

        handler(ele, value, vm);
    };

    return exports;
});
