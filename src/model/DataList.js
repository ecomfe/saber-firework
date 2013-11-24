/**
 * @file 列表数据实体 数据交互遵循e-json规范
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var extend = require('saber-lang/extend');
    var ajax = require('saber-ajax/ejson');

    function DataList(url, queryInfo) {
        this.url = url;
        this.query = queryInfo || {};
        this.data = [];
        this.page = 0;
        this.pageSize = 10;
        this.total = 0;
    }

    /**
     * 获取当前数据
     *
     * @public
     * @return {Array.<Object>}
     */
    DataList.prototype.getData = function () {
        return this.data;
    };

    /**
     * 获取当前页数
     *
     * @public
     * @return {number} 获取当前数
     */
    DataList.prototype.getPage = function () {
        return this.page;
    };

    /**
     * 获取总页数
     *
     * @public
     * @return {number}
     */
    DataList.prototype.getMaxPage = function () {
        return Math.ceil(this.total / this.pageSize);
    };

    /**
     * 获取每页大小
     *
     * @public
     * @return {number}
     */
    DataList.prototype.getPageSize = function () {
        return this.pageSize;
    };

    /**
     * 获取总记录数
     * 
     * @public
     * @return {number}
     */
    DataList.prototype.getTotal = function () {
        return this.total;
    };

    /**
     * 拉取数据
     *
     * @public
     * @param {number} page 页数
     * @param {number} pageSize 每页数量
     * @return {Promise}
     */
    DataList.prototype.fetch = function (page, pageSize) {
        var query = extend({}, this.query);
        query.page = page || this.page;
        query.pageSize = pageSize || this.pageSize;

        var queryStr = [];
        Object.keys(query).forEach(function (key) {
            queryStr.push(key + '=' + encodeURIComponent(query[key]));
        });

        var me = this;

        return ajax.get(this.url + '?' + queryStr.join('&')).then(
            function (res) {
                me.data = res.data;
                me.page = res.page;
                me.pageSize = res.pageSize;
                me.total = res.total;
                return res.data;
            }
        );
    };

    return DataList;
});
