const yf = require('yahoo-finance2').default;
const { subDays, format } = require('date-fns');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const pLimit = require('p-limit');
const priceCache = require('./priceCache');

// 你的 code 列表
const stocks = [
  "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "META", "TSLA", "BRK-B",
  "JPM", "UNH", "V", "WMT", "JNJ", "PG", "HD", "MA", "DIS", "CRM",
  "INTC", "ADBE", "NFLX", "BAC", "AMD", "ORCL", "CSCO", "KO", "PFE",
  "XOM", "T", "MMM"
];
const funds = [
  "VOO", "SPY", "IVV", "VTI", "SCHD",
  "VUG", "VTV", "VYM", "XLK", "XLE",
  "XLF", "IWM", "IJH", "VWO", "EEM"
];


// 控制并发
const limit = pLimit(1); // 并发降为1，配合延时更安全


async function fetchHistWithName(sym) {
  const to = new Date();
  const from = subDays(to, 60);
  const opts = {
    period1: format(from, 'yyyy-MM-dd'),
    period2: format(to, 'yyyy-MM-dd'),
    interval: '1d'
  };
  // 增加延时，防止被风控
  await new Promise(r => setTimeout(r, 1500));
  const [data, quote] = await Promise.all([
    yf.historical(sym, opts),
    yf.quote(sym)
  ]);
  const shortName = quote && quote.shortName ? quote.shortName : '';
  return data.slice(-60).map(d => ({
    symbol: sym,
    shortname: shortName,
    date: d.date.toISOString().slice(0, 10),
    close: d.close
  }));
}


//Stocks
(async () => {
  const stocksResults = [];
  const promises = stocks.map(sym =>
    limit(() =>
      fetchHistWithName(sym)
        .then(arr => stocksResults.push(...arr))
        .catch(err => console.error(sym, err.message))
    )
  );
  await Promise.all(promises);

  // 写入 CSV
  const stockscsvWriter = createCsvWriter({
    path: 'stocksprices.csv',
    header: [
      {id: 'symbol', title: 'Symbol'},
      {id: 'shortname', title: 'ShortName'},
      {id: 'date', title: 'Date'},
      {id: 'close', title: 'Close'}
    ]
  });

  await stockscsvWriter.writeRecords(stocksResults);
  console.log('导出完成，文件名: stocksprices.csv');

  // 整理为 { symbol, shortname, prices: [{date, close}, ...] }
  const grouped = {};
  for (const row of stocksResults) {
    if (!grouped[row.symbol]) grouped[row.symbol] = { symbol: row.symbol, shortname: row.shortname, prices: [] };
    grouped[row.symbol].prices.push({ date: row.date, close: row.close });
  }
  priceCache.stocks = Object.values(grouped);
})();


//Funds
(async () => {
  const fundsResults = [];
  const promises = funds.map(sym =>
    limit(() =>
      fetchHistWithName(sym)
        .then(arr => fundsResults.push(...arr))
        .catch(err => console.error(sym, err.message))
    )
  );
  await Promise.all(promises);

  // 写入 CSV
  const fundscsvWriter = createCsvWriter({
    path: 'fundsprices.csv',
    header: [
      {id: 'symbol', title: 'Symbol'},
      {id: 'shortname', title: 'ShortName'},
      {id: 'date', title: 'Date'},
      {id: 'close', title: 'Close'}
    ]
  });

  await fundscsvWriter.writeRecords(fundsResults);
  console.log('导出完成，文件名: fundsprices.csv');

  // 整理为 { symbol, shortname, prices: [{date, close}, ...] }
  const grouped = {};
  for (const row of fundsResults) {
    if (!grouped[row.symbol]) grouped[row.symbol] = { symbol: row.symbol, shortname: row.shortname, prices: [] };
    grouped[row.symbol].prices.push({ date: row.date, close: row.close });
  }
  priceCache.funds = Object.values(grouped);
})();