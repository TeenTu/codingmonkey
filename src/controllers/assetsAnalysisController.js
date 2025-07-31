const gameController = require('./gameController');
const performanceController = require('./performanceController');
const runtimeStorage = require('../history/runtimeStorage');

const assetsAnalysisController = {
    /**
     * 获取用户总资产数据
     */
    getTotalAssets: async (req, res) => {
        try {
            const userId = req.query.user_id || 1;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            // 获取余额数据
            const balanceData = await gameController._getUserBalance(userId);
            const balance = Number(balanceData.balance) || 0;

            // 获取投资组合表现数据
            let portfolioValue = 0;
            try {
                // 模拟 performanceController.getPerformance 的调用
                const performanceModel = require('../models/performanceModel');
                const performance = await performanceModel.getPerformance(userId);
                
                if (performance && performance.length > 0) {
                    portfolioValue = performance.reduce((total, holding) => {
                        const currentValue = Number(holding.current_price) * Number(holding.buy_amount);
                        return total + currentValue;
                    }, 0);
                }
            } catch (error) {
                console.log('No portfolio found for user:', userId);
                portfolioValue = 0;
            }

            const totalAssets = Number(balance) + Number(portfolioValue);

            // 获取当前游戏天数
            let currentDay = 1;
            try {
                const gameStatus = await gameController._getUserBalance(userId);
                // 这里需要获取完整的游戏状态来得到天数信息
                const gameModel = require('../models/gameModel');
                const fullGameStatus = await gameModel.getGameStatus(userId);
                if (fullGameStatus) {
                    currentDay = fullGameStatus.max_day - fullGameStatus.remain_days + 1;
                }
            } catch (error) {
                console.log('Failed to get current day, using default:', error.message);
            }

            // 记录到运行时存储
            runtimeStorage.recordTotalAssets(userId, totalAssets, balance, portfolioValue, currentDay);

            res.json({
                success: true,
                data: {
                    userId: Number(userId),
                    totalAssets: Number(totalAssets.toFixed(2)),
                    balance: Number(balance.toFixed(2)),
                    portfolioValue: Number(portfolioValue.toFixed(2)),
                    currentDay,
                    timestamp: Date.now(),
                    date: new Date().toISOString().split('T')[0]
                }
            });
        } catch (error) {
            console.error('Get total assets error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get total assets',
                error: error.message
            });
        }
    },

    /**
     * 获取总资产历史记录
     */
    getTotalAssetsHistory: async (req, res) => {
        try {
            const userId = req.query.user_id || 1;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            // 获取原始历史数据
            const rawHistory = runtimeStorage.getTotalAssetsHistory(userId);
            
            // 获取当前游戏状态来确定天数范围
            let currentDay = 1;
            let maxDay = 30;
            try {
                const gameModel = require('../models/gameModel');
                const gameStatus = await gameModel.getGameStatus(userId);
                if (gameStatus) {
                    currentDay = gameStatus.max_day - gameStatus.remain_days + 1;
                    maxDay = gameStatus.max_day;
                }
            } catch (error) {
                console.log('Failed to get game status for history:', error.message);
            }

            // 创建完整的历史数据，从第1天到当前天
            const completeHistory = [];
            let lastKnownData = {
                totalAssets: 500000, // 默认初始资产
                balance: 500000,
                portfolioValue: 0
            };

            for (let day = 1; day <= currentDay; day++) {
                // 查找该天是否有实际记录
                const actualRecord = rawHistory.find(record => record.day === day);
                
                if (actualRecord) {
                    // 有实际记录，使用实际数据
                    lastKnownData = {
                        totalAssets: actualRecord.totalAssets,
                        balance: actualRecord.balance,
                        portfolioValue: actualRecord.portfolioValue
                    };
                    completeHistory.push({
                        date: actualRecord.date,
                        timestamp: actualRecord.timestamp,
                        totalAssets: actualRecord.totalAssets,
                        balance: actualRecord.balance,
                        portfolioValue: actualRecord.portfolioValue,
                        day: day
                    });
                } else {
                    // 没有实际记录，使用上一天的数据
                    const estimatedDate = new Date();
                    estimatedDate.setDate(estimatedDate.getDate() - (currentDay - day));
                    
                    completeHistory.push({
                        date: estimatedDate.toISOString().split('T')[0],
                        timestamp: Date.now(),
                        totalAssets: lastKnownData.totalAssets,
                        balance: lastKnownData.balance,
                        portfolioValue: lastKnownData.portfolioValue,
                        day: day,
                        estimated: true // 标记为估算数据
                    });
                }
            }

            res.json({
                success: true,
                data: {
                    userId: Number(userId),
                    history: completeHistory,
                    count: completeHistory.length,
                    currentDay,
                    maxDay
                }
            });
        } catch (error) {
            console.error('Get total assets history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get total assets history',
                error: error.message
            });
        }
    },

    /**
     * 获取产品贡献分析
     */
    getProductContributions: async (req, res) => {
        try {
            const userId = req.query.user_id || 1;
            const realizedSort = req.query.realized_sort || 'profit'; // profit, profitPercentage, name
            const realizedOrder = req.query.realized_order || 'desc'; // asc, desc
            const unrealizedSort = req.query.unrealized_sort || 'profit';
            const unrealizedOrder = req.query.unrealized_order || 'desc';
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            // 更新未实现盈亏数据
            try {
                const performanceModel = require('../models/performanceModel');
                const currentHoldings = await performanceModel.getPerformance(userId);
                
                if (currentHoldings && currentHoldings.length > 0) {
                    const formattedHoldings = currentHoldings.map(holding => ({
                        product_id: holding.product_id,
                        product_name: holding.name,
                        current_value: holding.current_price * holding.buy_amount,
                        cost: holding.buy_price * holding.buy_amount,
                        quantity: holding.buy_amount,
                        current_price: holding.current_price,
                        buy_price: holding.buy_price
                    }));
                    
                    runtimeStorage.updateUnrealizedProfits(userId, formattedHoldings);
                }
            } catch (error) {
                console.log('No current holdings found for user:', userId);
            }

            // 获取已实现和未实现盈亏
            const realizedProfits = runtimeStorage.getRealizedProfits(userId, realizedSort, realizedOrder);
            const unrealizedProfits = runtimeStorage.getUnrealizedProfits(userId, unrealizedSort, unrealizedOrder);
            const summary = runtimeStorage.getUserSummary(userId);

            res.json({
                success: true,
                data: {
                    userId: Number(userId),
                    summary,
                    realizedProfits,
                    unrealizedProfits,
                    sortOptions: {
                        realized: { sort: realizedSort, order: realizedOrder },
                        unrealized: { sort: unrealizedSort, order: unrealizedOrder }
                    }
                }
            });
        } catch (error) {
            console.error('Get product contributions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get product contributions',
                error: error.message
            });
        }
    },

    /**
     * 记录交易实现盈亏（供其他控制器调用）
     */
    recordTradeProfit: (userId, productId, productName, profit, profitPercentage, sellPrice, sellAmount, originalCost) => {
        try {
            runtimeStorage.recordRealizedProfit(
                userId, 
                productId, 
                productName, 
                profit, 
                profitPercentage, 
                sellPrice, 
                sellAmount, 
                originalCost
            );
            return true;
        } catch (error) {
            console.error('Record trade profit error:', error);
            return false;
        }
    },

    /**
     * 清除用户分析数据（用于重置游戏）
     */
    clearUserAnalysisData: async (req, res) => {
        try {
            const userId = req.query.user_id || 1;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            runtimeStorage.clearUserData(userId);

            res.json({
                success: true,
                message: 'User analysis data cleared successfully'
            });
        } catch (error) {
            console.error('Clear user analysis data error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear user analysis data',
                error: error.message
            });
        }
    },

    /**
     * 内部函数：记录实现盈亏（供其他模块调用）
     */
    _recordTradeProfit: (userId, productId, productName, profit, profitPercentage, sellPrice, sellAmount, originalCost) => {
        return assetsAnalysisController.recordTradeProfit(
            userId, productId, productName, profit, profitPercentage, sellPrice, sellAmount, originalCost
        );
    },

    /**
     * 内部函数：更新总资产记录（供其他模块调用）
     */
    _updateTotalAssets: async (userId) => {
        try {
            // 获取余额数据
            const balanceData = await gameController._getUserBalance(userId);
            const balance = Number(balanceData.balance) || 0;

            // 获取投资组合表现数据
            let portfolioValue = 0;
            try {
                const performanceModel = require('../models/performanceModel');
                const performance = await performanceModel.getPerformance(userId);
                
                if (performance && performance.length > 0) {
                    portfolioValue = performance.reduce((total, holding) => {
                        const currentValue = Number(holding.current_price) * Number(holding.buy_amount);
                        return total + currentValue;
                    }, 0);
                }
            } catch (error) {
                portfolioValue = 0;
            }

            const totalAssets = Number(balance) + Number(portfolioValue);

            // 获取当前游戏天数
            let currentDay = 1;
            try {
                const gameModel = require('../models/gameModel');
                const fullGameStatus = await gameModel.getGameStatus(userId);
                if (fullGameStatus) {
                    currentDay = fullGameStatus.max_day - fullGameStatus.remain_days + 1;
                }
            } catch (error) {
                console.log('Failed to get current day, using default:', error.message);
            }

            // 记录到运行时存储
            runtimeStorage.recordTotalAssets(userId, totalAssets, balance, portfolioValue, currentDay);

            return {
                totalAssets: Number(totalAssets.toFixed(2)),
                balance: Number(balance.toFixed(2)),
                portfolioValue: Number(portfolioValue.toFixed(2)),
                currentDay
            };
        } catch (error) {
            console.error('Update total assets error:', error);
            throw error;
        }
    }
};

module.exports = assetsAnalysisController;
