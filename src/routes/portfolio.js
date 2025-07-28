const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const priceUpdateController = require('../controllers/priceUpdateController');

// Performance route
router.get('/performance', performanceController.getPerformance);

// Price update routes
router.post('/update-prices', priceUpdateController.updatePrices);
router.get('/price-update-status', priceUpdateController.getStatus);
router.post('/reset-price-updates', priceUpdateController.resetDays);

module.exports = router;