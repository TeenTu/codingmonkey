// 用于全局缓存所有产品的价格数据
// 结构: { stocks: [...], funds: [...] }

const priceCache = {
  stocks: [], // [{ symbol, shortname, prices: [{date, close}, ...] }]
  funds: []
};

module.exports = priceCache;
