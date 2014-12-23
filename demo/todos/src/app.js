/**
 * @file app
 */

define(function (require) {
    var Resolver = require('saber-promise');
    var firework = require('saber-firework');

    Resolver.disableExceptionCapture();

    firework.load({path: '/demo/todos/index.html', action: require('./list')});

    firework.start('todoapp');
});
