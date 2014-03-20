/**
 * @file oberver spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    
    var observer = require('saber-firework/observer');

    describe('observer', function () {

        describe('.watch', function () {

            it('should be a function', function () {
                expect(Object.prototype.toString.call(observer.watch)).toEqual('[object Function]');
            });

        });

    });

});
