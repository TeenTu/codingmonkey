
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
const assetsAnalysisController = require('../controllers/assetsAnalysisController');

// Performance route
router.get('/performance/', performanceController.getPerformance);

// Assets analysis routes
router.get('/assets/total', assetsAnalysisController.getTotalAssets);
router.get('/assets/history', assetsAnalysisController.getTotalAssetsHistory);
router.get('/assets/contributions', assetsAnalysisController.getProductContributions);
router.delete('/assets/clear', assetsAnalysisController.clearUserAnalysisData);

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

// Get product detail by ID
router.get('/product/detail/:productId', getProductController.getProductDetail);

// Game initialization route
router.post('/gameinit', gameController.initializeGame);

// Get game status route
router.get('/gamestatus', gameController.getGameStatus);

// Advance day route
router.get('/advanceday', gameController.advanceDay);

// Restart game route
router.post('/restartgame', gameController.restartGame);

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