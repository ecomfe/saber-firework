/**
 * @file 列表数据实体 数据交互遵循e-json规范
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {
    var ajax = require('saber-ajax');

    function DataList(url, queryInfo) {
        this.url = url;
        this.query = queryInfo;
    }

    /**
     * 获取当前数据
     *
     * @public
     * @return {Array.<Object>}
     */
    DataList.prototype.getData = function () {
    };

    /**
     * 获取当前页数
     *
     * @public
     * @return {number} 获取当前数
     */
    DataList.prototype.getPage = function () {
    };

    /**
     * 获取总页数
     *
     * @public
     * @return {number}
     */

    DataList.prototype.getMaxPage = function () {
    };

    /**
     * 获取每页大小
     *
     * @public
     * @return {number}
     */
    DataList.prototype.getSize = function () {
    };

    /**
     * 拉取数据
     *
     * @public
     * @param {number} page 页数
     * @param {number} size 每页数量
     * @return {Promise}
     */
    DataList.prototype.fetch = function (page, size) {
        var query = this.query;
        query.page = page || 0;
        query.size = size || 10;

        var queryStr = [];
        Object.keys(query).forEach(function (key) {
            queryStr.push(key + '=' + encodeURIComponent(query[key]));
        });

        return ajax.get(this.url + '?' + queryStr.join('&')).then(function (res) {return JSON.parse(res)});
    };

    return DataList;
});
