const db = require('../config/db');

const getPortfolioModel = {
    // Get full portfolio for a specific user
    getPortfolioByUserId: async (userId) => {
        const [rows] = await db.query(`
            SELECT 
                h.id AS holding_id,
                u.name AS username,
                p.id AS product_id,
                p.name AS product_name,
                p.code AS product_code,
                pt.type AS product_type,
                pq.amount AS available_amount,   -- 库存
                h.buy_price,
                h.buy_amount,
                pp.price AS current_price
            FROM holdings h
            JOIN users u ON h.user_id = u.id
            JOIN product p ON h.product_id = p.id
            LEFT JOIN product_type pt ON p.id = pt.id
            LEFT JOIN product_price pp ON p.id = pp.id
            LEFT JOIN product_quantity pq ON p.id = pq.id
            WHERE u.id = ?
            ORDER BY h.id ASC
        `, [userId]);

        return rows;
    }
};

module.exports = getPortfolioModel;