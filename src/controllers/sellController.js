const sellModel = require('../models/sellModel');
const assetsAnalysisController = require('./assetsAnalysisController');

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
            
            // 记录已实现盈亏到运行时存储
            try {
                if (result.sold_holdings && result.sold_holdings.length > 0) {
                    // 优先从 summary 获取产品名称，其次从 sold_holdings 获取
                    const productName = result.summary.product_name || 
                                      result.sold_holdings[0].product_name || 
                                      'Unknown Product';
                    
                    assetsAnalysisController._recordTradeProfit(
                        userId,
                        productId,
                        productName,
                        result.summary.total_profit,
                        result.summary.total_profit_percentage,
                        result.summary.current_price,
                        result.summary.total_sold_amount,
                        result.summary.total_buy_value
                    );
                }
                
                // 更新总资产记录
                await assetsAnalysisController._updateTotalAssets(userId);
            } catch (analysisError) {
                console.error('Assets analysis update error:', analysisError);
                // 不影响卖出操作的成功
            }
            
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
