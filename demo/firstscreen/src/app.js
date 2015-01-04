/**
 * @file app
 */

define(function (require) {
    var Resolver = require('saber-promise');
    var firework = require('saber-firework');

    // 启动首屏渲染
    require('saber-firework/extension/firstscreen');

    Resolver.disableExceptionCapture();

    firework.load({path: '/', action: require('./index')});
    firework.load({path: '/detail', action: require('./detail')});

    firework.start('viewport');
});
