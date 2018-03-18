const config = {
    privkey: 'uhfuihdsufafsdeqfnjwqnefqw',
    challenge: {
        url: '/waf/challenge',
        timeError: 1000 * 60 * 30,
    },
    pow: {
        page: {
            l: 5,
            m: 72,
            n: 36
        }
    }
};

module.exports = config;