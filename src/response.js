const utils = require('./utils.js');

class Request {
    constructor(config) {
        this.config = config;
    }

    /**
     * redirect
     * 跳转到url，封装为通用返回包
     *
     * @param {String} url
     * @returns {Object} {status, headers, body}
     */
    redirect(url) {
        return {
            status: 302,
            headers: {
                Location: url
            },
            body: ''
        }
    }

    /**
     * sendJson
     * 将传入Object序列化成json并封装为通用返回包
     *
     * @param {Object} data
     * @returns {Object} {status, headers, body}
     */
    sendJson(data) {
        const json = JSON.stringify(data);
        return {
            status: 200,
            headers: {
                'Content-Type': 'text/json; charset=utf-8',
                'Content-Length': json.length,
            },
            body: json
        }
    }

    /**
     * sendHtml
     * 将html封装为通用返回包
     *
     * @param {String} html
     * @returns {Object} {status, headers, body}
     */
    sendHtml(html) {
        return {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Length': html.length
            },
            body: html
        }
    }

    /**
     * analyze
     * 分析后端响应，调整先前的策略
     *
     * level: 0, 1, 2
     *   0: 安全检查页面
     *   1: 网页内嵌检查代码
     *   2: 不修改网页
     * @param {Number} status
     * @param {Object} headers
     * @param {String} body
     * @param {Number} level
     * @returns {Number}
     */
    analyze(status, headers, body, level) {
        if (1 === level && (200 !== status || !/html/.test(headers['content-type'])))
            return 2;

        return level;
    }

    /**
     * challengePage
     * 返回浏览器安全检查页面，封装为通用返回包
     *
     * @param {String} url
     * @returns {Object} {status, headers, body}
     */
    challengePage(url) {
        let html = utils.loadHtml('challengePage');
        const ts = (new Date()).getTime();
        html = utils.htmlRender(html, {
            url: url,
            challengeUrl: this.config.challenge.url,
            powL: this.config.pow.page.l,
            powM: this.config.pow.page.m,
            powN: this.config.pow.page.n,
            question: utils.signafiture(url, ts, this.config.privkey),
            timestamp: ts,
        });
        return html;
    }

    /**
     * challengeScript
     * 将浏览器检查脚本嵌入原页面，封装为通用返回包
     *
     * @param {String} url
     * @returns {Object} {status, headers, body}
     */
    challengeScript() {

    }
};

module.exports = Request;