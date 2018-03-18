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
     */
    challengeCheck(headers, body) {
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