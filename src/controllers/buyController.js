const buyModel = require('../models/buyModel');
const buyController = {
buyProduct: async (req, res) => {
    try {
        // 1. 解析请求参数
        const { productId, userId } = req.params;
        const { amount } = req.body;

        // 2. 参数验证
        if (!productId || isNaN (productId)) {
            return res.status (400).json ({ success: false, message: ' 产品 ID 无效 ' });
        }
        if (!userId || isNaN (userId)) {
            return res.status (400).json ({ success: false, message: ' 用户 ID 无效 ' });
        }
        if (!amount || amount <= 0 || isNaN (amount)) {
            return res.status (400).json ({ success: false, message: ' 请提供有效的购买数量 ' });
        }

        // 3. 前置检查
        const userExists = await buyModel.checkUserExists (userId);
        if (!userExists) {
            return res.status (404).json ({ success: false, message: ' 用户不存在 ' });
        }

        const currentQuantity = await buyModel.checkProductQuantity(productId);
        if (currentQuantity < amount) {
            return res.status(400).json({
            success: false,
            message: `库存不足，当前库存: ${currentQuantity}，请求购买: ${amount}`
        });
        }

        const currentBalance = await buyModel.checkUserBalance(userId);

        const productPrice = await buyModel.getProductPrice (productId);

        const totalCost = (productPrice * amount).toFixed (2);
        if (currentBalance < totalCost) {
            return res.status(400).json({
            success: false,
            message: `余额不足，当前余额: ${currentBalance}，请求购买总额: ${totalCost}`
        });
        }

        // 4. 执行买入操作
        
        const result = await buyModel.buyProduct (
            productId,
            userId,
            amount,
            productPrice
        );

        // 5. 格式化响应
        const productName = await buyModel.getProductName (productId);
        const userName = await buyModel.getUserName (userId);
        
        const actionType = result.isNewHolding ? ' 新购入 ' : ' 加仓 ';

        res.status(200).json({
        success: true,
        message: `用户 ${userName} 成功${actionType} ${amount} 个单位的 ${productName}，本次花费: ${totalCost} 元`,
        data: {
        holdingId: result.holdingId,
        productId: parseInt (productId),
        userId: parseInt (userId),
        productName,
        userName,
        buyPrice: productPrice,
        currentHoldingAmount: result.isNewHolding ? amount : await buyModel.getTotalHoldingAmount (productId, userId), // 新增时直接返回 amount，否则查总持仓
        totalCost: parseFloat (totalCost),
        remainingQuantity: result.remainingQuantity
        }
        });

    } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    }
    }
    };

module.exports = buyController;
