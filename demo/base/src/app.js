/**
 * @file app
 */

define(function (require) {
    var Resolver = require('saber-promise');
    var firework = require('saber-firework');

    Resolver.disableExceptionCapture();

    firework.load({path: '/demo/base/index.html', action: require('./index')});
    firework.load({path: '/demo/base/detail', action: require('./detail')});

    firework.start('viewport');
});
