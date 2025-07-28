const sellModel = require('../models/sellModel');

const sellController = {
    // FIFO卖出产品（按买入顺序）
    sellProductFIFO: async (req, res) => {
        try {
            const { productId, userId } = req.params;
            const { amount } = req.body;
            const username = await sellModel.getUsernameByUserId(userId);

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: '请提供有效的卖出数量'
                });
            }

            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: '产品ID无效'
                });
            }

            const soldHoldings = await sellModel.sellByProductIdAndUserIdFIFO(productId, amount, userId);
            
            res.json({
                success: true,
                message: `用户 ${username} 成功卖出 ${amount} 单位产品`,
                data: {
                    sold_amount: amount,
                    sold_holdings: soldHoldings
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = sellController;
