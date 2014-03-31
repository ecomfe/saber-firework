/**
 * @file main
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var extend = require('saber-lang/extend');
    var curry = require('saber-lang/curry');
    var dom = require('saber-dom');
    var etpl = require('etpl');

    var directive = require('./directive');
    var observer = require('./observer');
    var util = require('./util');

    /**
     * 默认根节点
     * 
     * @const
     * @type {string}
     */
    var DEFAULT_ROOT = 'body';
    
    function getTemplate(ele) {
        // TODO
        // 进行指令预处理
        
        return ele.innerHTML;
    }

    function render(vm) {
        var root = vm.main.cloneNode(false);
        root.innerHTML = vm.render(vm.data);

        // 指令处理
        directive.handle(vm, root);
        
        vm.main.parentNode.replaceChild(root, vm.main);
        vm.main = root;
    }

    function VM(options) {
        this.main = dom.query(options.ele || DEFAULT_ROOT);
        this.data = extend({}, options.data || {});
        this.methods = extend({}, options.methods || {});
        this.render = etpl.compile(getTemplate(this.main));

        var repaint = curry(render, this);
        observer.watch(this.data, curry(util.setTimeout, repaint));

        render(this);
    }

    VM.prototype.getValue = function (key) {
        if (this.data.hasOwnProperty(key)) {
            return this.data[key];
        }
        else {
            var fn = new Function('return this.' + key);
            return fn.call(this.data);
        }
    };

    VM.prototype.setValue = function (key, value) {
        if (this.data.hasOwnProperty(key)) {
            this.data[key] = value;
        }
        else {
            var fn = new Function('this.' + key + '=' + value);
            fn.call(this.data);
        }
    };

    return VM;

});
