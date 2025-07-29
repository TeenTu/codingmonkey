const express = require('express'); 
const router = express.Router(); 
const buyController = require('../controllers/buyController');

// 买入产品接口：POST /product/:productId/user/:userId
router.post ('/buy/product/:productId/user/:userId', buyController.buyProduct);

module.exports = router;