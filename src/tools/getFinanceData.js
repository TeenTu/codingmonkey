const yf = require('yahoo-finance2').default;
const { subDays, format } = require('date-fns');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const pLimit = require('p-limit');

// 你的 symbol 列表
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
const limit = pLimit(2);

async function fetchHist(sym) {
  const to = new Date();
  const from = subDays(to, 60); 
  const opts = {
    period1: format(from, 'yyyy-MM-dd'),
    period2: format(to, 'yyyy-MM-dd'),
    interval: '1d'
  };
  const data = await yf.historical(sym, opts);
  return data.slice(-60).map(d => ({
    symbol: sym,
    date: d.date.toISOString().slice(0, 10),
    close: d.close
  }));
}

//Stocks
(async () => {
  const stocksResults = [];
  const promises = stocks.map(sym =>
    limit(() =>
      fetchHist(sym)
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
      {id: 'date', title: 'Date'},
      {id: 'close', title: 'Close'}
    ]
  });

  await stockscsvWriter.writeRecords(stocksResults);
  console.log('导出完成，文件名: stocksprices.csv');
})();

//Funds
(async () => {
    const fundsResults = [];
    const promises = funds.map(sym =>
      limit(() =>
        fetchHist(sym)
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
        {id: 'date', title: 'Date'},
        {id: 'close', title: 'Close'}
      ]
    });
  
    await fundscsvWriter.writeRecords(fundsResults);
    console.log('导出完成，文件名: fundsprices.csv');
  })();