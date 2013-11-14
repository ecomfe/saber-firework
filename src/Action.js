/**
 * @file 页面控制器
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {

    var Emitter = require('saber-emitter');

    function Action(name) {
        this.name = name;
        Emitter.mixin(this);
    }

    return Action;
});
