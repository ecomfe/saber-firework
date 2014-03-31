/**
 * @file class 指令
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var util = require('../util');

    var exports = {};

    /**
     * 指令处理
     *
     * @public
     * @param {HTMLElement} ele DOM接点
     * @param {string} value 指令属性值
     * @param {VM} vm ViewModel
     */
    exports.handle = function (ele, value, vm) {
        var cmds = util.parseCmd(value);

        var name;
        var clsName;
        var clsNames = [];
        cmds.forEach(function (cmd) {
            name = cmd.action;
            clsName = cmd.name;

            // 如果是`true`或者`false`
            // 不再从vm中获取数据判断
            if (name == 'true' || name == 'false') {
                name == 'true' && clsNames.push(clsName);
            }
            else if (!!vm.getValue(name)) {
               clsNames.push(clsName);
            }
        });

        if (clsNames.length > 0) {
            ele.className += clsNames.join(' ');
        }
    };

    return exports;

});
