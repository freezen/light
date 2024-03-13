// 引入 mysql 模块
const { Service } = require("egg");
const mysql = require("mysql");

// 创建数据库连接配置
const connection = mysql.createConnection({
  host: "localhost", // 数据库主机名
  user: "root", // 数据库用户名
  password: "hunter11", // 数据库密码
  database: "stock", // 数据库名称
});

connection.connect();

class Dailydata extends Service {
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

      rs = await connection.query(sql);
    } catch (e) {
      console.error("Error querying database: " + e.stack);
      return [];
    }

    return rs;
  }
  async get(code, mydate) {
    let rs;
    try {
      await connection.connect();
      rs = await connection.query(`SELECT * FROM dailydata60 where code='${code}' and mydate='${mydate}'`);
      // console.log("Query result:", rs);
    } catch (e) {
      console.error("Error querying database: " + e.stack);
      return [];
    }

    return rs;
  }
}

module.exports = Dailydata;
