/**
 * @file app
 */

define(function (require) {
    var Resolver = require('saber-promise');
    var firework = require('saber-firework');

    // 添加手势事件支持
    require('saber-firework/plugin/gesture');

    Resolver.disableExceptionCapture();

    firework.load({path: '/', action: require('./list')});

    firework.start('todoapp');
});
