/**
 * @file 启用首屏渲染
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var globalConfig = require('../config');
    globalConfig.firstScreen = true;
    globalConfig.initialDataKey = 'rebas';
});
