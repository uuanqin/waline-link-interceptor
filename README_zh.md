# waline-link-interceptor

Waline 评论系统中间页插件。

Language: [English](./README.md) | 中文

## 安装

```shell
npm i waline-link-interceptor
```

## 使用

```javascript
// index.js
const Waline = require('@waline/vercel');
const LinkInterceptor = require('waline-link-interceptor');

module.exports = Waline({
    plugins: [
        LinkInterceptor({
            whiteList: [
                'example.com'
            ],
            // blackList: [],
            // interceptorTemplate: `redirect to __URL__`,  
            // redirectUrl: "https://example.com/go.html",
            // encodeFunc: (url) =>{
            //     return "u="+Buffer.from(url).toString('base64')
            // }
        })
    ]
});
```

配置选项：
- `whiteList` （可选）: 域名白名单
- `blackList` （可选）: 域名黑名单
- `interceptorTemplate` （可选）: 中间页模板
- `redirectUrl` （可选）: 中间页链接
- `encodeFunc` （可选）: 外部链接编码方式

例子：假设中间页的形式为 `https://example.com/go.html?u=https://external-link.com` ，我们可以这样配置选项:

```js
LinkInterceptor({
    whiteList: [
        'example.com'
    ],
    redirectUrl: `https://example.com/go.html`,
    encodeFunc: (url) =>{
        return "u="+url;
    }
})
```

更多案例及说明详见 [这篇文章](https://uuanqin.top/p/e1ee5eca/)。

## 相关插件

本插件基于 [@waline-plugins/link-interceptor](https://github.com/walinejs/plugins/tree/master/packages/link-interceptor) 二次开发。

## License

[MIT](./LICENSE)