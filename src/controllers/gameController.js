const gameModel = require('../models/gameModel');

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

            const result = await gameModel.advanceDay(userId);
            
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
                userId,
                balance
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
                data: result
            });
        } catch (error) {
            console.error('Update user balance error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user balance',
                error: error.message
            });
        }
    }
};

module.exports = gameController;