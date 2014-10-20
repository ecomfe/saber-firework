/**
 * @file main spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var firework = require('saber-firework');
    var router = require('saber-router');
    var viewport = require('saber-viewport');
    var tap = require('saber-tap');
    var extend = require('saber-lang/extend');


    var libs = {};

    function mockLib(name, lib) {
        var item = libs[name] || {};

        Object.keys(lib).forEach(function (key) {
            item[key] = lib[key];
            lib[key] = jasmine.createSpy();
        });

        libs[name] = item;
    }

    function unmockLib(name, lib) {
        var item = libs[name];
        Object.keys(item).forEach(function (key) {
            lib[key] = item[key];
        });
    }

    describe('main', function () {

        describe('.start()', function () {

            beforeEach(function () {
                mockLib('tap', tap);
                mockLib('router', router);
                mockLib('viewport', viewport);
            });

            afterEach(function () {
                unmockLib('tap', tap);
                unmockLib('router', router);
                unmockLib('viewport', viewport);
            });

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

            beforeEach(function () {
                mockLib('tap', tap);
                mockLib('router', router);
                mockLib('viewport', viewport);
            });

            afterEach(function () {
                unmockLib('tap', tap);
                unmockLib('router', router);
                unmockLib('viewport', viewport);
            });

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

        describe('load action', function () {
            var main = document.querySelector('.viewport');
            // 等待Action加载的事件
            // FIXME
            // 性能优化
            // chrome设置成0可以
            // 但phantomjs还是不行
            var WAITE_TIME = 100;

            firework.load({path: '/', action: require('mock/index')});
            firework.start(main);

            function finish(done) {
                router.clear();
                firework.load({path: '/', action: require('mock/index')});
                router.redirect('/', null, {force: true});
                // 等待一下，完成index页面的加载
                setTimeout(done, WAITE_TIME);
            }

            it('success', function (done) {
                var actionConfig = require('mock/foo');
                var viewConfig = actionConfig.view;
                firework.load({path: '/foo', action: actionConfig});
                router.redirect('/foo');
                setTimeout(
                    function () {
                        expect(main.innerHTML).toEqual('<div class=" ' + viewConfig.className + '">foo</div>');
                        finish(done);
                    },
                    WAITE_TIME
                );
            });

            describe('events', function () {

                it('global events, beforeload -> beforetransition -> afterload', function (done) {

                    var events = [];
                    var backs = [];
                    var fronts = [];

                    firework.on('beforeload', function (back, front) {
                        events.push('beforeload');
                        backs.push(back);
                        fronts.push(front);
                    });

                    firework.on('beforetransition', function (back, front) {
                        events.push('beforetransition');
                        backs.push(back);
                        fronts.push(front);
                    });

                    firework.on('afterload', function (back, front) {
                        events.push('afterload');
                        backs.push(back);
                        fronts.push(front);
                    });

                    router.redirect('/~spec=events');

                    setTimeout(function () {
                        expect(events).toEqual(['beforeload', 'beforetransition', 'afterload']);
                        expect(fronts[0].route.url).toEqual('/');
                        expect(backs[0].route.url).toEqual('/~spec=events');
                        expect(backs[0].route.query).toEqual({spec: 'events'});
                        expect(fronts[0]).toBe(fronts[1]);
                        expect(fronts[0]).toBe(fronts[2]);
                        expect(backs[0]).toBe(backs[1]);
                        expect(backs[0]).toBe(backs[2]);
                        firework.off();
                        finish(done);
                    }, WAITE_TIME);

                });

            });

        });

    });
});
