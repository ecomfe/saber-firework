/**
 * @file Abstract
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Emitter = require('saber-emitter');

    function Abstract() {
        Emitter.mixin(this);
    }

    return Abstract;

});
