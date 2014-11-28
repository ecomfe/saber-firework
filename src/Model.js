/**
 * @file Model
 * @param treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var ajax = require('saber-ajax');
    var Resolver = require('saber-promise');
    var Abstract = require('./Abstract');

    /**
     * Model
     *
     * @constructor
     */
    function Model(options) {
        Abstract.call(this, options);
        this.init();
    }

    inherits(Model, Abstract);

    /**
     * 填充数据
     *
     * @public
     * @param {*} data
     */
    Model.prototype.fulfill = function () {};

    /**
     * 获取数据
     *
     * @public
     * @param {string} url
     * @return {Promise}
     */
    Model.prototype.fetch = function (url) {
        var me = this;
        return ajax.get(url).then(
            function (data) {
                data = JSON.parse(data);
                me.fulfill(data);
                return data;
            }
        );
    };

    /**
     * 重新获取数据
     * 在被缓存的action被wakeup时调用
     *
     * @public
     * @param {Object} query 查询条件
     * @return {Promise}
     */
    Model.prototype.refetch = function (url, query) {
        return Resolver.resolved(query);
    };

    return Model;
});
