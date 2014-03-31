/**
 * @file app
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var VM = require('saber-firework/vm');

    new VM({
        ele: '#todoapp',
        data: {
            eIndex: null,
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
                if (this.current) {
                    this.todos.push({
                        title: this.current,
                        completed: false
                    });
                    this.current = '';
                }
            },

            accept: function () {
                this.eIndex = null;
            },

            edit: function (index) {
                this.eIndex = index; 
            }
        }
    });
});
