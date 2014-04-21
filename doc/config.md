# 全局配置信息

`Object`类型，支持如下字段：

* `index` `{string}` 首页路径，默认为`'/'`
* `template` `{string|Array.<string>}` 模版字符串，预编译的template，主要用于在启动App时提前编译全局公用的template，比如母版等。默认为空
* `timeout` `{number}` action加载超时时间，单位ms，超时后框架可以响应其它Action的切换请求，默认为`300`
* `processor` `{Object}` 附加处理器，作用于特定时刻调整框架行为，具体参考之后的'附加处理器'说明
* `viewport` `{Object}` 转场相关配置，具体参考`saber-viewport`的[全局配置信息](https://github.com/ecomfe/saber-viewport#initele-options)，默认为`{ transition: false }` 关闭转场效果

## 附加处理器

作用于特定时刻，调整框架行为

### transition

转场参数处理器，用于在转场操作前处理转场效果参数（参数具体字段请参考[saber-viewport](https://github.com/ecomfe/saber-viewport#pageentertype-options)的`.enter()`方法参数说明）

`function (route, oldRoute):Object`

* `router` `{Object}` 待转场页面的路由配置信息
* `oldRoute` `{Object}` 待转出页面的路由配置信息
* `{Object}` 返回转场参数

比如需要根据路由配置改变转场效果时长：

```javascript
{
    processor: {
        transition: function (route, oldRoute) {
            return {
                // 根据自定义路由属性`index`设置转场效果时长
                duration: router.index > oldRoute ? 0.3 : 0.5;
            };
        }
    }
}
```
