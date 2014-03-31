/**
 * @file app
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var VM = require('saber-firework/vm');

    new VM({
        ele: '#todoapp',
        data: {
            todos: [
                {id: 1001, title: 'Hello World', completed: true},
                {id: 1002, title: 'Hello World', completed: false},
                {id: 1003, title: 'Hello World', completed: false}
            ]
        },
        methods: {
            remove: function (index) {
                this.todos.splice(index, 1);
            }
        }
    });
});
