
'use strict';

/**
 * Module dependencies.
 */

const defaultConfig = require('./config.js');
const utils = require('./utils.js');
const Request = require('./request.js');
const Response = require('./response.js');

class waf {
    constructor(config = {}) {
        this.html = utils.loadHtml([
            'challengeFailed',
            'challengePage',
        ])

        this.config = defaultConfig;
        Object.assign(this.config, config);
        
        this.request = new Request(this.config);
        this.response = new Response(this.config);
    }

    /**
     * processRequest
     * 请求处理函数
     * 
     * @param {String} method
     * @param {String} url
     * @param {Object} headers
     * @param {String} body
     * @param {Object} meta
     * @return {Bool}
     */
    processRequest(method, url, headers, body, meta) {
        if (this.request.isChallenge(method, url)) {
            meta.isChallenge = true;
            meta.challengeResult = this.request.challengeCheck(headers, body);
            return false;
        }
        const result = this.request.analyze(method, url, headers);
        utils.log(method, url, headers, result);
        meta.level = result.level;
        meta.url = url;
        return !!result.level;
    }
    
    /**
     * processResponse
     * 响应处理函数
     *
     * @param {Number} status
     * @param {Object} headers
     * @param {String} body
     * @param {Object} meta
     * @returns {Object} {status, headers, body}
     */
    processResponse(status, headers, body, meta) {
        if (meta.isChallenge) {
            switch (meta.challengeResult.code) {
                case 0:
                    return this.response.redirect(meta.challengeResult.data);
                case 1:
                    return this.response.sendHtml(this.html.challengeFailed);
                case 2:
                    return this.response.sendJson(meta.challengeResult.data);
            }
        }

        meta.level = this.response.analyze(status, headers, body, meta.level);
        switch(meta.level) {
            case 0:
                const challengePage = this.response.challengePage(meta.url);
                return this.response.sendHtml(challengePage);
            case 1:
                const challengeScript = this.response.challengeScript(headers, body);
                return this.response.sendHtml(challengeScript);
            case 2:
            default:
                return { status, headers, body };
        }
    }
}

module.exports = waf;
