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
                INSERT INTO user_game_status (user_id, balance, remain_days, is_game_over) 
                VALUES (?, ?, ?, FALSE) 
                ON DUPLICATE KEY UPDATE 
                balance = VALUES(balance),
                remain_days = VALUES(remain_days),
                is_game_over = FALSE,
                updated_at = CURRENT_TIMESTAMP
            `, [userId, initialBalance, gameRemainDays]);
            
            await connection.commit();
            
            return {
                userId,
                initialBalance,
                gameRemainDays,
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
                'SELECT balance, remain_days, is_game_over FROM user_game_status WHERE user_id = ?',
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
    }
};

module.exports = gameModel;


