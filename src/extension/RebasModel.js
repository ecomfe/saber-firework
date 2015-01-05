/**
 * @file Model for Rebas
 * @param treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var ajax = require('saber-ajax');
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
     * 数据填充
     *
     * @public
     */
    Model.prototype.fill = function () {};

    /**
     * 获取数据
     *
     * @public
     * @param {string} url
     * @return {Promise}
     */
    Model.prototype.fetch = function (query, url) {
        var me = this;
        return ajax.get(url).then(
            function (data) {
                data = JSON.parse(data);
                me.fill(data);
                return data;
            }
        );
    };

    // 注入基类
    require('../config').Model = Model;

    return Model;
});
