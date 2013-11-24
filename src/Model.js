/**
 * @file 数据管理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var Emitter = require('saber-emitter');

    function Model(name) {
        this.data = {};
        this.name = name;
        Emitter.mixin(this);
    }

    function getStorage(level) {
        var res;

        switch (level) {
            case 'session':
                res = sessionStorage;
                break;
            case 'local':
                res = localStorage;
                break;
        }
        return res;
    }

    /**
     * 继承
     *
     * @public
     * @param {function} subclass
     * @return {function}
     */
    Model.subClass = function (subClass) {
        return inherits(subClass, this);
    };

    /**
     * 存储数据
     *
     * @public
     * @param {string} key
     * @param {*} value
     * @param {string} level 存储级别 默认为内存级别，还可选`session`, `local`
     */
    Model.prototype.set = function (key, value, level) {
        if (value === undefined) {
            return;
        }

        var storage = getStorage(level);
        if (storage) {
            storage.setItem(this.name + '-' + key, JSON.stringify(value));
        }
        else {
            this.data[key] = value;
        }

        return value;
    };

    /**
     * 删除数据
     *
     * @public
     * @param {string} key
     * @param {string} level 存储级别 默认为内存级别，还可选`session`, `local`
     */
    Model.prototype.remove = function (key, level) {
        if (!key) {
            return;
        }

        var storage = getStorage(level);

        if (storage) {
            storage.removeItem(this.name + '-' + key);
        }
        else if (key in this.data) {
            delete this.data[key];
        }
    };

    /**
     * 清除数据
     *
     * @public
     * @param {string} level 存储级别 默认为内存级别，还可选`session`, `local`
     */
    Model.prototype.clear = function (level) {
        var storage = getStorage(level);
        if (storage) {
            storage.clear();
        }
        else {
            this.data = {};
        }
    };

    /**
     * 获取数据
     * 先从内存中获取 再从localStorage中获取
     *
     * @public
     * @param {string} key
     * @return {*}
     */
    Model.prototype.get = function (key) {
        if (!key) {
            return;
        }

        var res;

        if (key in this.data) {
            res = this.data[key];
        }
        else {
            key = this.name + '-' + key;
            var value = sessionStorage.getItem(key);

            if (value === null) {
                value = localStorage.getItem(key);
            }
            if (value != 'undefined') {
                res = JSON.parse(value);
            }
        }

        return res;
    };

    return Model;
});
