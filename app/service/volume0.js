const { Service } = require('egg');
const axios = require('axios').default;

const targetUrl = 'http://127.0.0.1:9090';

const HttpsProxyAgent = require('https-proxy-agent');

const agent = new HttpsProxyAgent.HttpsProxyAgent(targetUrl);

const genSCode = code => {
  // 生成东方财富专用的 secid

  // Parameters
  // ----------
  // code : 6 位股票代码
  // ----------

  if (code.substring(0, 3) === '000') {
    // 沪市指数
    return `${code}.SS`;
  } else if (code.substring(0, 1) === '3') {
    // 深证股票
    return `${code}.SZ`;
  } else if (code.substring(0, 1) === '6') {
    // 沪市股票
    return `${code}.SS`;
  }
  return "";
};

// eslint-disable-next-line arrow-parens
const getTimeFormat = (t) => {
  return parseInt(t / 1000);
};

class RobotVolume extends Service {
  async query(stockId, beg, end) {
    const { ctx } = this;
    const { name } = ctx.params;

    
    // eslint-disable-next-line no-unused-vars
    const mockHeaders = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Referer: "",
      Host: '',
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      Cookie: 'A1=okbhEX.AzkH',
    };

    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${genSCode(stockId)}
      ?symbol=${genSCode(stockId)}&period1=${getTimeFormat(beg)}&period2=${getTimeFormat(end)}&useYfid=true&interval=5m
      &includePrePost=true&events=div%7Csplit%7Cearn&lang=en-US&region=US
      &crumb=3dUcvZPUzgm&corsDomain=finance.yahoo.com`;

    const url = baseUrl.replace(/[\n\t\s]/g, '');

    console.log('baseurl', baseUrl, url);

    let res = '';

    try {
      
      res = await axios.get(url, {
        headers: mockHeaders,
        httpsAgent: agent,
        // proxy: {
          
        //   host: '127.0.0.1',
        //   port: 9090,
        //   protocol: 'http',
        //   auth: {
        //     username: 'f_dstandout@126.com',
        //     password: 'hunter11',
        //   },
        // },
      });
      console.log('res', res);
    } catch (e) {
      console.warn(e);
    }
    
    return name + "boluke" + res;
  }
}
module.exports = RobotVolume;
