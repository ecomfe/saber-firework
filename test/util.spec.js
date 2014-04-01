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

        describe('.parseCmd()', function (){

            it('should return cmd\'s name, action and filter', function () {
                var str = 'keypress : hello() | 13';

                var cmds = util.parseCmd(str);

                expect(cmds.length).toBe(1);
                expect(cmds[0].name).toEqual('keypress');
                expect(cmds[0].action).toEqual('hello()');
                expect(cmds[0].filter).toEqual('13');
            });

            it('should return multi cmds', function () {
                var str = 'keypress: hello() | 13, click: add | true';

                var cmds = util.parseCmd(str);

                expect(cmds.length).toBe(2);
                expect(cmds[0].name).toEqual('keypress');
                expect(cmds[0].action).toEqual('hello()');
                expect(cmds[0].filter).toEqual('13');
                expect(cmds[1].name).toEqual('click');
                expect(cmds[1].action).toEqual('add');
                expect(cmds[1].filter).toEqual('true');
            });

            it('should only return name when action and filter were empty', function () {
                var str = 'keypress: | ';
                
                var cmds = util.parseCmd(str);

                expect(cmds.length).toBe(1);
                expect(cmds[0].name).toEqual('keypress');
                expect(cmds[0].action).toBeUndefined();
                expect(cmds[0].filter).toBeUndefined();
            });

            it('should return name and action when filter was empty', function () {
                var str = 'keypress: hello | ';
                
                var cmds = util.parseCmd(str);

                expect(cmds.length).toBe(1);
                expect(cmds[0].name).toEqual('keypress');
                expect(cmds[0].action).toEqual('hello');
                expect(cmds[0].filter).toBeUndefined();
            });

        });

        describe('.defineProperties()', function () {

            it('should define properties', function () {
                var obj = {};

                util.defineProperties(obj, {
                    name: {
                        value: 'treelite'
                    },
                    age: {
                        value: 10
                    }
                });

                expect(obj.hasOwnProperty('name')).toBeTruthy();
                expect(obj.name).toEqual('treelite');
                expect(obj.hasOwnProperty('age')).toBeTruthy();
                expect(obj.age).toBe(10);
            });

            it('should ignore the same properity', function () {
                var obj = {name: 'cxl'};

                util.defineProperties(obj, {
                    name: {
                        value: 'treelite'
                    },
                    age: {
                        value: 10
                    }
                });

                expect(obj.hasOwnProperty('name')).toBeTruthy();
                expect(obj.name).toEqual('cxl');
                expect(obj.hasOwnProperty('age')).toBeTruthy();
                expect(obj.age).toBe(10);
            });

            it('should define properity enumerable and configurable', function () {
                var obj = {};
                
                util.defineProperties(obj, {
                    name: {
                        value: 'treelite'
                    }
                });

                expect(Object.keys(obj).length).toBe(1);

                var configurable = true;
                try {
                    delete obj.name;
                }
                catch (e) {
                    configurable = false;
                }
                finally {
                    expect(configurable).toBeTruthy();
                }
            });

        });

    });

});
