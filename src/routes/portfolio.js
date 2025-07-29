const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const priceUpdateController = require('../controllers/priceUpdateController');
const sellController = require('../controllers/sellController');
const buyController = require('../controllers/buyController');
const productController = require('../controllers/productController');
const getPortfolioController = require('../controllers/getPortfolioController');
const gameController = require('../controllers/gameController');
const getProductController = require('../controllers/getProductController');

// Performance route
router.get('/performance/', performanceController.getPerformance);

// Price update routes
router.post('/update-prices', priceUpdateController.updatePrices);
router.get('/price-update-status', priceUpdateController.getStatus);
router.post('/reset-price-updates', priceUpdateController.resetDays);

// Sell product route, FIFO卖出产品（按买入顺序）
router.post('/sell/product/:productId/user/:userId', sellController.sellProductFIFO);

// Browse/Get portfolio
router.get('/portfolio/user/:userId', getPortfolioController.getPortfolio);

// Get all products route
router.get('/products', getProductController.getAllProducts);
router.get('/products/:type', getProductController.getProductsByType);
router.get('/products/debug/daily-change', getProductController.debugDailyChange);

// Game initialization route
router.post('/gameinit', gameController.initializeGame);

// Advance day route
router.get('/advanceday', gameController.advanceDay);

// Get user balance
router.get('/getbalance', gameController.getUserBalance);
// Update user balance
router.post('/updatebalance', gameController.updateUserBalance);

// 买入产品接口：POST /product/:productId/user/:userId
router.post ('/buy/product/:productId/user/:userId', buyController.buyProduct);

// 获取所有产品的完整信息
router.get('/product', productController.getAllProducts);

// 根据ID获取单个产品详情
router.get('/productById/:productId', productController.getProductById);


module.exports = router;