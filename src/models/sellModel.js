const db = require('../config/db');

const sellModel = {
    // 获取用户名
    getUsernameByUserId: async (userId) => {
        const [rows] = await db.query(`
            SELECT name FROM users WHERE id = ?
        `, [userId]);
        return rows[0]?.name || '未知用户';
    },

    // FIFO卖出 - 按买入顺序卖出（指定用户）
    sellByProductIdAndUserIdFIFO: async (productId, sellAmount, userId) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 获取该用户该产品的所有持仓记录（按买入顺序排序）
            const [holdings] = await connection.query(`
                SELECT h.*, p.name as product_name 
                FROM holdings h
                LEFT JOIN product p ON h.product_id = p.id
                WHERE h.product_id = ? AND h.user_id = ?
                ORDER BY h.id ASC
            `, [productId, userId]);

            if (holdings.length === 0) {
                throw new Error('没有找到该用户该产品的持仓记录');
            }

            // 获取当前产品价格和产品名称
            const [priceRows] = await connection.query(`
                SELECT pp.price, p.name as product_name 
                FROM product_price pp
                LEFT JOIN product p ON pp.id = p.id
                WHERE pp.id = ?
            `, [productId]);

            if (priceRows.length === 0) {
                throw new Error('没有找到该产品的价格信息');
            }

            const currentPrice = priceRows[0].price;
            const productName = priceRows[0].product_name; // 获取产品名称
            let remainingSellAmount = sellAmount;
            const soldHoldings = [];
            let totalProfit = 0; // 总收益
            let totalBuyValue = 0; // 总买入价值
            let totalSellValue = 0; // 总卖出价值

            // 按FIFO顺序卖出
            for (const holding of holdings) {
                if (remainingSellAmount <= 0) break;

                const sellFromThisHolding = Math.min(remainingSellAmount, holding.buy_amount);
                
                // 计算这笔交易的收益
                const buyValue = holding.buy_price * sellFromThisHolding;
                const sellValue = currentPrice * sellFromThisHolding;
                const profit = sellValue - buyValue;
                
                totalBuyValue += buyValue;
                totalSellValue += sellValue;
                totalProfit += profit;
                
                if (sellFromThisHolding === holding.buy_amount) {
                    // 完全卖出这个持仓记录
                    await connection.query(`
                        DELETE FROM holdings WHERE id = ?
                    `, [holding.id]);
                } else {
                    // 部分卖出，更新数量
                    await connection.query(`
                        UPDATE holdings 
                        SET buy_amount = buy_amount - ? 
                        WHERE id = ?
                    `, [sellFromThisHolding, holding.id]);
                }

                soldHoldings.push({
                    holding_id: holding.id,
                    product_name: productName, // 添加产品名称
                    sold_amount: sellFromThisHolding,
                    buy_price: holding.buy_price,
                    current_price: currentPrice,
                    buy_value: buyValue,
                    sell_value: sellValue,
                    profit: profit,
                    profit_percentage: ((currentPrice - holding.buy_price) / holding.buy_price) * 100
                });

                remainingSellAmount -= sellFromThisHolding;
            }

            // 将卖出的数量放回到product_quantity表中
            await connection.query(`
                UPDATE product_quantity 
                SET amount = amount + ? 
                WHERE id = ?
            `, [sellAmount, productId]);
            // 将收益添加到user_game_status表的余额中
            await connection.query(`
                UPDATE user_game_status 
                SET balance = balance + ? 
                WHERE user_id = ?
            `, [totalSellValue, userId]);

            if (remainingSellAmount > 0) {
                throw new Error(`可卖出数量不足，还需要 ${remainingSellAmount} 单位`);
            }

            await connection.commit();
            console.log('卖出操作成功');
            return {
                sold_holdings: soldHoldings,
                summary: {
                    product_name: productName, // 添加产品名称
                    total_sold_amount: sellAmount,
                    total_buy_value: totalBuyValue,
                    total_sell_value: totalSellValue,
                    total_profit: totalProfit,
                    total_profit_percentage: totalBuyValue > 0 ? (totalProfit / totalBuyValue) * 100 : 0,
                    current_price: currentPrice
                }
            };

        } catch (error) {
            console.error('卖出操作失败:', error);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = sellModel;
