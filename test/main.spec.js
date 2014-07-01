/**
 * @file main spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var firework = require('saber-firework');
    var router = require('saber-router');
    var viewport = require('saber-viewport');
    var tap = require('saber-tap');

    function mockLib(lib) {
        Object.keys(lib).forEach(function (key) {
            lib[key] = jasmine.createSpy();
        });
    }

    describe('main', function () {

        beforeEach(function () {
            mockLib(tap);
            mockLib(router);
            mockLib(viewport);
        });

        describe('.start()', function () {
            it('should init viewport, router, tap and then start router', function () {
                var main = 'MainHTMLElement';
                var options = {};

                firework.start(main, options);

                expect(viewport.init).toHaveBeenCalledWith(main, {transition: false});
                expect(tap.mixin).toHaveBeenCalled();
                expect(router.config).toHaveBeenCalled();
                expect(router.start).toHaveBeenCalled();
            });
        });

        describe('.load()', function () {
            it('should add route config', function () {
                var path = '/'
                var route = {path: path};

                firework.load(route);
                expect(router.add).toHaveBeenCalled();
                expect(router.add.calls.argsFor(0)[0]).toEqual(path);
            });

            it('should add array route config', function () {
                var paths = ['/', '/home'];
                var routes = [{path: paths[0]}, {path: paths[1]}];

                firework.load(routes);
                expect(router.add.calls.count()).toBe(2);
                expect(router.add.calls.argsFor(0)[0]).toEqual(paths[0]);
                expect(router.add.calls.argsFor(1)[0]).toEqual(paths[1]);
            })
        });

    });
});
