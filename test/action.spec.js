/**
 * @file action spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
  
    var Abstract = require('saber-firework/Abstract');
    var Action = require('saber-firework/Action');

    describe('Action', function () {

        it('should inherited abstract', function () {
            var action = new Action();

            expect(action instanceof Abstract).toBeTruthy();
        });

        it('create new instance should bind events', function () {
            var fn = jasmine.createSpy('fn');
            var action = new Action({
                    events: {
                        'view:add': fn,
                        'model:update': fn
                    }
                });

            action.view.emit('add');
            action.model.emit('update');

            expect(fn.calls.count()).toBe(2);
        });

        it('create new instance should emit `init`', function () {
            var fn = jasmine.createSpy('fn');
            var action = new Action({
                    events: {
                        init: fn
                    }
                });

            expect(fn.calls.count()).toBe(1);
        });

        it('.enter() should set path and finish render', function (done) {
            var path = '/index';
            var query = {filter: 'www'};
            var options = {noCache: true};
            var ele = document.createElement('div');
            var fn = jasmine.createSpy('fn');
            var action = new Action({
                    events: {
                        enter: fn 
                    }
                });

            spyOn(action.model, 'fetch').and.callThrough();
            spyOn(action.view, 'setMain').and.callThrough();
            spyOn(action.view, 'render').and.callThrough();

            action.enter(path, query, ele, options).then(function () {
                expect(action.path).toEqual(path);
                expect(action.options).toEqual(options);
                expect(action.options).not.toBe(options);
                expect(fn.calls.count()).toBe(1);
                expect(action.view.setMain).toHaveBeenCalledWith(ele);
                expect(action.model.fetch).toHaveBeenCalledWith(query);
                expect(action.view.render).toHaveBeenCalled();
                done();
            });
        });

        it('.leave() should call dispose', function () {
            var action = new Action();
            
            spyOn(action, 'dispose');
            action.leave();

            expect(action.dispose).toHaveBeenCalled();
        });

        it('.dispose() should call view\'s dispose and model\'s dispose', function () {
            var action = new Action();
            
            spyOn(action.view, 'dispose');
            spyOn(action.model, 'dispose');
            action.dispose();

            expect(action.view.dispose).toHaveBeenCalled();
            expect(action.model.dispose).toHaveBeenCalled();
        });

    });

});
