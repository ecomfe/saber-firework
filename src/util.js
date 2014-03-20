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

    return exports;
});
