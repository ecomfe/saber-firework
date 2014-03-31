/**
 * @file model指令
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var encodeHTML = require('saber-string/encodeHTML');

    var exports = {};

    var handlers = {};

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

    handlers.radio = handlers.checkbox;

    handlers.default = function (ele, name, vm) {
        ele.innerHTML = encodeHTML(vm.getValue(name));
    };

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
