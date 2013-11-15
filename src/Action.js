/**
 * @file 页面控制器
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {

    var Emitter = require('saber-emitter');
    var inherits = require('saber-lang/inherits');

    function Action(name) {
        this.name = name;
        Emitter.mixin(this);
    }

    /**
     * 继承
     *
     * @public
     * @param {function} subclass
     * @return {function}
     */
    Action.subClass = function (subClass) {
        return inherits(subClass, this);
    };

    return Action;
});
