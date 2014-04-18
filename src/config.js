/**
 * @file 全局配置
 * @author treelite(c.xinle@gmail.com)
 */

define({
    /**
     * index路径
     *
     * @type {string}
     */
    index: '/',

    /**
     * 预加载的模版
     *
     * @type {Array.<string>}
     */
    template: [],

    /**
     * 视图配置
     * 参见`saber-viewport`的全局配置参数
     * https://github.com/ecomfe/saber-viewport
     *
     * @type {Object}
     */
    viewport: {

        /**
         * 默认关闭转场效果
         *
         * @type {boolean}
         */
        transition: false,

    },

    /**
     * 附加处理器
     * 默认都是禁用处理器
     *
     * @type {Object}
     */
    processor: {

        /**
         * 转场参数处理
         *
         * @type {function|boolean}
         */
        transition: false
    }
});
