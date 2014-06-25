# 0.4.0 / 2014-06-26

* 添加`filter`功能，代码统计、权限验证神马的轻松搞定，欲知详情挫[这里](README.md#addfilterurl-fn)
* 添加全局的`beforetransition`事件，方便在页面开始加载后、转场动画开始前干些事儿
* 添加全局的`error`事件，页面加载失败时触发
* 在`action`的`leave`与`sleep`事件中可以通过新增的函数参数（`stop`）来阻止页面的切换，[示例在这里](doc/action.md#%E4%BA%8B%E4%BB%B6)
* 考虑网络情况，调整默认的页面加载超时时间为`1000`毫秒
* 更新依赖（[saber-router@0.2.4](https://github.com/ecomfe/saber-router/blob/develop/History.md#024--2014-06-25), [saber-viewport@0.2.11](https://github.com/ecomfe/saber-viewport/blob/develop/History.md#0211--2014-06-25), [saber-widget@0.3.0](https://github.com/ecomfe/saber-widget/blob/develop/History.md#030--2014-06-24)）

# 0.3.2 / 2014-06-24

* 支持单次`redirect`禁用`action`的缓存，详情请参考[action.redirect](doc/action.md#redirecturl-query-options)
* 更新依赖（[saber-router@0.2.3](https://github.com/ecomfe/saber-router/blob/master/History.md#023--2014-06-23), [saber-viewport@0.2.10](https://github.com/ecomfe/saber-viewport/blob/master/History.md#0210--2014-06-23), [saber-widget@0.2.3](https://github.com/ecomfe/saber-widget/blob/master/History.md#023--2014-06-23)）
* 修正转场动画进行同时时页面切换带来的问题

# 0.3.0 / 2014-06-16

* 添加`saber-widget`支持，各种`widget`放心用，清理工作框架会搞定
* 添加`addDomEvent`与`removeDomEvent`方法，替换原有的`attachEvent`与`detachEvent`，优化了事件处理函数的参数与`this`指针，具体请参考[文档](doc/view.md)
* 全局的`beforeload`与`afterload`事件调整事件参数，能获取到`action`对象，具体请参考[文档](README.md)

# 0.2.6 / 2014-04-30

* 更新依赖

# 0.2.4 / 2014-04-26

* `view`的`templateMainTarget`成为可选属性，模版引擎使用多例，不用关心模版`target`重复的问题
* 添加`index`与`path`全局配置，分别表示默认的`index`文件名称与默认路径
* 添加`constructor`属性支持，`action`、`view`与`model`可以更改实例继承关系
* 更新依赖(`saber-router`，`saber-lang`)

# 0.2.1 / 2014-04-20

* 更新依赖`saber-viewport`至`0.2.8`
* 添加全局配置项`timeout`，表示`Action`加载超时时间，如果超时则可以响应其它`Action`的切换请求，默认为`300ms`

# 0.2.0 / 2014-04-18

* 重构，开发更加便利，API已完全调整，详情请参考文档
