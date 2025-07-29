// 用于全局缓存所有产品的价格数据
// 结构: { stocks: [...], funds: [...] }

const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/sync');

function loadPrices(csvPath) {
  const absPath = path.resolve(__dirname, csvPath);
  if (!fs.existsSync(absPath)) return [];
  const content = fs.readFileSync(absPath, 'utf8');
  const records = csvParse.parse(content, { columns: true, skip_empty_lines: true });
  // 按 symbol 分组
  const map = new Map();
  for (const row of records) {
    const symbol = row.Symbol || row.symbol;
    const shortname = row.ShortName || row.shortname;
    const date = row.Date || row.date;
    const close = parseFloat(row.Close || row.close);
    if (!symbol || !date || isNaN(close)) continue;
    if (!map.has(symbol)) {
      map.set(symbol, { symbol, shortname, prices: [] });
    }
    map.get(symbol).prices.push({ date, close });
  }
  // 按日期升序排序
  for (const v of map.values()) {
    v.prices.sort((a, b) => a.date.localeCompare(b.date));
  }
  return Array.from(map.values());
}

const priceCache = {
  stocks: loadPrices('./stocksprices.csv'),
  funds: loadPrices('./fundsprices.csv')
};

module.exports = priceCache;
