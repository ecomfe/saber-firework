/**
 * @file 视图控制
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var Emitter = require('saber-emitter');

    /**
     * 驼峰转化为class样式
     *
     * @inner
     */
    function toClassName(str) {
        return str.replace(/[A-Z]/g, function ($1) {
            return '-' + $1.toLowerCase();
        });
    }

    /**
     * 添加className
     *
     * @inner
     */
    function addClass(ele, className) {
        ele.className += ' ' + className;
    }

    /**
     * View
     *
     * @Constructor
     */
    function View(name) {
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
    View.subClass = function (subClass) {
        return inherits(subClass, this);
    };

    /**
     * 渲染视图
     *
     * @public
     * @param {HTMLElement} main 视图容器元素
     */
    View.prototype.render = function (main) {
        this.main = main;
        addClass(main, toClassName(this.className || this.name));
    };

    /**
     * 销毁视图
     *
     * @public
     */
    View.prototype.dispose = function () {
        this.main = null;
    };

    return View;
});
