/**
 * @file Model
 * @param treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
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
     * 获取数据
     *
     * @public
     * @param {Object} query 查询条件
     * @return {Promise}
     */
    Model.prototype.fetch = function (query) {
        return Resolver.resolved(query);
    };

    /**
     * 重新获取数据
     * 在被缓存的action被wakeup时调用
     *
     * @public
     * @param {Object} query 查询条件
     * @return {Promise}
     */
    Model.prototype.refetch = function (query) {
        return Resolver.resolved(query);
    };

    return Model;
});
