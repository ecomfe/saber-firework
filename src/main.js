/**
 * @file main
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var View = require('./View');
    var Model = require('./Model');
    var Action = require('./Action');

    return {
        view: function (name) {
            return new View(name);
        },

        model: function (name) {
            return new Model(name);
        },

        action: function (name) {
            return new Action(name);
        }
    };

});
