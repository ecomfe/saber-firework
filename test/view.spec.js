/**
 * @file view spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var dom = require('saber-dom');
    var Abstract = require('saber-firework/Abstract');
    var View = require('saber-firework/View');
    var widget = require('saber-widget');
    var Widget = require('saber-widget/Widget');

    function Slider() {
        Widget.apply(this, arguments);
    }

    Slider.prototype.type = 'Slider';

    require('saber-lang/inherits')(Slider, Widget);

    widget.register(Slider);

    function fireEvent(ele, type, proto) {
        var e = document.createEvent('Event');
        e.initEvent(type, true, true);
        if (proto) {
            extend(e, proto);
        }
        ele.dispatchEvent(e);
    }

    describe('View', function () {

        var main;

        beforeEach(function () {
            main = document.createElement('div');
            main.style.cssText += ';position:absolute;top:-1000px;left:-1000px';
            document.body.appendChild(main);
        });

        afterEach(function () {
            document.body.removeChild(main);
            main = null;
        });

        it('should inherited abstract', function () {
            var view = new View();
            expect(view instanceof Abstract).toBeTruthy();
        });

        it('should compile template only once', function () {
            var config = {
                    templateMainTarget: 'targetMain',
                    template: '<!-- target:targetMain -->hello'
                };

            var pass = true;
            try {
                var view = new View(config);
                view = new View(config);
            }
            catch (e) {
                pass = false;
            }
            expect(pass).toBeTruthy();
        });

        it('.setMain(ele) should set main element', function () {
            var view = new View();

            view.setMain(main);

            expect(view.main).toBe(main);
        });

        it('.render() should render view', function () {
            var data = {name: 'treelite'};
            var tpl = '${name}';
            var view = new View({
                    template: tpl,
                    main: main,
                });

            view.render(data);

            expect(main.innerHTML).toEqual(data.name);
        });


        it('.render() supoort targets', function () {
            var data = {name: 'treelite'};
            var tpl = '<!-- target:main -->${name}<!-- target:test -->test${name}';
            var view = new View({
                    template: tpl,
                    templateMainTarget: 'main',
                    main: main,
                });

            view.render(data);
            expect(main.innerHTML).toEqual(data.name);

            expect(view.template.render('test', data)).toEqual('test' + data.name);
        });

        it('.render() should set className', function () {
            var config = {
                template: 'hello ${content}',
                className: 'hello',
                main: main
            };

            var view = new View(config);
            view.render();

            expect(main.className.trim()).toEqual(config.className);
        });

        it('.render() do not repeat setting className', function () {
            var clsName = main.className = 'hello world'
            var config = {
                template: 'hello ${content}',
                className: 'hello',
                main: main
            };

            var view = new View(config);
            view.render();

            expect(main.className).toEqual(clsName);
        });

        it('.ready() should bind dom events', function (done) {
            var tpl = '<!-- target:readyMain --><div class="box"><div class="inner"></div></div>';
            var fn = jasmine.createSpy('fn');
            var view = new View({
                    main: main,
                    template: tpl,
                    templateMainTarget: 'readyMain',
                    domEvents: {
                        'click:.box': fn
                    }
                });

            view.render();
            view.ready();

            var ele = dom.query('.box', main);
            fireEvent(dom.query('.inner', main), 'click');

            setTimeout(function () {
                expect(fn.calls.any()).toBeTruthy();
                expect(fn.calls.argsFor(0)[0]).toBe(ele);
                done();
            }, 0);
        });

        it('.addDomEvent() should bind dom events', function (done) {
            var view = new View({
                    main: main,
                    template: '<div class="box"><div class="inner"></div></div>'
                });

            view.render();

            var thisObj;
            var element = dom.query('.box', main);
            view.addDomEvent(element, 'click', function (ele) {
                expect(ele).toBe(element);
                thisObj = this;
            });

            fireEvent(dom.query('.inner', main), 'click');

            setTimeout(function () {
                expect(thisObj).toBe(view);
                done();
            }, 0);
        });

        it('.removeDomEvent() should unbind dom events', function (done) {
            var fn = jasmine.createSpy('fn');
            var view = new View({
                    main: main,
                    template: '<div class="box"><div class="inner"></div></div>'
                });

            view.render();

            var element = dom.query('.box', main);
            view.addDomEvent(element, 'click', fn);

            view.removeDomEvent(element, 'click', fn);

            fireEvent(dom.query('.inner', main), 'click');

            setTimeout(function () {
                expect(fn.calls.any()).toBeFalsy();
                done();
            }, 0);
        });

        describe('.query/queryAll', function () {
            var tpl = '<span></span><div class="item"><span></span></div><div class="item"></div>';

            it ('return element with one context', function () {
                var view = new View({
                    main: main,
                    template: tpl
                });

                view.render();

                var context = main.children[1];
                var ele = view.query('span', context);
                expect(ele.tagName).toEqual('SPAN');

                ele = view.query('.item', context);
                expect(ele).toBeNull();

                var eles = view.queryAll('span', context);
                expect(eles.length).toBe(1);

                eles = view.queryAll('.item', context);
                expect(eles.length).toBe(0);
            });

            it ('return element with default context', function () {
                var view = new View({
                    main: main,
                    template: tpl
                });

                view.render();

                var ele = view.query('.item');
                expect(ele.className).toEqual('item');
                expect(ele.previousSibling.tagName).toEqual('SPAN');

                ele = view.query('.no-exist');
                expect(ele).toBeNull();

                var eles = view.queryAll('.item');
                expect(eles.length).toBe(2);

                eles = view.queryAll('.no-exist-item');
                expect(eles.length).toBe(0);
            });

            it('return null or empty array while the main element do not exist', function () {
                var view = new View({
                    main: main,
                    template: tpl
                });

                view.render();

                view.main = null;

                var ele = view.query('.item');
                expect(ele).toBeNull();

                var eles = view.queryAll('span');
                expect(eles.length).toBe(0);
            });
        });

        describe('.dipose()', function () {

            it('should detach all dom events', function (done) {
                var tpl = '<!-- target:disposeMain --><div class="box"><div class="inner"></div></div>';
                var fn = jasmine.createSpy('fn');
                var view = new View({
                        main: main,
                        template: tpl,
                        templateMainTarget: 'disposeMain',
                        domEvents: {
                            'click:.box': fn,
                            'click': fn
                        }
                    });

                view.render();
                view.ready();
                view.dispose();

                fireEvent(dom.query('.inner', main), 'click');

                setTimeout(function () {
                    expect(fn.calls.count()).toBe(0);
                    done();
                }, 0);
            });

            it('should dipose all widget', function () {
                var tpl = '<div class="slider"><div></div></div>';
                var view = new View({
                        main: main,
                        template: tpl
                    });

                view.render();
                var ele = view.query('.slider');
                var widget = require('saber-widget');
                var slider = widget.slider(ele, {id: 'slider'});
                
                expect(widget.get('slider')).toBe(slider);

                view.dispose();

                expect(widget.get('slider')).toBeUndefined();
                expect(slider.main).toBeNull();
            });

        });

    });

});
