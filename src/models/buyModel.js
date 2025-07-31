const db = require('../config/db');

// const gameModel = require('../models/gameModel');

const buyModel = {
    // 检查产品剩余数量
    checkProductQuantity: async (productId) => {
        const [rows] = await db.query(`
            SELECT amount FROM product_quantity WHERE id = ?
        `, [productId]);
        
        if (rows.length === 0) {
            throw new Error('该产品不存在或未设置库存');
        }
        
        return rows[0].amount;
    },
    
    // 检查用户是否存在
    checkUserExists: async (userId) => {
        const [rows] = await db.query(`
            SELECT id FROM users WHERE id = ?
        `, [userId]);
        
        return rows.length > 0;
    },
    
    // 检查用户余额
    checkUserBalance: async (userId) => {
        const[rows] = await db.query(`
            SELECT balance FROM user_game_status WHERE user_id = ?
        `, [userId]);
        return rows[0].balance;;
    },
    
    // 获取产品当前价格
    getProductPrice: async (productId) => {
        const [rows] = await db.query(`
            SELECT price FROM product_price WHERE id = ?
        `, [productId]);
        
        if (rows.length === 0) {
            throw new Error('该产品不存在或未设置价格');
        }
        
        return rows[0].price;
    },
    
    // 检查用户是否已持有该产品
    checkExistingHolding: async (productId, userId) => {
    const [rows] = await db.query ( `
        SELECT id, buy_price, buy_amount FROM holdings WHERE product_id = ? AND user_id = ?
        ` , [productId, userId]);
    
    return rows [0] || null; 
    
    // 存在则返回持仓记录，否则返回 null
    },
    


    // 买入产品（包含事务处理）
    buyProduct: async (productId, userId, buyAmount, buyPrice) => {
        const connection = await db.getConnection();
        
        try {
            // 开始事务
            await connection.beginTransaction();
            
            // 1. 再次检查产品库存（防止并发问题）
            const [quantityRows] = await connection.query(`
                SELECT amount FROM product_quantity WHERE id = ? FOR UPDATE
            `, [productId]);
            
            if (quantityRows.length === 0) {
                throw new Error('该产品不存在或未设置库存');
            }
            
            const currentQuantity = quantityRows[0].amount;
            
            // 检查库存是否充足
            if (currentQuantity < buyAmount) {
                throw new Error(`库存不足，当前库存: ${currentQuantity}，请求购买: ${buyAmount}`);
            }

           // 检查余额是否充足
            const [balanceRows] = await connection.query(`
                SELECT balance FROM user_game_status WHERE user_id = ? FOR UPDATE
            `, [userId]);
            
            
            if (balanceRows.length === 0) {
             throw new Error('该用户不存在或未设置余额');
            }
            const currentBalance = balanceRows[0].balance;
            const totalPurchaseAmount = buyAmount * buyPrice;
            console.log(currentBalance, totalPurchaseAmount);
            

            if(currentBalance < totalPurchaseAmount){
                let errorMessage = `余额不足，当前余额: ${currentBalance}，请求购买总金额: ${totalPurchaseAmount}`;
                throw new Error(errorMessage);   
            }
           
            // 每次买入都创建新记录，不合并相同价格的持仓
            const [insertResult] = await connection.query ( `
                INSERT INTO holdings (user_id, product_id, buy_price, buy_amount) VALUES (?, ?, ?, ?) 
                `, [userId, productId, buyPrice, buyAmount]);
            const holdingId = insertResult.insertId;
                
            
            // 3. 减少产品库存
            const newQuantity = currentQuantity - buyAmount;
            
            await connection.query (`
                UPDATE product_quantity SET amount = ? WHERE id = ? 
                `, [newQuantity, productId]);

            //4. 减少余额
            const newBalance = currentBalance - totalPurchaseAmount;
            await connection.query (`
                UPDATE  user_game_status SET balance =  ? WHERE user_id = ? 
                `, [newBalance, userId]);

            await connection.commit ();
            return {
            holdingId,
            productId,
            userId,
            buyPrice,
            buyAmount,
            remainingQuantity: currentQuantity - buyAmount,
            isNewHolding: true // 每次买入都是新记录
            };
            

            } catch (error) {
            await connection.rollback();
            throw error;
            } finally {
            connection.release();
            }
            },

    
    // 获取产品名称
    getProductName: async (productId) => {
        const [rows] = await db.query(`
            SELECT name FROM product WHERE id = ?
        `, [productId]);
        
        return rows.length > 0 ? rows[0].name : '未知产品';
    },
    
    //获取持仓数
    getTotalHoldingAmount: async (productId, userId) => {
        const [rows] = await db.query(`
            SELECT SUM(buy_amount) AS total_amount FROM holdings WHERE product_id = ? AND user_id = ?
        `, [productId, userId]);
        
        return rows[0].total_amount || 0; // 如果没有持仓，返回0
    },  

    // 获取用户名
    getUserName: async (userId) => {
        const [rows] = await db.query(`
            SELECT name FROM users WHERE id = ?
        `, [userId]);
        
        return rows.length > 0 ? rows[0].name : '未知用户';
    }
};

module.exports = buyModel;
