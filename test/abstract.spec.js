/**
 * @file Abstract Spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Abstract = require('saber-firework/Abstract');

    describe('Abstract', function () {

        it('mixin Emitter', function () {
            var abs = new Abstract();

            expect(typeof abs.on).toEqual('function');
            expect(typeof abs.emit).toEqual('function');
        });

    });
});
