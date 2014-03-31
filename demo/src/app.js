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

        computed: {
            remainingCount: {
                get: function () {
                    return this.todos.filter(
                                function (item) {
                                    return !item.completed
                                }
                            ).length;
                }
            },

            completedCount: {
                get: function () {
                    return this.todos.length - this.remainingCount;
                }
            },

            unit: {
                get: function () {
                    return this.remainingCount > 1 ? 'items' : 'item';
                }
            },

            allChecked: {
                get: function () {
                    return this.remainingCount == 0;
                },
                set: function (value) {
                    this.todos.map(function (item) {
                        item.completed = value;
                    });
                }
            }

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
            },

            clear: function () {
                this.todos = this.todos.filter(function (item) {
                    return !item.completed;
                });
            }
        }
    });
});
