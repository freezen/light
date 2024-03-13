const { Service } = require('egg');
const dayjs = require('dayjs');
const axios = require('axios').default;

const targetUrl = 'http://127.0.0.1:9090';

const HttpsProxyAgent = require('https-proxy-agent');

const agent = new HttpsProxyAgent.HttpsProxyAgent(targetUrl);

const genSCode = code => {
  // 生成 yahoo 专用的 secid

  // Parameters
  // ----------
  // code : 6 位股票代码
  // ----------

  if (code.substring(0, 1) === '0') {
    // 深圳股票
    return `${code}.SZ`;
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
    // eslint-disable-next-line no-unused-vars
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
      ?symbol=${genSCode(stockId)}&period1=${getTimeFormat(beg)}&period2=${getTimeFormat(end)}&useYfid=true&interval=1d
      &includePrePost=true&events=div%7Csplit%7Cearn&lang=en-US&region=US
      &crumb=3dUcvZPUzgm&corsDomain=finance.yahoo.com`;

    const url = baseUrl.replace(/[\n\t\s]/g, '');

    // console.warn('url', url);

    let res = '';

    // eslint-disable-next-line prefer-const
    let list = []

    try {
      res = await axios.get(url, {
        headers: mockHeaders,
        httpsAgent: agent,
        timeout: 7000
      });

      // {
      //   name: '1',
      //   price: '1',
      //   volume: '1',
      //   code: '1',
      // }

      // eslint-disable-next-line no-unused-vars
      const { close, low, open, high, volume } = res?.data?.chart?.result?.[0]?.indicators?.quote?.[0]
      const timestamp = res?.data?.chart?.result?.[0]?.timestamp

      for (let i = 0; i < close?.length; i++) {
        const item = {
          name: '1',
          price: parseFloat(close[i]).toFixed(2),
          close: parseFloat(close[i]).toFixed(2),
          open: parseFloat(open[i]).toFixed(2),
          low: parseFloat(low[i]).toFixed(2),
          high: parseFloat(high[i]).toFixed(2),
          volume: parseInt(volume[i]),
          code: stockId,
          mydate: dayjs.unix(timestamp[i]).format('YYYY-MM-DD HH:mm:ss')
        }

        ctx.service.dailydata.insert(item)

        list.push(item)
      }

      // console.warn('list', list);
      
    } catch (e) {
      const item = {
        name: '0',
        url,
        price: 0,
        close: 0,
        open: 0,
        low: 0,
        high: 0,
        volume: 0,
        code: stockId,
        mydate: ''
      }
      list.push(item)
      console.warn('Own error:', e, url);
    }
    
    return list;
  }
}
module.exports = RobotVolume;
