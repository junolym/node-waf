const utils = require('./utils.js');

class Request {
    constructor(config) {
        this.config = config;
    }

    /**
     * isChallenge
     *
     * @param {String} method
     * @param {String} url
     * @returns {Bool}
     */
    isChallenge(method, url) {
        return 'POST' == method && this.config.challenge.url == url;
    }


    /**
     * challengeCheck
     *
     * @param {Object} headers
     * @param {String} body
     * @returns {Object} {code, data}
     * 
     * 返回值code：
     * 0： 验证失败
     * 1： 验证成功
     * 2： 返回json信息
     */
    challengeCheck(headers, body) {
        let code, data;
        try {
            // check timestamp
            const { timestamp, question, answer, url } = body;

            const ts = parseInt(timestamp);
            const timeError = Math.abs(ts - (new Date()).getTime());
            if (timeError > this.config.challenge.timeError)
                return { code: 2, data: 'timestamp error' };

            // check signature
            if (utils.signature(url, ts, this.config.privkey) !== question)
                return { code: 2, data: 'question error' };
                
            // check answer
            const ans = answer.split(',');
            const { l, m, n } = this.config.pow.page;
            if (ans.length !== n)
                return { code: 2, data: 'ans length error' };
            
            for (let i = 0; i < n; i++) {
                const str = i.toString(36) + question + ans[i];
                if (parseInt(utils.sha256(str).slice(-l), 16) >= m)
                    return { code: 2, data: 'ans error' };
            }

            return { code: 0, data: url };
        } catch(e) {
            console.error(e);
        }

        return {
            code: 2,
            data: '/'
        }
    }

    /**
     * analyze
     *
     * @param {String} method
     * @param {String} url
     * @param {Object} headers
     * @returns {Object} {grade, level}
     */
    analyze(method, url, headers) {
        return { grade: 100, level: 0 };
    }
};

module.exports = Request;