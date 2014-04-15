/**
 * @file View
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var extend = require('saber-lang/extend');
    var dom = require('saber-dom');
    var etpl = require('etpl');
    var eventHelper = require('./event');

    var Abstract = require('./Abstract');

    function bindEvents(view) {
        // 绑定View事件
        var events = this.events || [];
        events.forEach(function (name) {
            view.on(name, events[name]);
        });

        // 绑定DOM事件
        var type;
        var selector;
        var fn;
        events = this.domEvents || {};
        Object.keys(events).forEach(function (name) {
            fn = events[name];
            name = name.split(':');
            type = name[0].trim();
            selector = name[1] ? name[1].trim() : undefined;
            view.attachEvent(view.main, type, selector, fn);
        });
    }

    function getTemplate(options) {
        var tpl = options.template;
        delete options.template;

        if (Array.isArray(tpl)) {
            tpl = tpl.join('\n\n');
        }

        return tpl;
    }

    function View(options) {
        Abstract.call(this);

        this.template = etpl.compile(getTemplate(options));

        extend(this, options);

        this.bindElements = [];
    }

    inherits(View, Abstract);

    View.prototype.beforeRender = function (ele) {
        this.main = ele;
        ele.className += ' ' + this.className;
    };

    View.prototype.render = function (data) {
        this.main.innerHTML = this.template.render(data);
    };

    View.prototype.ready = function () {
        bindEvents(this);
        this.emit('ready');
    };

    View.prototype.query = function (str) {
        return dom.query(str, this.main || document.body);
    };

    View.prototype.attachEvent = function (ele, type, selector, fn) {
        if (this.bindElements.indexOf(ele) < 0) {
            this.bindElements.push(ele);
        }
        eventHelper.on(ele, type, selector, fn);
    };

    View.prototype.detachEvent = function (ele, type, selector, fn) {
        eventHelper.off(ele, type, selector, fn);
    };

    View.prototype.dispose = function () {
        this.emit('dispose');
        this.bindElements.forEach(function (ele) {
            eventHelper.clear(ele);
        });
        this.main = null;
    };

    View.prototype.sleep = function () {
        this.emit('sleep');
    };

    View.prototype.wakeup = function () {
        this.emit('wakeup');
    };

    return View;
});
