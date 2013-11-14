/**
 * @file 视图控制
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var format = require('saber-string/format');
    var Emitter = require('saber-emitter');

    function toClassName(str) {
        return str.replace(/[A-Z]/g, function ($1) {
            return '-' + $1.toLowerCase();
        });
    }

    function addClass(ele, className) {
        ele.className += ' ' + className;
    }

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

    function View(name) {
        this.name = name;
        Emitter.mixin(this);
    }

    /**
     * 渲染视图
     *
     * @public
     * @param {HTMLElement} main 视图容器元素
     * @param {Object} template 模版
     * @param {Object} data 数据
     */
    View.prototype.render = function (main, template, data) {
        this.main = main;
        this.template = template;

        if (template && template.main) {
            main.innerHTML = format(template.main, data);
        }

        addClass(main, toClassName(this.name));
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
