// 引入 mysql 模块
const { Service } = require("egg");
const mysql = require('mysql2/promise');
const dayjs = require('dayjs');

// 创建数据库连接配置
const connection = mysql.createConnection({
  host: "localhost", // 数据库主机名
  user: "root", // 数据库用户名
  password: "hunter11", // 数据库密码
  database: "stock", // 数据库名称
});

class GetDBData extends Service {
  async insert({ code, price, open, close, high, low, volume, mydate }) {
    let rs;
    try {
      let dailydata = ''
      if (code.substring(0, 1) === '0') {
        // 深圳股票
        dailydata = 'dailydata002'
      } else if (code.substring(0, 1) === '3') {
        // 深证股票
        dailydata = 'dailydata30'
      } else if (code.substring(0, 1) === '6') {
        // 沪市股票
        dailydata = 'dailydata60'
      }
      const sql = `INSERT INTO ${dailydata} (code, price, open, close, high, low, volume, mydate) VALUES ('${code}', ${price}, ${open}, ${close},${high},${low},${volume},'${mydate}')`
      const rs = await this.get(code, mydate);
      if (rs.length <= 0) {
        (await connection).query(sql);
      }
      
    } catch (e) {
      // console.error("Error querying database: " + e.stack);
      return [];
    }

    return rs?.length > 0 ? rs : [];
  }
  async getRange(code, start, end) {
    let rs;
    try {
      let dailydata = ''
      if (code.substring(0, 1) === '0') {
        // 深圳股票
        dailydata = 'dailydata002'
      } else if (code.substring(0, 1) === '3') {
        // 深证股票
        dailydata = 'dailydata30'
      } else if (code.substring(0, 1) === '6') {
        // 沪市股票
        dailydata = 'dailydata60'
      }

      const query = `SELECT * FROM ${dailydata} where code='${code}' and mydate>='${start.split(' ')[0]}' and mydate<='${end.split(' ')[0]}' ORDER BY mydate`
      rs = await (await connection).query(query);
    } catch (e) {
      console.error("Error querying database: " + e.stack);
      return [];
    }

    return rs?.[0]?.map(item => ({
      ...item,
      name: '1',
      mydate: dayjs.unix(parseInt(new Date(item.mydate).getTime() / 1000)).format('YYYY-MM-DD HH:mm:ss')
    }));
  }
  async get(code, mydate) {
    let rs;
    try {
      let dailydata = ''
      if (code.substring(0, 1) === '0') {
        // 深圳股票
        dailydata = 'dailydata002'
      } else if (code.substring(0, 1) === '3') {
        // 深证股票
        dailydata = 'dailydata30'
      } else if (code.substring(0, 1) === '6') {
        // 沪市股票
        dailydata = 'dailydata60'
      }

      const query = `SELECT * FROM ${dailydata} where code='${code}' and mydate='${mydate.split(' ')[0]}'`
      rs = await (await connection).query(query);
    } catch (e) {
      console.error("Error querying database: " + e.stack);
      return [];
    }

    return rs?.[0];
  }
}

module.exports = GetDBData;
