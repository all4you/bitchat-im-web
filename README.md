# bitchat-im-web

**bitchat-im-web** 是一个基于 bitchat 实现的一个 IM 应用的web端


## 快速开始

### 启动服务端

把依赖的 [bitchat](https://github.com/all4you/bitchat-im) 项目下载到本地，然后启动服务端


### 启动web端

1、安装依赖

``` bash
npm install
```

2、启动

``` bash
npm start
```


### 需要解决的问题

1.刷新页面后websocket断开连接
2.vue保存登录状态
3.刷新页面后由于websocket断开，导致Channel也断开，所以需要重新登录来绑定session和Channel的关系