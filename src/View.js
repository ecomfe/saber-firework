/**
 * @file 视图控制
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var dom = require('saber-dom');
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
     * 删除class
     *
     * @inner
     */
    function removeClassName(ele, className) {
        var cls = ele.className.split(/\s+/);

        for (var i = 0, item; item = cls[i]; i++) {
            if (item == className) {
                cls.splice(i, 1);
                i--;
            }
        }

        ele.className = cls.join(' ');
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
     * @param {HTMLElement|string} main 视图容器元素
     * @param {Object} template 模版
     * @param {Object} data 数据
     */
    View.prototype.render = function (main, template, data) {
        if (typeof main == 'string' || main instanceof String) {
            main = dom.query(main);
        }

        this.main = main;
        this.template = template;

        addClass(main, toClassName(this.className || this.name));
    };

    /**
     * 销毁视图
     *
     * @public
     */
    View.prototype.dispose = function () {
        var className = toClassName(this.name);

        removeClassName(this.main, className);
        this.main = null;
    };

    return View;
});
