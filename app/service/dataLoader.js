const { Service } = require('egg');
const dayjs = require('dayjs');

const MODE_ENUM = {
  VALIDATE: 'validate', // 策略回归，走数据库历史数据
  DISCOVERY: 'discovery', // 探索请求模式，均请求新数据
  MIX: 'mix', // 混合模式, 无历史数据则请求数据
}

class DataLoader extends Service {
  async load(code, start, end, mode) {
    let rs;
    try {
      if (mode === MODE_ENUM.DISCOVERY) {
        rs = await this.ctx.service.getCloudData.query(
          code,
          start,
          end,
        );
      } else if (mode === MODE_ENUM.VALIDATE) {
        rs = await this.ctx.service.getDBData.getRange(code, dayjs.unix(parseInt(start / 1000)).format('YYYY-MM-DD HH:mm:ss'), dayjs.unix(parseInt(end / 1000)).format('YYYY-MM-DD HH:mm:ss'))
      } else if (mode === MODE_ENUM.MIX) {
        // 判断是否有当天数据，没有的话，就取云端数据
        rs = await this.ctx.service.getDBData.getRange(code, dayjs.unix(parseInt(end / 1000)).format('YYYY-MM-DD HH:mm:ss'), dayjs.unix(parseInt(end / 1000)).format('YYYY-MM-DD HH:mm:ss'))
        if (rs.length <= 0) {
          rs = await this.ctx.service.getCloudData.query(
            code,
            start,
            end,
          );
        }
      }
    } catch (e) {
      // console.error("Error querying database: " + e.stack);
      return [];
    }

    return rs?.length > 0 ? rs : [];
  }
}

module.exports = DataLoader;
