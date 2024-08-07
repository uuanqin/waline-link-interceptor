# waline-link-interceptor

A plugin of Waline Comment System which can add an intercept page for external links in comments or the nickname. 

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

Options:
- `whiteList` (optional): List of allowed domains and subdomains.
- `blackList` (optional): List of disallowed domains and subdomains.
- `interceptorTemplate` (optional): Html template of the middle page.
- `redirectUrl` (optional): The url of the middle page.
- `encodeFunc` (optional): Encoding function of external link.

Example: If the url of the middle page is `https://example.com/go.html?u=https://external-link.com`, the options will be:

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

More instructions can be seen on [this article](https://uuanqin.top/p/e1ee5eca/) (Chinese).

## Related Plugins

This plugin is based on [@waline-plugins/link-interceptor](https://github.com/walinejs/plugins/tree/master/packages/link-interceptor).

## License

MIT