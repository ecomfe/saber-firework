/**
 * @file Model for Rebas
 * @param treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var ajax = require('saber-ajax/ejson');
    var Resolver = require('saber-promise');
    var BaseClass = require('saber-mm/Model');

    /**
     * Model
     *
     * @constructor
     */
    function Model(options) {
        BaseClass.call(this, options);
    }

    inherits(Model, BaseClass);

    /**
     * 设置参数
     *
     * @public
     * @param {Object=} query 查询条件
     * @param {Object=} params 路径参数
     * @param {string=} path 路径
     */
    Model.prototype.set = function (query, params, path) {
        this.path = path || this.path;
        this.query = query || this.query;
        this.params = params || this.params;
    };

    /**
     * 数据填充
     *
     * @public
     */
    Model.prototype.fill = function () {};

    /**
     * 获取数据
     *
     * @public
     * @return {Promise}
     */
    Model.prototype.fetch = function () {
        var me = this;
        return ajax.get(this.path, this.query).then(
            function (data) {
                me.fill(data);
                return data;
            }
        );
    };

    // 注入基类
    require('../config').Model = Model;

    return Model;
});
