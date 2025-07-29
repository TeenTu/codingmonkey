const productModel = require('../models/productModel');

const productController = {
    // 获取所有产品信息
    getAllProducts: async (req, res) => {
        try {
            const products = await productModel.getAllProducts();
            
            if (products.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: '暂无产品数据',
                    data: []
                });
            }
            
            // 格式化响应数据（补充统计信息）
            
            
            res.status(200).json({
                success: true,
                message: `成功获取 ${products.length} 个产品信息`,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取产品信息失败',
                error: error.message
            });
        }
    },

    // 获取单个产品详情
    getProductById: async (req, res) => {
        try {
            const { productId } = req.params;
            
            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: '产品ID无效'
                });
            }
            
            const product = await productModel.getProductById(productId);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: '未找到该产品'
                });
            }
            
            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取产品详情失败',
                error: error.message
            });
        }
    }
};

module.exports = productController;