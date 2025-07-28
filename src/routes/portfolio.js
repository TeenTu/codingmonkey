const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

// Performance route
router.get('/performance', performanceController.getPerformance);


module.exports = router;