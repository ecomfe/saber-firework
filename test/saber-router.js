/**
 * @file saber-router mock
 * @author treelite(c.xinle@gmail.com)
 */

define('saber-router', function () {
    var exports = {};

    var methods = ['add', 'start', 'config', 'reset'];

    methods.forEach(function (name) {
        exports[name] = function () {};
    });

    return exports;
});
