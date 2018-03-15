
'use strict';

/**
 * Module dependencies.
 */


/**
 * processRequest
 * 请求处理函数
 * 
 * @param {Object} req
 * @param {Object} meta
 * @return {Bool}
 */
function processRequest(req, meta) {
    console.log(`${req.method} ${req.url} ${req.headers['user-agent']}`);

    //test meta
    meta.flag = 'abc';
    return true;
}



/**
 * processResponse
 * 响应处理函数
 *
 * @param {Object} res
 * @param {Object} meta
 */
function processResponse(res, meta) {
    res.body = res.body.replace(
        '</body>',
        `<script>console.log("waf: ${meta.flag}")</script></body>`
    );
}


module.exports = { processRequest, processResponse };