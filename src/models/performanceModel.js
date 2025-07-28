const db = require('../config/db');

const Performance = {
    // Get performance data for all holdings
    getPerformance: async () => {
        try {
            const [holdings] = await db.query(`
                SELECT 
                    h.holding_id,
                    h.product_id,
                    p.name,
                    h.buy_price,
                    h.buy_amount,
                    pp.price as current_price
                FROM holdings h
                JOIN product p ON h.product_id = p.id
                JOIN product_price pp ON p.id = pp.id
                ORDER BY h.holding_id
            `);
            return holdings;
        } catch (error) {
            throw new Error(`Error fetching performance data: ${error.message}`);
        }
    },
};

module.exports = Performance;