const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const priceUpdateController = require('../controllers/priceUpdateController');
const sellController = require('../controllers/sellController');
const getPortfolioController = require('../controllers/getPortfolioController');
const gameController = require('../controllers/gameController');

// Performance route
router.get('/performance', performanceController.getPerformance);

// Price update routes
router.post('/update-prices', priceUpdateController.updatePrices);
router.get('/price-update-status', priceUpdateController.getStatus);
router.post('/reset-price-updates', priceUpdateController.resetDays);

// Sell product route, FIFO卖出产品（按买入顺序）
router.post('/sell/product/:productId/user/:userId', sellController.sellProductFIFO);

// Browse/Get portfolio
router.get('/portfolio/user/:userId', getPortfolioController.getPortfolio);

// Game initialization route
router.post('/gameinit', gameController.initializeGame);

// Advance day route
router.post('/advanceday/user/:userId', gameController.advanceDay);

module.exports = router;