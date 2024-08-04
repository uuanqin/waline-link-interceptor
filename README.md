# waline-link-interceptor

A plugin of Waline Comment System which can add an intercept page for external links in comments.

## Install

```shell
npm i waline-link-interceptor
```

## Use

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

More instructions can be seen on [this article](https://uuanqin.top/p/e1ee5eca/) (Chinese).

## Related Plugins

This plugin is based on [@waline-plugins/link-interceptor](https://github.com/uuanqin/plugins/tree/master/packages/link-interceptor).

## License

MIT