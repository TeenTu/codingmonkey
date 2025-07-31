
const db = require('../config/db');

const priceCache = require('../tools/priceCache');

// 注释掉固定的变量，改为从数据库读取
// let currentDay = 0;
// const MAX_DAYS = 30;


const Price = {

    // 从数据库获取游戏状态
    getGameStatusFromDB: async (userId = 1) => {
        try {
            const [gameStatus] = await db.query(
                'SELECT max_day, remain_days, is_game_over FROM user_game_status WHERE user_id = ?',
                [userId]
            );
            
            if (gameStatus.length === 0) {
                throw new Error('User game status not found');
            }
            
            const status = gameStatus[0];
            const MAX_DAYS = status.max_day;
            const currentDay = MAX_DAYS - status.remain_days + 1;
            
            return {
                MAX_DAYS,
                currentDay,
                remainDays: status.remain_days,
                isGameOver: status.is_game_over
            };
        } catch (error) {
            throw new Error(`Error getting game status: ${error.message}`);
        }
    },

    // 更新用户游戏状态中的剩余天数
    updateUserGameStatus: async (userId = 1) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // 获取当前状态
            const [gameStatus] = await connection.execute(
                'SELECT remain_days, is_game_over FROM user_game_status WHERE user_id = ?',
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
                remainDays: newRemainDays,
                isGameOver,
                message: isGameOver ? 'Game finished!' : 'Day advanced successfully'
            };
            
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error updating user game status: ${error.message}`);
        } finally {
            connection.release();
        }
    },

    // 修改getCurrentDay方法，从数据库读取
    getCurrentDay: async (userId = 1) => {
        const gameStatus = await Price.getGameStatusFromDB(userId);
        return gameStatus.currentDay;
    },

    updateAllPrices: async (userId = 1) => {
        try {
            // 从数据库获取游戏状态（仅读取，不更新）
            const gameStatus = await Price.getGameStatusFromDB(userId);
            const { MAX_DAYS, currentDay, remainDays, isGameOver } = gameStatus;
            
            // 检查游戏是否已结束
            if (isGameOver) {
                return {
                    success: false,
                    message: '游戏已结束，无法继续更新价格'
                };
            }
            
            // 检查是否还有剩余天数
            if (remainDays <= 0) {
                return {
                    success: false,
                    message: '没有剩余天数，无法继续更新价格'
                };
            }
            
            if (currentDay > MAX_DAYS) {
                return {
                    success: false,
                    message: `已经更新了${MAX_DAYS}天的数据，无法继续更新`
                };
            }

            // 获取所有产品（id, code, type）
            const [products] = await db.query(`
                SELECT p.id, p.code, pt.type, p.name
                FROM product p
                JOIN product_type pt ON p.id = pt.id
            `);


            // 用 priceCache 里的数据
            // 收集所有日期
            const allDatesSet = new Set();
            for (const stock of priceCache.stocks) {
                for (const p of stock.prices) allDatesSet.add(p.date);
            }
            for (const fund of priceCache.funds) {
                for (const p of fund.prices) allDatesSet.add(p.date);
            }
            const allDates = Array.from(allDatesSet).sort();

            if (currentDay > allDates.length) {
                return {
                    success: false,
                    message: `CSV文件日期不足，已无可更新天数`
                };
            }
            const targetDate = allDates[currentDay - 1]; // currentDay从1开始，数组从0开始

            // 读取 cash 上次价格
            let cashLastPrice = null;
            for (const prod of products) {
                if (prod.type === 'Cash') {
                    const [rows] = await db.query('SELECT price FROM product_price WHERE id = ?', [prod.id]);
                    if (rows.length > 0) cashLastPrice = parseFloat(rows[0].price);
                }
            }

            // 逐个产品更新
            for (const prod of products) {
                if (prod.type === 'Stock') {
                    // 直接用code和symbol一一对应
                    const stock = priceCache.stocks.find(s => s.symbol === prod.code);
                    if (stock) {
                        const priceObj = stock.prices.find(p => p.date === targetDate);
                        if (priceObj && priceObj.close) {
                            const price = parseFloat(priceObj.close);
                            if (!isNaN(price)) {
                                await db.query('UPDATE product_price SET price = ? WHERE id = ?', [price, prod.id]);
                            }
                        }
                    }
                } else if (prod.type === 'Fund') {
                    const fund = priceCache.funds.find(f => f.symbol === prod.code);
                    if (fund) {
                        const priceObj = fund.prices.find(p => p.date === targetDate);
                        if (priceObj && priceObj.close) {
                            const price = parseFloat(priceObj.close);
                            if (!isNaN(price)) {
                                await db.query('UPDATE product_price SET price = ? WHERE id = ?', [price, prod.id]);
                            }
                        }
                    }
                } else if (prod.type === 'Cash') {
                    // cash 价格递增
                    if (cashLastPrice !== null) {
                        const newPrice = parseFloat((cashLastPrice * (1 + 0.001)).toFixed(6));
                        await db.query('UPDATE product_price SET price = ? WHERE id = ?', [newPrice, prod.id]);
                        cashLastPrice = newPrice;
                    }
                }
            }

            // 不更新用户游戏状态，只更新价格
            // 注释掉：const updateResult = await Price.updateUserGameStatus(userId);

            return {
                success: true,
                message: `成功更新第 ${currentDay} 天（${targetDate}）的价格数据`,
                currentDay: currentDay,
                remainingDays: remainDays, // 返回当前的剩余天数，不做修改
                isGameOver: isGameOver,    // 返回当前的游戏状态，不做修改
                date: targetDate
            };
        } catch (error) {
            throw new Error(`Error updating all prices: ${error.message}`);
        }
    },


    // 获取当前更新状态 - 从数据库读取
    getUpdateStatus: async (userId = 1) => {
        try {
            const gameStatus = await Price.getGameStatusFromDB(userId);
            return {
                currentDay: gameStatus.currentDay,
                maxDays: gameStatus.MAX_DAYS,
                remainingDays: gameStatus.remainDays,
                canUpdate: gameStatus.remainDays > 0 && !gameStatus.isGameOver,
                isGameOver: gameStatus.isGameOver
            };
        } catch (error) {
            // 如果获取失败，返回默认值
            return {
                currentDay: 0,
                maxDays: 0,
                remainingDays: 0,
                canUpdate: false,
                isGameOver: true,
                error: error.message
            };
        }
    },

    // 重置天数现在不需要了，因为通过游戏重置来处理
    resetDays: () => {
        return {
            success: true,
            message: '天数重置请使用游戏重置功能'
        };
    }
};

module.exports = Price;

