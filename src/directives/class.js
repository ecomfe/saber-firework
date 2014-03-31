/**
 * @file class 指令
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {

    function parseAttribute(str) {
        var res = {};
        var str = str.split(',');
        str.forEach(function (item) {
            if (!item) {
                return;
            }

            item = item.trim();
            item = item.split(':');
            res[item[0].trim()] = item[1].trim();
        });

        return res;
    }

    var exports = {};

    exports.handle = function (ele, value, vm) {
        var items = parseAttribute(value);

        var name;
        var clsNames = [];
        Object.keys(items).forEach(function (clsName) {
            name = items[clsName];

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
