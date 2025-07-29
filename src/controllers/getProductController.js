const getProductModel = require('../models/getProductModel');

const getProductController = {
    // Get all products with current prices and daily changes
    getAllProducts: async (req, res) => {
        try {
            const products = await getProductModel.getAllProducts();
            
            if (!products) {
                return res.status(404).json({
                    success: false,
                    message: 'No products found',
                    data: {
                        stocks: [],
                        funds: []
                    }
                });
            }
            
            // Calculate summary statistics
            const totalStocks = products.stocks.length;
            const totalFunds = products.funds.length;
            const totalProducts = totalStocks + totalFunds;
            
            // Calculate market summary
            const stocksGainersCount = products.stocks.filter(s => s.daily_change > 0).length;
            const stocksLosersCount = products.stocks.filter(s => s.daily_change < 0).length;
            const fundsGainersCount = products.funds.filter(f => f.daily_change > 0).length;
            const fundsLosersCount = products.funds.filter(f => f.daily_change < 0).length;
            
            res.json({
                success: true,
                message: 'Products retrieved successfully',
                data: {
                    stocks: products.stocks,
                    funds: products.funds,
                    summary: {
                        total_products: totalProducts,
                        total_stocks: totalStocks,
                        total_funds: totalFunds,
                        stocks_gainers: stocksGainersCount,
                        stocks_losers: stocksLosersCount,
                        stocks_unchanged: totalStocks - stocksGainersCount - stocksLosersCount,
                        funds_gainers: fundsGainersCount,
                        funds_losers: fundsLosersCount,
                        funds_unchanged: totalFunds - fundsGainersCount - fundsLosersCount
                    }
                }
            });
        } catch (error) {
            console.error('Get all products error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve products',
                error: error.message
            });
        }
    },

    // Get product detail by ID
    getProductDetail: async (req, res) => {
        try {
            const { productId } = req.params;
            
            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }
            
            const productDetail = await getProductModel.getProductDetail(parseInt(productId));
            
            if (!productDetail) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Product detail retrieved successfully',
                data: productDetail
            });
        } catch (error) {
            console.error('Get product detail error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve product detail',
                error: error.message
            });
        }
    },

    // Get products by type (stocks or funds)
    getProductsByType: async (req, res) => {
        try {
            const { type } = req.params;
            
            if (!type || !['stocks', 'funds'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product type. Must be "stocks" or "funds"'
                });
            }
            
            const products = await getProductModel.getAllProducts();
            const filteredProducts = products[type];
            
            res.json({
                success: true,
                message: `${type} retrieved successfully`,
                data: {
                    [type]: filteredProducts,
                    count: filteredProducts.length
                }
            });
        } catch (error) {
            console.error(`Get ${type} error:`, error);
            res.status(500).json({
                success: false,
                message: `Failed to retrieve ${type}`,
                error: error.message
            });
        }
    },

    // Debug function for daily change calculation
    debugDailyChange: async (req, res) => {
        try {
            const { code, type } = req.query;
            
            if (!code || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Product code and type are required'
                });
            }
            
            const result = await getProductModel.debugDailyChange(code, type);
            
            res.json({
                success: true,
                message: 'Debug calculation completed',
                data: {
                    product_code: code,
                    product_type: type,
                    calculation_result: result
                }
            });
        } catch (error) {
            console.error('Debug daily change error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to debug daily change',
                error: error.message
            });
        }
    },

    // Internal function for getting all products (for use by other modules)
    _getAllProducts: async () => {
        try {
            const products = await getProductModel.getAllProducts();
            
            if (!products) {
                throw new Error('No products found');
            }
            
            return {
                success: true,
                data: products
            };
        } catch (error) {
            throw new Error(`Failed to get all products: ${error.message}`);
        }
    }
};

module.exports = getProductController;

// 导出内部函数供其他模块使用Example usage:
// const getAllProductController = require('./getAllProductController');
// const result = await getAllProductController._getAllProducts();
// 需要验证result字段success是否为true
