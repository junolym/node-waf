/**
 * server.js: Web应用防火墙的服务器入口
 * 基于koa的http代理程序
 */

const koa = require('koa');
const request = require('koa-request');
const yaml = require('js-yaml');
const fs = require('fs');
const waf = require('./src/index.js');

const config = yaml.safeLoad(fs.readFileSync(`${__dirname}/server.yml`, 'utf-8'));

const app = new koa();
const firewall = new waf(config.waf);

/**
 * waf中间件：修改请求和响应
 * 调用waf的process方法，在请求前processRequest，请求后
 *      processResponse
 * meta提供给waf使用
 */
app.use(async (ctx, next) => {
    const meta = {};
    if (firewall.processRequest(
            ctx.request.method,
            ctx.request.url,
            ctx.request.headers,
            ctx.request.body,
            meta
        )) {
        await next();
    }

    const res = firewall.processResponse(
        ctx.response.status,
        ctx.response.headers,
        ctx.response.body,
        meta
    );

    ctx.status = res.status;
    ctx.set(res.headers);
    ctx.body = res.body;
})

/**
 * 日志中间件：打印日志，输出代理延时
 */
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.status} ${ctx.method} ${ctx.url} - ${ms}`);
});


/**
 * 代理中间件：将请求转发至目标服务器
 * 请求包括url，method，headers，body
 * 响应包括headers，body
 */
app.use(function *() {
    const { scheme, host, port } = config.proxy;
    const headers = this.request.headers;
    headers['host'] = host;
    headers['Accept-Encoding'] = 'chunked';
    const url = `${scheme}://${host}:${port}${this.request.url}`

	const response = yield request({
        url: url,
        headers: headers,
        method: this.request.method,
        body: this.request.body,
	});

    this.status = response.statusCode;
    this.set(response.headers);
    this.body = response.body;
});

const { host, port } = config.server;
app.listen(port, host);
