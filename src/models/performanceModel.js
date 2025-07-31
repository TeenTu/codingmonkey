const db = require('../config/db');

const Performance = {
    // Get performance data for all holdings
    getPerformance: async (userId = null) => {
        try {
            let query = `
                SELECT 
                    h.id,
                    h.user_id,
                    h.product_id,
                    p.name,
                    pt.type as product_type,
                    h.buy_price,
                    h.buy_amount,
                    pp.price as current_price,
                    u.name as user_name
                FROM holdings h
                JOIN product p ON h.product_id = p.id
                LEFT JOIN product_type pt ON p.id = pt.id
                JOIN product_price pp ON p.id = pp.id
                JOIN users u ON h.user_id = u.id
            `;
            let params = [];

            if (userId) {
                query += ` WHERE h.user_id = ?`;
                params.push(userId);
            } 

            query += ` ORDER BY h.id`;
            const [holdings] = await db.query(query, params);
            return holdings;
        } catch (error) {
            throw new Error(`Error fetching performance data: ${error.message}`);
        }
    },
};

module.exports = Performance;