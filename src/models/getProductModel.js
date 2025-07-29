const db = require('../config/db');
const priceCache = require('../tools/priceCache');
// 在其他文件中导入
const Price = require('./priceUpdateModel');


const getProductModel = {
    // Debug function to test daily change calculation
    debugDailyChange: async (productCode, productType) => {
        console.log(`=== Debugging Daily Change Calculation ===`);
        console.log(`Product: ${productCode}, Type: ${productType}`);
        
        const result = calculateDailyChange(productCode, productType);
        console.log(`Result:`, result);
        console.log(`==========================================`);
        
        return result;
    },

    // Get all products with current prices, types, and daily changes
    getAllProducts: async () => {
        try {
            // Debug: 显示 priceCache 中的可用产品
            // console.log('=== PriceCache Debug Info ===');
            // console.log('Available stocks:', priceCache.stocks.map(s => ({ symbol: s.symbol, shortname: s.shortname, priceCount: s.prices.length })));
            // console.log('Available funds:', priceCache.funds.map(f => ({ symbol: f.symbol, shortname: f.shortname, priceCount: f.prices.length })));
            // console.log('=============================');
            
            const query = `
                SELECT 
                    p.id,
                    p.name,
                    p.code,
                    pp.price as current_price,
                    pt.type as product_type,
                    pq.amount as available_quantity
                FROM product p
                JOIN product_price pp ON p.id = pp.id
                JOIN product_type pt ON p.id = pt.id
                LEFT JOIN product_quantity pq ON p.id = pq.id
                ORDER BY pt.type, p.id
            `;
            
            const [products] = await db.query(query);
            
            // console.log('Database products:', products.map(p => ({ id: p.id, code: p.code, type: p.product_type })));
            
            // Calculate daily changes using priceCache
            const productsWithChanges = products.map(product => {
                const dailyChange = calculateDailyChange(product.code, product.product_type);
                
                return {
                    id: product.id,
                    name: product.name,
                    code: product.code,
                    current_price: parseFloat(product.current_price),
                    product_type: product.product_type,
                    available_quantity: product.available_quantity || 0,
                    daily_change: dailyChange.change,
                    daily_change_percentage: dailyChange.changePercentage,
                    previous_price: dailyChange.previousPrice
                };
            });
            
            // Group by product type
            const groupedProducts = {
                stocks: productsWithChanges.filter(p => p.product_type === 'Stock'),
                funds: productsWithChanges.filter(p => p.product_type === 'Fund')
            };
            
            return groupedProducts;
        } catch (error) {
            throw new Error(`Error fetching all products: ${error.message}`);
        }
    }
};

// Helper function to calculate daily change
function calculateDailyChange(productCode, productType) {
    try {
        // Determine which price cache to use - 修正类型判断
        const cacheSource = productType === 'Stock' ? priceCache.stocks : priceCache.funds;
        
        // console.log(`Calculating daily change for ${productCode} (${productType})`);
        // console.log(`Cache source length: ${cacheSource.length}`);
        
        // Find the product in cache by code
        const productPriceData = cacheSource.find(item => 
            item.symbol === productCode || item.shortname === productCode
        );
        
        if (!productPriceData) {
            console.log(`Product ${productCode} not found in cache`);
            return {
                change: 0,
                changePercentage: 0,
                previousPrice: null
            };
        }
        
        // console.log(`Found product data for ${productCode}, prices count: ${productPriceData.prices?.length || 0}`);
        
        if (!productPriceData.prices || productPriceData.prices.length < 2) {
            console.log(`Insufficient price data for ${productCode}`);
            return {
                change: 0,
                changePercentage: 0,
                previousPrice: null
            };
        }
        
        // Get the last two prices (today and yesterday)
        let currentDay = Price.getCurrentDay();
        const prices = productPriceData.prices;
        if (currentDay === 0) {
            // 第0天：返回0涨跌幅，因为没有对比基准
            console.log(`${productCode}: Zero day, Skip`);
            return {
                change: 0,
                changePercentage: 0,
                previousPrice: null
            };
        }else if (currentDay === 1){
            // 第一天：返回0涨跌幅，因为没有对比基准
            console.log(`${productCode}: First day, no comparison available`);
            return {
                change: 0,
                changePercentage: 0,
                previousPrice: null
            };
        }
        // 正常情况：获取今天和昨天的价格
        const todayPrice = prices[currentDay - 1].close;
        const yesterdayPrice = prices[currentDay - 2].close;

        console.log(`${productCode}: Today: ${todayPrice}, Yesterday: ${yesterdayPrice}`);
        
        const change = todayPrice - yesterdayPrice;
        const changePercentage = yesterdayPrice > 0 ? (change / yesterdayPrice * 100) : 0;
        
        const result = {
            change: parseFloat(change.toFixed(2)),
            changePercentage: parseFloat(changePercentage.toFixed(2)),
            previousPrice: parseFloat(yesterdayPrice.toFixed(2))
        };
        
        console.log(`${productCode} calculation result:`, result);
        return result;
    } catch (error) {
        console.error(`Error calculating daily change for ${productCode}:`, error);
        return {
            change: 0,
            changePercentage: 0,
            previousPrice: null
        };
    }
}

module.exports = getProductModel;
