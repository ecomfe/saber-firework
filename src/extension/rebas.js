/**
 * @file Rebas扩展
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var globalConfig = require('../config');

    // 启动首评渲染
    globalConfig.firstScreen = true;
    // 设置首屏初始化变量名
    globalConfig.initialDataKey = 'rebas';

    // 设置路由器
    var router = require('saber-router');
    router.controller(require('saber-router/controller/popstate'));
    globalConfig.router = router;

    // 设置默认的Model基类
    globalConfig.Model = require('./RebasModel');
});
