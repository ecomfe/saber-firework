/**
 * @file oberver spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    
    var observer = require('saber-firework/observer');

    describe('observer', function () {

        describe('.enable', function () {

            it('should return true when argument is Object or Array', function () {
                expect(observer.enable({})).toBeTruthy();
                expect(observer.enable([])).toBeTruthy();
            });

            it('should return false when argument is not Object and Array', function () {
                expect(observer.enable('str')).toBeFalsy();
                expect(observer.enable(123)).toBeFalsy();
                expect(observer.enable(true)).toBeFalsy();
                expect(observer.enable(undefined)).toBeFalsy();
                expect(observer.enable(null)).toBeFalsy();
                expect(observer.enable(new Date())).toBeFalsy();
                expect(observer.enable(new String('xxx'))).toBeFalsy();
                expect(observer.enable(new Number(111))).toBeFalsy();
                expect(observer.enable(new Boolean(true))).toBeFalsy();
            });

            it('should add meta data', function () {
                var a = {};
                var b = {};
                observer.enable(a);
                expect(a.__meta__).not.toBeUndefined();
                expect(b.__meta__).toBeUndefined();
            });

            it('should not change prototype', function () {
                var a = {};
                var b = [];

                observer.enable(a);
                expect(a instanceof Object).toBeTruthy();

                observer.enable(b);
                expect(b instanceof Array).toBeTruthy();
            });

            it('should set meta data is not enumerable', function () {
                var a = {name: 'treelite'};
                observer.enable(a);
                expect(Object.keys(a).length).toBe(1);
                expect(Object.keys(a)[0]).toEqual('name');
            });

        });

        describe('.disable', function () {
           
            it('should remove meta data', function () {
                var a = {name: 'treelite'};
                observer.enable(a);
                observer.disable(a);

                expect(a.__meta__).toBeUndefined();
                expect(a.name).toEqual('treelite');
                a.name = 'cxl';
                expect(a.name).toEqual('cxl');
            });

            it('should remove nested meta data', function () {
                var a = {custom: {name: 'treelite'}};
                observer.enable(a);
                observer.disable(a);

                expect(a.__meta__).toBeUndefined();
                expect(a.custom.__meta__).toBeUndefined();
            });

        });

        describe('.watch', function () {

            it('should be a function', function () {
                expect(Object.prototype.toString.call(observer.watch)).toEqual('[object Function]');
            });

            describe('object', function () {

                it('should pass', function (done) {
                    var obj = {name: 'treelite'};
                    var newName = 'cxl';

                    observer.watch(obj, function (key, value) {
                        expect(key).toEqual('name');
                        expect(value).toEqual(newName);
                        done();
                    });

                    obj.name = newName;
                });

                it('should pass when object is nested', function (done) {
                    var obj = {sub: {name: 'treelite'}};
                    var newName = 'cxl';

                    observer.watch(obj, function (key, value) {
                        expect(key).toEqual('sub.name');
                        expect(value).toEqual(newName);
                        done();
                    });

                    obj.sub.name = newName;
                });

                it('should watch new object property', function (done) {
                    var obj = {sub: ''};
                    var newName = 'cxl';
                    var i = 0;

                    observer.watch(obj, function (key, value) {
                        i++;
                        if (i == 2) {
                            expect(key).toEqual('sub.name');
                            expect(value).toEqual(newName);
                            done();
                        }
                    });

                    obj.sub = {name: 'treelite'};
                    obj.sub.name = newName;
                });

            });

            describe('array', function ()  {

                it('should watch nested array', function (done) {
                    var arr = [123, [{name: 'treelite'}]];
                    var newName = 'cxl';

                    observer.watch(arr, function (key) {
                        expect(key).toEqual('1.0.name');
                        expect(arr[1][0].name).toEqual(newName);
                        done();
                    });

                    arr[1][0].name = newName;
                });

                it('should watched after call `push`', function (done) {
                    var arr = [1, 2, 3];

                    observer.watch(arr, function () {
                        expect(arr.length).toBe(4);
                        expect(arr[3]).toBe(4);
                        done();
                    });

                    arr.push(4);
                });

                it('should watch new data after call `push`', function (done) {
                    var arr = [1, 2];
                    var obj = {name: 'treelite'};
                    var newName = 'cxl';
                    var i = 0;

                    observer.watch(arr, function (key) {
                        i++;
                        expect(arr.length).toBe(3);
                        if (i == 2) {
                            expect(key).toEqual('2.name');
                            expect(arr[2].name).toEqual(newName);
                            done();
                        }
                    });

                    arr.push(obj);

                    arr[2].name = newName;
                });

                it('should watched after call `pop`', function (done) {
                    var arr = [1, 2, 3];

                    observer.watch(arr, function () {
                        expect(arr.length).toBe(2);
                        done();
                    });

                    arr.pop();
                });

                it('should unwatch return data after call `pop`', function () {
                    var arr = [1, 2, {name: 'treelite'}];
                    var res;

                    observer.watch(arr, function () {
                        expect(arr.length).toBe(2);
                    });

                    res = arr.pop();

                    expect(res.name).toEqual('treelite');
                    expect(res.__meta__).toBeUndefined();
                });

                it('should watched after call `shift`', function (done) {
                    var arr = [1, 2, 3];

                    observer.watch(arr, function () {
                        expect(arr.length).toBe(2);
                        done();
                    });

                    arr.shift();
                });

                it('should unwatch return data after call `shift`', function () {
                    var arr = [{name: 'treelite'}, 2, 3];

                    observer.watch(arr, function () {
                        expect(arr.length).toBe(2);
                    });

                    var res = arr.shift();
                    expect(res.name).toEqual('treelite');
                    expect(res.__meta__).toBeUndefined();
                });

                it('should watched after call `splice`', function (done) {
                    var arr = [1, 2, 3];

                    observer.watch(arr, function () {
                        expect(arr.length).toBe(4);
                        done();
                    });

                    arr.splice(1, 1, 2, 3);
                });

                it('should watch returnd data after call `splice`', function () {
                    var arr = [1, 2, {name: 'treelite'}];

                    observer.watch(arr, function () {
                        expect(arr.length).toBe(2);
                    });

                    var res = arr.splice(2, 1);

                    expect(res[0].name).toEqual('treelite');
                    expect(res.__meta__).toBeUndefined();
                    expect(res[0].__meta__).toBeUndefined();
                });

                it('should watch new data after call `splice`', function (done) {
                    var arr = [1, 2, 3];
                    var newName = 'cxl';
                    var i = 0;

                    observer.watch(arr, function (key) {
                        i++;
                        expect(arr.length).toBe(4);
                        if (i == 2) {
                            expect(key).toEqual('1.name');
                            expect(arr[1].name).toEqual(newName);
                            done();
                        }
                    });

                    arr.splice(1, 0, {name: 'treelite'});

                    arr[1].name = newName;
                });

                it('should watched after call `unshift`', function (done) {
                    var arr = [2, 3];

                    observer.watch(arr, function () {
                        expect(arr.length).toBe(3);
                        done();
                    });

                    arr.unshift(1);
                });

                it('should watch new data after call `unshift`', function (done) {
                    var arr = [2, 3];
                    var obj = {name: 'treelite'};
                    var newName = 'cxl';
                    var i = 0;

                    observer.watch(arr, function (key) {
                        i++;
                        expect(arr.length).toBe(3);
                        if (i == 2) {
                            expect(key).toEqual('0.name');
                            expect(arr[0].name).toEqual(newName);
                            done();
                        }
                    });

                    arr.unshift(obj);
                    arr[0].name = newName;
                });

                it('should watched after call `sort`', function (done) {
                    var arr = [3, 1, 2];

                    observer.watch(arr, function (key) {
                        expect(arr[0]).toBe(1);
                        expect(arr.length).toBe(3);
                        done();
                    });

                    arr.sort();
                });

                it('should watched after call `reverse`', function (done) {
                    var arr = [3, 1, 2];

                    observer.watch(arr, function (key) {
                        expect(arr[0]).toBe(2);
                        expect(arr.length).toBe(3);
                        done();
                    });

                    arr.reverse();
                });

            });

        });

    });

});
