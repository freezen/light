// lsof -i :7001

const { Controller } = require("egg");

const { ORIGIN_DATA } = require("../utils/sourceData");

const STOCKS = ORIGIN_DATA.map((item) => {
  return {
    name: item.split("(")[0],
    code: item.split("(")[1].split(")")[0],
  };
});

const isDealingTime = () => {
  const now = new Date(); // 获取当前时间
  // 获取日期对应的星期几（0表示周日，1表示周一，以此类推）
  const dayOfWeek = now.getDay();

  const threePM = new Date(); // 创建一个表示当天下午3:00的时间对象
  const offsetZone = now.getTimezoneOffset() / 60;
  threePM.setHours(15 + offsetZone + 8, 0, 0, 0); // 设置时间为下午3:00

  // 判断是否为周六（6）或周日（0）
  return dayOfWeek !== 0 && dayOfWeek !== 6 && now < threePM;
}

const DAY_NUMBER = 13;

class StrategyController extends Controller {
  async index() {
    const { ctx } = this;
    // eslint-disable-next-line no-unused-vars
    const { name } = ctx.params;
    const { start, end, code } = ctx.query;
    const list = [];
    let codes = STOCKS.slice(start, end);
    if (code) {
      codes = STOCKS.filter((item) => item.code === code);
    }
    for (let i = 0; i < codes.length; i++) {
      // 雅虎数据时间 range 是算实时价格的，也就是说如果在开盘时间进行量化计算，则最后一个价格是当天当前实时价格
      const endTime = new Date()
      if (isDealingTime()) {
        const offsetZone = endTime.getTimezoneOffset() / 60;
        endTime.setHours(6 + offsetZone + 8, 0, 0, 0)
      }
      const r = await ctx.service.volume.query(
        codes[i].code,
        endTime.getTime() - 24 * 60 * 60 * 1000 * DAY_NUMBER,
        endTime.getTime()
      );
      // {
      //   name: '1',
      //   price: '1',
      //   volume: '1',
      //   code: '1',
      // }

      // 天量阳线策略
      let isHad = false;
      let count = 0;
      let maxSort = 0;
      const LIMIT = 3;

      for (let j = 1; j < r.length; j++) {
        if (
          r[j] &&
          r[j].volume >= LIMIT * r[j - 1].volume &&
          r[j].close > r[j - 1].close &&
          r[j].close > r[j].open &&
          j > 1
        ) {
          isHad = true;
          if (parseInt(r[j].volume / r[j - 1].volume) > maxSort) {
            maxSort = parseInt(r[j].volume / r[j - 1].volume);
          }
        }
        // 5天内不能出现涨停次数 > 1
        if (
          Math.abs(
            parseInt(((r[j].close - r[j - 1].close) / r[j - 1].close) * 100)
          ) >= 9
        ) {
          count++;
        }
      }
      if (count > 1) {
        isHad = false;
      }
      if (isHad) {
        list.push({
          name: codes[i].name,
          price: r[r.length - 1].price,
          code: codes[i].code,
          strategy: "volume",
          sort: maxSort,
        });
      }

      // 强势巨阳线策略 (注意：本策略生效后经过一轮上涨，还可能有第二轮)
      // 1个大阳线（>8%）， 多吃多>=3阴，之前交易日，阴线多于阳线，且阴线的收盘价每一天均比前一个阴线低，过去的几天不能有超过3%的阳线,不能有超过6%的阴线，从最高点收盘（上引线几乎没有），量能不能太大（不能超出前一交易日的2.5倍）
      isHad = false;
      let waterCount = 0,
        fireCount = 0;
      let started = false;
      let fireMaxPrice = 0;
      let waterPrice = 0;
      count = 0;
      for (let j = r.length - 1; j > 2; j--) {
        if (
          parseInt(((r[j].close - r[j - 1].close) / r[j - 1].close) * 100) >=
            7 &&
          parseFloat(
            r[j].volume /
              ((r[j - 1].volume + r[j - 2].volume + r[j - 3].volume) / 3)
          ) < 2.03 &&
          parseFloat((r[j].high - r[j].close) / r[j].close) < 0.005
        ) {
          if (isHad === true) {
            // 不算第二次符合条件
            // console.warn('000000000')
            break;
          }
          started = true;
          fireMaxPrice = r[j].close;
          isHad = true;
          continue;
        }
        if (started === true) {
          if (r[j].close < r[j].open) {
            if (
              Math.abs(
                parseInt(((r[j].close - r[j - 1].close) / r[j - 1].close) * 100)
              ) >= 6
            ) {
              isHad = false;
              // console.warn(111111111)
              break;
            }
            if (r[j].close <= waterPrice) {
              // console.warn(22222222)
              break;
            }
            waterPrice = r[j].close;
            waterCount++;
          } else if (r[j].close > r[j].open) {
            if (
              parseInt(
                ((r[j].close - r[j - 1].close) / r[j - 1].close) * 100
              ) >= 3
            ) {
              isHad = false;
              // console.warn(3333333)
              break;
            }
            fireCount++;
          }
          if (r[j].close < fireMaxPrice && r[j].open < fireMaxPrice) {
            // console.warn('r[j].close', r[j].close, fireMaxPrice, r[j].open);
            count++;
            if (count >= 3) {
              break;
            }
          } else {
            // console.warn(444444444)
            break;
          }
        }
      }
      if (count < 3 || waterCount <= fireCount) {
        isHad = false;
      }
      if (isHad) {
        list.push({
          name: codes[i].name,
          price: r[r.length - 1].price,
          code: codes[i].code,
          strategy: "firedragon",
        });
      }


      // 错误排查
      for (let j = 0; j < r.length; j++) {
        if (r[j].name === '0') {
          list.push({
            name: codes[i].name,
            url: r[r.length - 1].url,
            code: codes[i].code,
            strategy: "error",
          });
        }
      }
      await new Promise((r) => {
        setTimeout(() => {
          r();
        }, 200);
      });
    }

    ctx.body = list;
  }
}

module.exports = StrategyController;
