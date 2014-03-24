/**
 * @file oberver spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    
    var observer = require('saber-firework/observer');

    describe('observer', function () {

        describe('.enable', function () {

            it('should not return false when argument is Object or Array', function () {
                expect(observer.enable({})).not.toBeFalsy();
                expect(observer.enable([])).not.toBeFalsy();
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

            it('should return proxy object', function () {
                var a = {};
                var res = observer.enable(a);
                expect(a.__meta__).toBeUndefined();
                expect(res.__meta__).not.toBeUndefined();
            });

            it('should set meta data is not enumerable', function () {
                var a = {name: 'treelite'};
                a = observer.enable(a);
                expect(Object.keys(a).length).toBe(1);
                expect(Object.keys(a)[0]).toEqual('name');
            });

        });

        /*
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
        */

        describe('.watch', function () {

            it('should be a function', function () {
                expect(Object.prototype.toString.call(observer.watch)).toEqual('[object Function]');
            });

            it('should watch object', function (done) {
                var obj = {name: 'treelite'};
                var newName = 'cxl';

                obj = observer.watch(obj, function (key, value) {
                    expect(key).toEqual('name');
                    expect(value).toEqual(newName);
                    done();
                });

                obj.name = newName;
            });

            it('should watch nested object', function (done) {
                var obj = {sub: {name: 'treelite'}};
                var newName = 'cxl';

                obj = observer.watch(obj, function (key, value) {
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

                obj = observer.watch(obj, function (key, value) {
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

            it('should watch array', function (done) {
                var arr = [1, 2, 3];

                arr = observer.watch(arr, function () {
                    expect(arr[0]).toBe(0);
                    done();
                });

                arr[0] = 0;
            });

        });

    });

});
