const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const priceUpdateController = require('../controllers/priceUpdateController');
const sellController = require('../controllers/sellController');
const buyController = require('../controllers/buyController');
const productController = require('../controllers/productController');
// Performance route
router.get('/performance', performanceController.getPerformance);

// Price update routes
router.post('/update-prices', priceUpdateController.updatePrices);
router.get('/price-update-status', priceUpdateController.getStatus);
router.post('/reset-price-updates', priceUpdateController.resetDays);

// Sell product route, FIFO卖出产品（按买入顺序）
router.post('/sell/product/:productId/user/:userId', sellController.sellProductFIFO);

// Buy product route
router.post ('/buy/product/:productId/user/:userId', buyController.buyProduct);

//Get product route
// 获取所有产品的完整信息
router.get('/product', productController.getAllProducts);

// 根据ID获取单个产品详情
router.get('/product:productId', productController.getProductById);

router

module.exports = router;