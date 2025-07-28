const express = require('express');
const router = express.Router();
const sellController = require('../controllers/sellController');

// FIFO卖出产品（按买入顺序）
router.post('/product/:productId/user/:userId', sellController.sellProductFIFO);

module.exports = router; 