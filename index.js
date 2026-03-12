module.exports = function ({whiteList, blackList, interceptorTemplate, redirectUrl, encodeFunc}) {

    const defaultEncodeFunc = (url) => 'url=' + encodeURIComponent(url);
    const activeEncodeFunc = encodeFunc || defaultEncodeFunc;

    const compileDomainRules = (rules) => {
        if (!Array.isArray(rules)) return null;
        return rules.map(rule => {
            const safeRule = rule.replace(/\./g, '\\.').replace(/\*/g, '.*');
            try {
                return new RegExp(`^(?:${safeRule}|(?:[a-z0-9-]+\\.)*${safeRule})$`, 'i');
            } catch (e) {
                console.error(`Invalid domain rule: ${rule}`, e);
                return null;
            }
        }).filter(r => r !== null);
    };

    const whiteListRegex = compileDomainRules(whiteList);
    const blackListRegex = compileDomainRules(blackList);

    return {
        middlewares: [
            async (ctx, next) => {
                const {INTERCEPTOR_REDIRECT_URL} = process.env;
                if (ctx.path.toLowerCase() !== '/api/comment' || ctx.method.toUpperCase() !== 'GET') {
                    return next();
                }

                const type = ctx.param('type');
                if (type === 'count' || type === 'list') {
                    return next();
                }

                /**
                 * Black and white list judgment logic
                 * @param url
                 * @returns {boolean|*}
                 */
                function isAllowedUrl(url) {
                    const host = (new URL(url)).host;

                    if (host === ctx.host) {
                        return true;
                    }
                    const inWhiteList = whiteListRegex?.some(reg => reg.test(host));
                    const inBlackList = blackListRegex?.some(reg => reg.test(host));
                    const hasWhiteList = whiteListRegex && whiteListRegex.length > 0;
                    const hasBlackList = blackListRegex && blackListRegex.length > 0;

                    if (hasWhiteList && hasBlackList) {
                        return inWhiteList && !inBlackList;
                    }

                    if (hasWhiteList) {
                        return inWhiteList;
                    }

                    if (hasBlackList) {
                        return !inBlackList;
                    }

                    return true;
                }

                /**
                 * In-comment link handler function
                 * @param text
                 * @returns {*}
                 */
                function replaceUrl(text) {
                    if (!text) return text;

                    const redirectToo = INTERCEPTOR_REDIRECT_URL || redirectUrl || `${ctx.protocol}://${ctx.host}/api/redirect`;

                    return text.replace(/href="([^"#]+)(#[^"]+)?"/g, (hrefText, url, hashtag) => {

                        if (isAllowedUrl(url)) {
                            return hrefText;
                        }

                        const finalHashtag = hashtag || "";

                        return `href="${redirectToo}?${activeEncodeFunc(url + finalHashtag)}"`;
                    });
                }

                /**
                 * Avatar link handler function
                 * @param link
                 * @returns {string}
                 */
                function replaceLink(link) {
                    // Null link
                    if (!link) {
                        return "";
                    }

                    // Add protocol
                    const pattern = /^https?:\/\//;
                    if (!pattern.test(link)) {
                        link = 'https://' + link;
                    }

                    // validate URL
                    try {
                        new URL(link)
                    } catch (e) {
                        return "";
                    }

                    if (isAllowedUrl(link)) {
                        return link;
                    }

                    const redirectToo = INTERCEPTOR_REDIRECT_URL || redirectUrl || `${ctx.protocol}://${ctx.host}/api/redirect`;

                    return `${redirectToo}?${activeEncodeFunc(link)}`;
                }


                const _oldSuccess = ctx.success;

                ctx.success = function (data) {
                    (Array.isArray(data) ? data : data.data).forEach(comment => {
                        comment.comment = replaceUrl(comment.comment);
                        comment.link = replaceLink(comment.link);
                        if (Array.isArray(comment.children) && comment.children.length) {
                            comment.children.forEach(cmt => {
                                cmt.comment = replaceUrl(cmt.comment);
                                cmt.link = replaceLink(cmt.link);
                            });
                        }
                    });

                    _oldSuccess.call(ctx, data);
                };

                await next();
            },
            async (ctx, next) => {
                const {INTERCEPTOR_TEMPLATE} = process.env;

                function outputHtml(url) {
                    const template = INTERCEPTOR_TEMPLATE || interceptorTemplate || `<!DOCTYPE html><html lang='zh-CN'><head><title>Redirect to third party website</title></head><body data-url='__URL__'><p>Redirecting to __URL__</p><script>location.href = document.body.getAttribute('data-url');</script></body></html>`;
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
