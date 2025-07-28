const db = require('../config/db');

const Exchange = {
    // Get product details with current price and quantity
    getProduct: async (productId) => {
        try {
            const [product] = await db.query(`
                SELECT p.id, p.name, pt.type, pp.price, pq.amount
                FROM product p
                JOIN product_type pt ON p.id = pt.id
                JOIN product_price pp ON p.id = pp.id
                JOIN product_quantity pq ON p.id = pq.id
                WHERE p.id = ?
            `, [productId]);
            return product[0];
        } catch (error) {
            throw new Error(`Error fetching product: ${error.message}`);
        }
    },

    // Get user's holdings
    getHoldings: async (productId = null) => {
        try {
            let query = `
                SELECT h.holding_id, h.product_id, p.name, h.buy_price, h.buy_amount, pp.price as current_price
                FROM holdings h
                JOIN product p ON h.product_id = p.id
                JOIN product_price pp ON p.id = pp.id
            `;
            const params = [];

            if (productId) {
                query += ' WHERE h.product_id = ?';
                params.push(productId);
            }

            const [holdings] = await db.query(query, params);
            return holdings;
        } catch (error) {
            throw new Error(`Error fetching holdings: ${error.message}`);
        }
    },

    // Create new holding (buy product)
    createHolding: async (productId, buyPrice, buyAmount) => {
        try {
            // Check available quantity
            const [quantity] = await db.query(
                'SELECT amount FROM product_quantity WHERE id = ?',
                [productId]
            );

            if (!quantity[0] || quantity[0].amount < buyAmount) {
                throw new Error('Insufficient quantity available');
            }

            // Start transaction
            await db.query('START TRANSACTION');

            // Create holding
            const [result] = await db.query(
                'INSERT INTO holdings (product_id, buy_price, buy_amount) VALUES (?, ?, ?)',
                [productId, buyPrice, buyAmount]
            );

            // Update product quantity
            await db.query(
                'UPDATE product_quantity SET amount = amount - ? WHERE id = ?',
                [buyAmount, productId]
            );

            await db.query('COMMIT');
            return result.insertId;
        } catch (error) {
            await db.query('ROLLBACK');
            throw new Error(`Error creating holding: ${error.message}`);
        }
    },

    // Sell holding
    sellHolding: async (holdingId, sellAmount) => {
        try {
            const [holding] = await db.query(
                'SELECT * FROM holdings WHERE holding_id = ?',
                [holdingId]
            );

            if (!holding[0] || holding[0].buy_amount < sellAmount) {
                throw new Error('Invalid holding or insufficient amount');
            }

            await db.query('START TRANSACTION');

            // Update holding amount
            if (holding[0].buy_amount === sellAmount) {
                await db.query(
                    'DELETE FROM holdings WHERE holding_id = ?',
                    [holdingId]
                );
            } else {
                await db.query(
                    'UPDATE holdings SET buy_amount = buy_amount - ? WHERE holding_id = ?',
                    [sellAmount, holdingId]
                );
            }

            // Update product quantity
            await db.query(
                'UPDATE product_quantity SET amount = amount + ? WHERE id = ?',
                [sellAmount, holding[0].product_id]
            );

            await db.query('COMMIT');
            return true;
        } catch (error) {
            await db.query('ROLLBACK');
            throw new Error(`Error selling holding: ${error.message}`);
        }
    }
};

module.exports = Exchange;