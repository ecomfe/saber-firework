/**
 * @file 数据管理
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {

    function Model(name) {
        this.data = {};
        this.name = name;
    }

    /**
     * 暂存数据
     * 内存级别
     *
     * @public
     * @param {string} key
     * @param {*} value
     */
    Model.prototype.set = function (key, value) {
        this.data[key] = value;
    };

    /**
     * 存储数据
     * 使用localStorage
     *
     * @public
     * @param {string} key
     * @param {*} value
     */
    Model.prototype.storage = function (key, value) {
        localStorage.setItem(this.name + '-' + key, JSON.stringify(value));
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
        var res;

        if (key in this.data) {
            res = this.data[key];
        }
        else {
            var value = localStorage.getItem(this.name + '-' + key);
            if (value) {
                res = JSON.parse(value);
            }
        }

        return res;
    };

    return Model;
});
