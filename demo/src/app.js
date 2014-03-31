/**
 * @file app
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var VM = require('saber-firework/vm');

    new VM({
        ele: '#todoapp',
        data: {
            current: '',
            todos: [
                {title: 'Hello World', completed: true},
                {title: 'Hello World', completed: false},
                {title: 'Hello World', completed: false}
            ]
        },
        methods: {
            remove: function (index) {
                this.todos.splice(index, 1);
            },

            add: function () {
                console.log('add');
                if (this.current) {
                    this.todos.push({
                        title: this.current,
                        completed: false
                    });
                    this.current = '';
                }
            }
        }
    });
});
