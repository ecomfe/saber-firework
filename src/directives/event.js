/**
 * @file event 指令
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var bind = require('saber-lang/bind');
    var util = require('../util');

    var REG_PARAMS = /\s*\(([^)]*)\)/;
    var REG_PARAM_SPLIT = /\s*,\s*/;

    var exports = {};

    /**
     * 键盘事件包装
     * 支持自动过滤keyCode
     *
     * @inner
     * @param {Function} handler
     * @param {string} keyCode
     * @return {Function}
     */
    function wrapKeyHanlder(handler, keyCode) {
        if (!keyCode) {
            return handler;
        }

        return function () {
            var args = Array.prototype.slice.call(arguments);
            var e = args[args.length - 1];

            if (e.keyCode == keyCode) {
                handler.apply(this, args);
            }
        }
    }

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

        cmds.forEach(function (cmd) {

            // 处理事件函数参数
            // e.g: click:add(123)
            cmd.action = cmd.action.replace(
                REG_PARAMS, 
                function ($1, $2) {
                    if ($2) {
                        cmd.args = $2.split(REG_PARAM_SPLIT);
                    }
                    return '';
                }
            );

            var handler = vm.methods[cmd.action];
            if (handler) {

                // 如果是键盘事件
                // 则进行按键过滤包装
                if (cmd.name.indexOf('key') == 0) {
                    handler = wrapKeyHanlder(handler, cmd.filter);
                }

                var args = cmd.args || [];
                // 构建apply的参数
                // * 修正this指针
                // * 传递事件参数
                args.splice(0, 0, handler, vm.data);

                ele.addEventListener(
                    cmd.name,
                    bind.apply(null, args),
                    false
                );
            }

        });

    };

    return exports;
});
