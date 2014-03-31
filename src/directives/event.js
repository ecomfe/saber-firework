/**
 * @file event 指令
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var bind = require('saber-lang/bind');

    var REG_PARAMS = /\s*\(([^)]*)\)/;
    var REG_PARAM_SPLIT = /\s*,\s*/;

    function parseAttribute(str) {
        var res = {};
        str = str.split(';');
        str.forEach(function (item) {
            item = item.trim();
            if (!item) {
                return;
            }

            item = item.split(':');
            if (item.length == 2) {
                var args = [];
                var methodName = item[1]
                        .trim()
                        .replace(
                            REG_PARAMS, 
                            function ($1, $2) {
                                if ($2) {
                                    args = $2.split(REG_PARAM_SPLIT);
                                }
                                return '';
                            }
                        );

                res[item[0].trim()] = {
                    name: methodName,
                    args: args
                };
            }
        });

        return res;
    }

    var exports = {};

    exports.handle = function (ele, value, vm) {
        var events = parseAttribute(value);

        Object.keys(events).forEach(function (eventName) {
            var item = events[eventName];
            var handler = vm.methods[item.name];
            if (handler) {
                item.args.splice(0, 0, handler, vm.data);
                ele.addEventListener(
                    eventName,
                    bind.apply(null, item.args),
                    false
                );
            }
        });

    };

    return exports;
});
