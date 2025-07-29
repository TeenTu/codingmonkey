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

            const result = await sellModel.sellByProductIdAndUserIdFIFO(productId, amount, userId);
            
            // 格式化收益信息
            const profitInfo = result.summary.total_profit >= 0 ? 
                `盈利 ${result.summary.total_profit.toFixed(2)} 元` : 
                `亏损 ${Math.abs(result.summary.total_profit).toFixed(2)} 元`;
            
            res.json({
                success: true,
                message: `用户 ${username} 成功卖出 ${amount} 单位产品，${profitInfo}`,
                data: {
                    sold_amount: amount,
                    sold_holdings: result.sold_holdings,
                    profit_summary: {
                        total_sold_amount: result.summary.total_sold_amount,
                        total_buy_value: result.summary.total_buy_value.toFixed(2),
                        total_sell_value: result.summary.total_sell_value.toFixed(2),
                        total_profit: result.summary.total_profit.toFixed(2),
                        total_profit_percentage: result.summary.total_profit_percentage.toFixed(2),
                        current_price: result.summary.current_price,
                        profit_status: result.summary.total_profit >= 0 ? '盈利' : '亏损'
                    }
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
