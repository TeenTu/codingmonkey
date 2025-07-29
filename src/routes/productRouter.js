const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// 获取所有产品的完整信息
router.get('/product', productController.getAllProducts);

// 根据ID获取单个产品详情
router.get('/product:productId', productController.getProductById);

module.exports = router;