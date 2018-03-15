/**
 * demo1: proxy based on koa
 * 将请求转发至真正的后端程序
 * 暂不支持负载均衡等高级功能
 */
const config = {
    host: 'www.baidu.com',
    scheme: 'https',
    serverhost: '0.0.0.0',
    serverport: '8010'
}

const koa = require('koa');
const request = require('koa-request');

const app = new koa();

const waf = require('../src/index.js');

/**
 * waf中间件：修改请求和响应
 * 调用waf的process方法，在请求前processRequest，请求后
 *      processResponse
 * meta提供给waf使用
 */
app.use(async (ctx, next) => {
    const meta = {};
    if (waf.processRequest(ctx.request, meta)) {
        await next();
    }
    waf.processResponse(ctx.response, meta);
})

/**
 * 日志中间件：打印日志，输出代理延时
 */
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});


/**
 * 代理中间件：将请求转发至目标服务器
 * 请求包括url，method，headers，body
 * 响应包括headers，body
 */
app.use(function *() {
    let headers = this.request.headers;
    headers['host'] = config.host;
    headers['Accept-Encoding'] = 'chunked';

	let options = {
        url: `${config.scheme}://${config.host}${this.request.url}`,
        method: this.request.method,
        headers: headers,
        body: this.request.body,
	};

	let response = yield request(options);

    this.set(response.headers);
    this.body = response.body;    
});

app.listen(config.serverport, config.serverhost);
