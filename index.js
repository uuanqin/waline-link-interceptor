module.exports = function ({whiteList, blackList, interceptorTemplate, redirectUrl , encodeFunc}) {
    return {
        middlewares: [
            async (ctx, next) => {
                if (ctx.path.toLowerCase() !== '/api/comment' || ctx.method.toUpperCase() !== 'GET') {
                    return next();
                }

                const type = ctx.param('type');
                if (type === 'count' || type === 'list') {
                    return next();
                }

                function isValidUrl(url) {
                    const host = (new URL(url)).host;
                    if (host === ctx.host) {
                        return true;
                    }

                    const isAllowListMode = Array.isArray(whiteList);
                    const isBlockListMode = Array.isArray(blackList);

                    // Domain Name Match Logic
                    const matchFunction = (e) => {
                        const e_str = e.replace(/\./g,'\\.').replace(/\*/g, '.*');
                        const regex = new RegExp(`${e_str}|([a-z0-9]+\\.)*${e_str}`);
                        return regex.test(host);
                    }

                    if (isAllowListMode && isBlockListMode) {
                        const inBlackList = blackList.find(matchFunction);
                        const inWhiteList = whiteList.find(matchFunction);
                        return !inBlackList || inWhiteList;
                    }

                    if (isAllowListMode) {
                        return whiteList.find(matchFunction);
                    }

                    if (isBlockListMode) {
                        return !blackList.find(matchFunction);
                    }

                }

                function replaceUrl(text) {
                    return text.replace(/href\=\"([^"#]+)\"/g, (originText, url) => {

                        const redirectToo = redirectUrl ? redirectUrl :`${ctx.protocol}://${ctx.host}/api/redirect`;

                        const encodeFuncc = encodeFunc ? encodeFunc :  (url) =>{
                            return 'url='+encodeURIComponent(url);
                        }

                        if (isValidUrl(url)) {
                            return originText;
                        }

                        return `href="${redirectToo}?${encodeFuncc(url)}"`;
                    });
                }

                const _oldSuccess = ctx.success;
                const newSuccess = function (data) {
                    (Array.isArray(data) ? data : data.data).forEach(comment => {
                        comment.comment = replaceUrl(comment.comment);
                        if (Array.isArray(comment.children) && comment.children.length) {
                            comment.children.forEach(cmt => {
                                cmt.comment = replaceUrl(cmt.comment);
                            });
                        }
                    });

                    _oldSuccess.call(ctx, data);
                }
                ctx.success = newSuccess;
                await next();
            },
            async (ctx, next) => {
                function outputHtml(url) {
                    const template = interceptorTemplate || `<!DOCTYPE html><html lang="zh-CN"><head><title>Redirect to third party website</title></head><body data-url="__URL__"><p>Redirecting to __URL__</p><script>location.href = document.body.getAttribute('data-url');</script></body></html>`;
                    return template.replace(/__URL__/g, () => url);
                }

                if (ctx.path.toLowerCase() !== '/api/redirect' || ctx.method.toUpperCase() !== 'GET') {
                    return next();
                }

                const url = ctx.param('url');
                try {
                    // not standard url then exit to avoid xss
                    new URL(url);
                    ctx.body = outputHtml(url);
                } catch (e) {
                    ctx.body = url;
                    console.log(e);
                }
            }
        ]
    }
};
