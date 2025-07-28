const db = require('../config/db');

const sellModel = {
    // 获取用户名
    getUsernameByUserId: async (userId) => {
        const [rows] = await db.query(`
            SELECT username FROM user WHERE user_id = ?
        `, [userId]);
        return rows[0]?.username || '未知用户';
    },

    // FIFO卖出 - 按买入顺序卖出（指定用户）
    sellByProductIdAndUserIdFIFO: async (productId, sellAmount, userId) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 获取该用户该产品的所有持仓记录（按买入顺序排序）
            const [holdings] = await connection.query(`
                SELECT * FROM holdings 
                WHERE product_id = ? AND user_id = ?
                ORDER BY id ASC
            `, [productId, userId]);

            if (holdings.length === 0) {
                throw new Error('没有找到该用户该产品的持仓记录');
            }

            let remainingSellAmount = sellAmount;
            const soldHoldings = [];

            // 按FIFO顺序卖出
            for (const holding of holdings) {
                if (remainingSellAmount <= 0) break;

                const sellFromThisHolding = Math.min(remainingSellAmount, holding.buy_amount);
                
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
                    sold_amount: sellFromThisHolding,
                    buy_price: holding.buy_price
                });

                remainingSellAmount -= sellFromThisHolding;
            }

            if (remainingSellAmount > 0) {
                throw new Error(`可卖出数量不足，还需要 ${remainingSellAmount} 单位`);
            }

            await connection.commit();
            return soldHoldings;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = sellModel;
