const db = require('../config/db');
const priceCache = require('../tools/priceCache');

const getAllProductModel = {
    // Get all products with current prices, types, and daily changes
    getAllProducts: async () => {
        try {
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
        // Determine which price cache to use
        const cacheSource = productType === '股票' ? priceCache.stocks : priceCache.funds;
        
        // Find the product in cache by code
        const productPriceData = cacheSource.find(item => 
            item.symbol === productCode || item.shortname === productCode
        );
        
        if (!productPriceData || !productPriceData.prices || productPriceData.prices.length < 2) {
            return {
                change: 0,
                changePercentage: 0,
                previousPrice: null
            };
        }
        
        // Get the last two prices (today and yesterday)
        const prices = productPriceData.prices;
        const todayPrice = prices[prices.length - 1].close;
        const yesterdayPrice = prices[prices.length - 2].close;
        
        const change = todayPrice - yesterdayPrice;
        const changePercentage = yesterdayPrice > 0 ? (change / yesterdayPrice * 100) : 0;
        
        return {
            change: parseFloat(change.toFixed(2)),
            changePercentage: parseFloat(changePercentage.toFixed(2)),
            previousPrice: parseFloat(yesterdayPrice.toFixed(2))
        };
    } catch (error) {
        console.error(`Error calculating daily change for ${productCode}:`, error);
        return {
            change: 0,
            changePercentage: 0,
            previousPrice: null
        };
    }
}

module.exports = getAllProductModel;
