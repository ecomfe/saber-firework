/**
 * @file Model
 * @param treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var inherits = require('saber-lang/inherits');
    var extend = require('saber-lang/extend');
    var Resolver = require('saber-promise');
    var Abstract = require('./Abstract');

    function Model(options) {
        Abstract.call(this);

        extend(this, options);
    }

    Model.prototype.fetch = function () {
        return Resolver.resolved({});
    }

    inherits(Model, Abstract);

    return Model;
});
