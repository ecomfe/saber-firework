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
    }

    /**
     * 获取数据
     *
     * @public 
     */
    Model.prototype.fetch = function () {
        return Resolver.resolved({});
    };

    inherits(Model, Abstract);

    return Model;
});
