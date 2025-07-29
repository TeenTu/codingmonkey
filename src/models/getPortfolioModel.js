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
                h.buy_price,
                h.buy_amount,
                pp.price AS current_price,
                (h.buy_amount * h.buy_price) AS total_buy_value,
                (h.buy_amount * pp.price) AS total_current_value,
                ((pp.price - h.buy_price) * h.buy_amount) AS profit_loss,
                CASE
                    WHEN h.buy_price > 0 
                        THEN ((pp.price - h.buy_price) / h.buy_price) * 100
                    ELSE 0
                END AS profit_loss_percentage
            FROM holdings h
            JOIN users u ON h.user_id = u.id
            JOIN product p ON h.product_id = p.id
            JOIN product_type pt ON p.id = pt.id
            JOIN product_price pp ON p.id = pp.id
            WHERE u.id = ?
            ORDER BY h.id ASC
        `, [userId]);

        return rows;
    }
};

module.exports = getPortfolioModel;
