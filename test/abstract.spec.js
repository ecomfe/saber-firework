/**
 * @file Abstract Spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Emitter = require('saber-emitter');
    var Abstract = require('saber-firework/Abstract');

    describe('Abstract', function () {

        it('should mixin Emitter', function () {
            var abs = new Abstract();

            expect(typeof abs.on).toEqual('function');
            expect(typeof abs.emit).toEqual('function');
        });

        it('should extend options', function () {
            var abs = new Abstract({hello: {}});

            expect(abs.hasOwnProperty('hello')).toBeTruthy();
        });

        it('should support events', function () {
            var fo = Emitter.mixin({});
            var count = 0;
            var fn = function () {
                    count++;
                    expect(this).toBe(abs);
                };
            var abs = new Abstract({
                    events: {
                        'init': fn,
                        'fo:init': fn
                    },
                    fo: fo
                });
            abs.init();

            abs.emit('init');
            abs.fo.emit('init');

            expect(count).toBe(2);
        });

    });
});
