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
                expect(b.__meta__).toBeUndefined();
                expect(a.__meta__).not.toBeUndefined();
            });

            it('should set meta data is not enumerable', function () {
                var a = {name: 'treelite'};
                observer.enable(a);
                expect(Object.keys(a).length).toBe(1);
            });

        });

        describe('.watch', function () {

            it('should be a function', function () {
                expect(Object.prototype.toString.call(observer.watch)).toEqual('[object Function]');
            });

            it('should watch object', function (done) {
                var obj = {name: 'treelite'};
                var newName = 'cxl';

                observer.watch(obj, function (key, value) {
                    expect(key).toEqual('name');
                    expect(value).toEqual(newName);
                    done();
                });

                obj.name = newName;
            });

            it('should watch nested object', function (done) {
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

    });

});
