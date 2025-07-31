const db = require('../config/db');

const gameModel = {
    // Initialize user game with balance and remaining days
    initializeUserGame: async (userId, initialBalance, gameRemainDays) => {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 检查用户是否存在
            const [userCheck] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );
            
            if (userCheck.length === 0) {
                throw new Error('User does not exist');
            }
            
            // 初始化或更新用户游戏状态
            await connection.execute(`
                INSERT INTO user_game_status (user_id, balance, remain_days, max_day, is_game_over) 
                VALUES (?, ?, ?, ?, FALSE) 
                ON DUPLICATE KEY UPDATE 
                balance = VALUES(balance),
                remain_days = VALUES(remain_days),
                max_day = VALUES(max_day),
                is_game_over = FALSE,
                updated_at = CURRENT_TIMESTAMP
            `, [userId, initialBalance, gameRemainDays, gameRemainDays]);
            
            await connection.commit();
            
            return {
                userId,
                initialBalance,
                gameRemainDays,
                maxDay: gameRemainDays,
                message: 'Game initialization completed'
            };
            
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error initializing game: ${error.message}`);
        } finally {
            connection.release();
        }
    },

    // Advance day by reducing remaining days
    advanceDay: async (userId) => {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 检查用户游戏状态
            const [gameStatus] = await connection.execute(
                'SELECT balance, remain_days, max_day, is_game_over FROM user_game_status WHERE user_id = ?',
                [userId]
            );
            
            if (gameStatus.length === 0) {
                throw new Error('User game status not found');
            }
            
            const currentStatus = gameStatus[0];
            
            if (currentStatus.is_game_over) {
                throw new Error('Game is already over');
            }
            
            if (currentStatus.remain_days <= 0) {
                throw new Error('No remaining days');
            }
            
            // 减少剩余天数
            const newRemainDays = currentStatus.remain_days - 1;
            const isGameOver = newRemainDays <= 0;
            
            await connection.execute(`
                UPDATE user_game_status 
                SET remain_days = ?, is_game_over = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `, [newRemainDays, isGameOver, userId]);
            
            await connection.commit();
            
            return {
                userId,
                remainDays: newRemainDays,
                isGameOver,
                message: isGameOver ? 'Game finished!' : 'Advanced to next day'
            };
            
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error advancing day: ${error.message}`);
        } finally {
            connection.release();
        }
    },

    // Get user game status
    getGameStatus: async (userId) => {
        try {
            const query = `
                SELECT 
                    ugs.user_id,
                    ugs.balance,
                    ugs.remain_days,
                    ugs.max_day,
                    ugs.is_game_over,
                    ugs.created_at,
                    ugs.updated_at,
                    u.name as user_name
                FROM user_game_status ugs
                JOIN users u ON ugs.user_id = u.id
                WHERE ugs.user_id = ?
            `;
            
            const [gameStatus] = await db.query(query, [userId]);
            return gameStatus[0] || null;
        } catch (error) {
            throw new Error(`Error fetching game status: ${error.message}`);
        }
    },

    // Get user balance
    getUserBalance: async (userId) => {
        try {
            // 数据校验：用户ID必须是正整数
            if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
                throw new Error('Invalid user ID: must be a positive integer');
            }

            const query = `
                SELECT 
                    ugs.user_id,
                    ugs.balance,
                    u.name as user_name
                FROM user_game_status ugs
                JOIN users u ON ugs.user_id = u.id
                WHERE ugs.user_id = ?
            `;
            
            const [result] = await db.query(query, [userId]);
            
            if (result.length === 0) {
                throw new Error('User game status not found');
            }
            
            return {
                userId: result[0].user_id,
                balance: result[0].balance,
                userName: result[0].user_name
            };
        } catch (error) {
            throw new Error(`Error fetching user balance: ${error.message}`);
        }
    },

    // Update user balance by a change amount (can be positive or negative)
    updateUserBalance: async (userId, balanceChange) => {
        const connection = await db.getConnection();
        
        try {
            // 数据校验：用户ID必须是正整数
            if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
                throw new Error('Invalid user ID: must be a positive integer');
            }

            // 数据校验：余额变更量必须是有效数字
            if (balanceChange === null || balanceChange === undefined || isNaN(Number(balanceChange))) {
                throw new Error('Invalid balance change: must be a valid number');
            }

            const changeAmount = Number(balanceChange);

            // 数据校验：余额变更量精度检查（最多2位小数）
            if (Number(changeAmount.toFixed(2)) !== changeAmount) {
                throw new Error('Invalid balance change: maximum 2 decimal places allowed');
            }

            await connection.beginTransaction();
            
            // 获取当前用户游戏状态
            const [gameStatus] = await connection.execute(
                'SELECT user_id, balance, is_game_over FROM user_game_status WHERE user_id = ?',
                [userId]
            );
            
            if (gameStatus.length === 0) {
                throw new Error('User game status not found');
            }

            const currentStatus = gameStatus[0];

            // 检查游戏是否已结束
            if (currentStatus.is_game_over) {
                throw new Error('Cannot update balance: game is already over');
            }

            // 计算新余额
            const oldBalance = Number(currentStatus.balance);
            const newBalance = oldBalance + changeAmount;

            // 验证新余额不能为负数
            if (newBalance < 0) {
                throw new Error(`Insufficient balance: current balance ${oldBalance}, attempted change ${changeAmount}, would result in negative balance`);
            }
            
            // 更新余额
            await connection.execute(`
                UPDATE user_game_status 
                SET balance = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `, [newBalance, userId]);
            
            await connection.commit();
            
            return {
                userId,
                oldBalance,
                balanceChange: changeAmount,
                newBalance,
                message: `Balance ${changeAmount >= 0 ? 'increased' : 'decreased'} successfully`
            };
            
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error updating balance: ${error.message}`);
        } finally {
            connection.release();
        }
    },

    // Restart game by resetting all data
    restartGame: async (userId) => {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 检查用户是否存在
            const [userCheck] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );
            
            if (userCheck.length === 0) {
                throw new Error('User does not exist');
            }
            
            // 删除用户持仓
            await connection.execute(
                'DELETE FROM holdings WHERE user_id = ?',
                [userId]
            );
            
            // 删除用户游戏状态
            await connection.execute(
                'DELETE FROM user_game_status WHERE user_id = ?',
                [userId]
            );
            
            // 重置所有产品库存到初始状态
            // 动态获取股票产品并重置为 1000
            await connection.execute(`
                UPDATE product_quantity pq
                JOIN product_type pt ON pq.id = pt.id
                SET pq.amount = 1000 
                WHERE pt.type = 'Stock'
            `);
            
            // 动态获取基金产品并重置为 2000
            await connection.execute(`
                UPDATE product_quantity pq
                JOIN product_type pt ON pq.id = pt.id
                SET pq.amount = 2000 
                WHERE pt.type = 'Fund'
            `);
            
            await connection.commit();
            
            return {
                userId,
                message: 'Game restart completed successfully. All holdings cleared and product quantities reset.'
            };
            
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error restarting game: ${error.message}`);
        } finally {
            connection.release();
        }
    },
};

module.exports = gameModel;


