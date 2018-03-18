const fs = require('fs');
const crypto = require('crypto');

const utils = {
    loadHtml(filename) {
        let html;
        if (filename instanceof Array) {
            html = {};
            filename.forEach(name => {
                html[name] = fs.readFileSync(`${__dirname}/html/${name}.html`, 'utf-8');
            });
        } else {
            html = fs.readFileSync(`${__dirname}/html/${filename}.html`, 'utf-8');
        }
        return html;
    },

    htmlRender(html, params) {
        for(let key in params) {
            html = html.replace(`{{${key}}}`, params[key]);
        }
        return html;
    },

    signature(url, ts, privkey) {
        const md5 = crypto.createHash('md5');
        return md5.update(url + ts + privkey).digest('hex');
    },

    sha256(str) {
        return crypto.createHash('sha256').update(str).digest('hex');
    },

    log(method, url, headers, result) {

    }
};

module.exports = utils;