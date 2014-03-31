/**
 * @file util spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var util = require('saber-firework/util');

    describe('util', function () {

        it('.typeof() should return variable\'s type', function () {
            var fn = function () {};
            var num = 123;
            var str = '';
            var obj = {};
            var arr = [];

            expect(util.typeof(fn)).toEqual('Function');
            expect(util.typeof(num)).toEqual('Number');
            expect(util.typeof(str)).toEqual('String');
            expect(util.typeof(obj)).toEqual('Object');
            expect(util.typeof(arr)).toEqual('Array');
        });

        describe('.setTimeout()', function () {

            it ('should execute callback async', function (done) {
                var fn = jasmine.createSpy('fn');

                util.setTimeout(fn);

                setTimeout(function () {
                    expect(fn.calls.count()).toBe(1);
                    done();
                }, 0);
            });

            it ('should exclude the same callback', function (done) {
                var fn = jasmine.createSpy('fn');
                var bar = jasmine.createSpy('bar');

                util.setTimeout(fn);
                util.setTimeout(bar);
                util.setTimeout(fn);

                setTimeout(function () {
                    expect(fn.calls.count()).toBe(1);
                    expect(bar.calls.count()).toBe(1);
                    done();
                }, 0);
            });

            it ('should execute nested callback', function (done) {
                var fn = jasmine.createSpy('fn');

                util.setTimeout(function () {
                    util.setTimeout(fn);
                });

                setTimeout(function () {
                    expect(fn.calls.count()).toBe(0);
                    setTimeout(function () {
                        expect(fn.calls.count()).toBe(1);
                        done();
                    }, 0);
                }, 0);
            });

        });

    });

});
