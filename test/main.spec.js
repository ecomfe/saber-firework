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

                it('global event error should emit when load action fail', function (done) {
                    firework.on('error', function (back, front) {
                        expect(back.route.url).toEqual('/error');
                        expect(front.route.url).toEqual('/');
                        finish(done);
                    });
                    
                    firework.load({path: '/error', action: require('mock/error')});

                    router.redirect('/error');
                });

            });

            describe('filter', function () {

                afterEach(function () {
                    firework.removeFilter();
                });

                it('can added by string url', function (done) {
                    var called = false;
                    function filter(route, next) {
                        called = true;
                        next();
                    }

                    firework.addFilter('/foo', filter);
                    firework.load({path: '/foo', action: require('mock/foo')});

                    router.redirect('/foo');

                    setTimeout(function () {
                        expect(called).toBeTruthy();
                        finish(done);
                    }, WAITE_TIME);
                });

                it('can added by RegExp', function (done) {
                    var called = false;
                    function filter(route, next) {
                        called = true;
                        next();
                    }

                    firework.addFilter(/^\/foo/, filter);
                    firework.load({path: '/foo', action: require('mock/foo')});

                    router.redirect('/foo');

                    setTimeout(function () {
                        expect(called).toBeTruthy();
                        finish(done);
                    }, WAITE_TIME);
                });

                it('can remove', function (done) {
                    var count = 0;
                    function filter(route, next) {
                        count++;
                        next();
                    }

                    firework.addFilter('/', filter);
                    firework.addFilter('/foo', filter);
                    firework.removeFilter('/foo');

                    firework.load({path: '/foo', action: require('mock/foo')});

                    router.redirect('/foo');
                    
                    setTimeout(function () {
                        expect(count).toBe(0);
                        firework.removeFilter();
                        router.redirect('/');
                        setTimeout(function () {
                            expect(count).toBe(0);
                            finish(done);
                        }, WAITE_TIME);
                    }, WAITE_TIME);
                });

                it('argument contains route info', function (done) {
                    var res;
                    function filter(route, next) {
                        res = route; 
                        next();
                    }
                    firework.addFilter('/foo', filter);
                    firework.load({path: '/foo', action: require('mock/foo')});

                    router.redirect('/foo~name=hello', null, {type: 'test'});

                    setTimeout(function () {
                        expect(res.url).toEqual('/foo~name=hello');
                        expect(res.path).toEqual('/foo');
                        expect(res.query).toEqual({name: 'hello'});
                        expect(res.options).toEqual({type: 'test'});
                        finish(done);
                    }, WAITE_TIME);
                });
                
                it('can jump over the remainder filters', function (done) {
                    var call1 = false;
                    var call2 = false;
                    var call3 = false;
                    var call4 = false;

                    function filter1(route, next, jump) {
                        call1 = true;
                        jump(1);
                    }

                    function filter2(route, next, jump) {
                        call2 = true;
                        next();
                    }

                    function filter3(route, next, jump) {
                        call3 = true;
                        jump();
                    }

                    function filter4(route, next, jump) {
                        call4 = true;
                        next();
                    }

                    firework.addFilter('/foo', filter1);
                    firework.addFilter('/foo', filter2);
                    firework.addFilter('/foo', filter3);
                    firework.addFilter('/foo', filter4);

                    firework.load({path: '/foo', action: require('mock/foo')});

                    router.redirect('/foo');

                    setTimeout(function () {
                        expect(call1).toBeTruthy();
                        expect(call2).toBeFalsy();
                        expect(call3).toBeTruthy();
                        expect(call4).toBeFalsy();
                        finish(done);
                    }, WAITE_TIME);
                });

                it('support async', function (done) {
                    var call = false;
                    function filter(route, next) {
                        setTimeout(next, 0);
                        call = true;
                    }
                    firework.addFilter('/foo', filter);
                    firework.load({path: '/foo', action: require('mock/foo')});

                    router.redirect('/foo');

                    setTimeout(function () {
                        expect(call).toBeTruthy();
                        expect(main.innerHTML).toEqual('<div class=" foo">foo</div>');
                        finish(done);
                    }, WAITE_TIME);
                });

                it('support default filter', function (done) {
                    var count = 0;
                    function filter(route, next) {
                        count++;
                        next();
                    }
                    firework.addFilter(filter);

                    firework.load({path: '/foo', action: require('mock/foo')});

                    router.redirect('/foo');

                    setTimeout(function () {
                        expect(count).toBe(1);
                        router.redirect('/');
                        setTimeout(function () {
                            expect(count).toBe(2);
                            finish(done);
                        }, WAITE_TIME);
                    }, WAITE_TIME);
                });

            });

        });

    });
});
