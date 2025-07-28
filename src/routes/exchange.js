const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchangeController');

// Portfolio routes
router.get('/portfolio', exchangeController.getPortfolio);
router.post('/portfolio', exchangeController.createPortfolio);
router.put('/portfolio/:id', exchangeController.updatePortfolio);
router.delete('/portfolio/:id', exchangeController.deletePortfolio);

// Trading routes
router.post('/trade', exchangeController.executeTrade);
router.get('/trades', exchangeController.getTradeHistory);

module.exports = router;