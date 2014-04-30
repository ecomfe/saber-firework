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
