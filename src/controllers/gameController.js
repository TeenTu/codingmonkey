const gameModel = require('../models/gameModel');
const priceUpdateController = require('./priceUpdateController');
const assetsAnalysisController = require('./assetsAnalysisController');
// const result = await priceUpdateController._updatePrices();
const gameController = {
    // Initialize game for a user
    initializeGame: async (req, res) => {
        try {
            const { userId, initialBalance = 500000.00, gameRemainDays = 30 } = req.body;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            const result = await gameModel.initializeUserGame(userId, initialBalance, gameRemainDays);
            
            // 初始化第一天的总资产记录
            try {
                await assetsAnalysisController._updateTotalAssets(userId);
            } catch (analysisError) {
                console.error('Assets analysis initialization error:', analysisError);
            }
            
            res.json({
                success: true,
                message: 'Game initialized successfully',
                data: result
            });
        } catch (error) {
            console.error('Game initialization error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to initialize game',
                error: error.message
            });
        }
    },

    // Advance day for a user
    advanceDay: async (req, res) => {
        try {
            // get userId from param, if not param use default user
            const userId = req.query.user_id || 1;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }
            const updatePricesResult = await priceUpdateController._updatePrices();
            const result = await gameModel.advanceDay(userId);
            
            // 更新总资产记录
            try {
                await assetsAnalysisController._updateTotalAssets(userId);
            } catch (analysisError) {
                console.error('Assets analysis update error after advance day:', analysisError);
                // 不影响推进天数操作的成功
            }
            
            res.json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            console.error('Advance day error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to advance day',
                error: error.message
            });
        }
    },

    // Get game status for a user
    getGameStatus: async (req, res) => {
        try {
            // get userId from param, if not param use default user
            const userId = req.query.user_id || 1;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            const gameStatus = await gameModel.getGameStatus(userId);
            
            if (!gameStatus) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Game status not found for this user' 
                });
            }

            res.json({
                success: true,
                data: gameStatus
            });
        } catch (error) {
            console.error('Get game status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve game status',
                error: error.message
            });
        }
    },

    getUserBalance: async (req, res) => {
        try {
            // get userId from param, if not param use default user
            const userId = req.query.user_id || 1;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            const balance = await gameModel.getUserBalance(userId);
            
            if (balance === null) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found or no balance available' 
                });
            }

            res.json({
                success: true,
                ...balance
            });
        } catch (error) {
            console.error('Get user balance error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user balance',
                error: error.message
            });
        }
    },
    updateUserBalance: async (req, res) => {
        try {
            // get userId from param, if not param use default user
            const userId = req.query.user_id || 1;
            const { amount } = req.body;

            if (!userId || amount === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID and amount are required' 
                });
            }

            const result = await gameModel.updateUserBalance(userId, amount);
            
            res.json({
                success: true,
                message: 'Balance updated successfully',
                ...result
            });
        } catch (error) {
            console.error('Update user balance error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user balance',
                error: error.message
            });
        }
    },
    // Internal function for getting user balance (for use by other modules)
    _getUserBalance: async (userId) => {
        try {
            // Data validation
            if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
                throw new Error('Invalid user ID: must be a positive integer');
            }

            const balance = await gameModel.getUserBalance(userId);
            
            if (balance === null) {
                throw new Error('User not found or no balance available');
            }

            return balance;
        } catch (error) {
            throw new Error(`Failed to get user balance: ${error.message}`);
        }
    },

    // Internal function for updating user balance (for use by other modules)
    _updateUserBalance: async (userId, amount) => {
        try {
            // Data validation
            if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
                throw new Error('Invalid user ID: must be a positive integer');
            }

            if (amount === undefined || amount === null || isNaN(Number(amount))) {
                throw new Error('Invalid amount: must be a valid number');
            }

            const result = await gameModel.updateUserBalance(userId, amount);
            
            return result;
        } catch (error) {
            throw new Error(`Failed to update user balance: ${error.message}`);
        }
    },

    // Restart game for a user
    restartGame: async (req, res) => {
        try {
            // get userId from param, if not param use default user
            const userId = req.query.user_id || 1;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User ID is required' 
                });
            }

            const result = await gameModel.restartGame(userId);
            
            // 清除用户分析数据
            try {
                const runtimeStorage = require('../history/runtimeStorage');
                runtimeStorage.clearUserData(userId);
            } catch (analysisError) {
                console.error('Clear analysis data error after restart game:', analysisError);
                // 不影响重置游戏操作的成功
            }
            
            res.json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            console.error('Restart game error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to restart game',
                error: error.message
            });
        }
    },
};

module.exports = gameController;

// 导出内部函数供其他模块使用Example usage:
// const gameController = require('./gameController');
// const result = await gameController._getUserBalance(1);
// 需要验证result字段success是否为true
// const result = await gameController._updateUserBalance(1, 1000);
// 需要验证result字段success是否为true

