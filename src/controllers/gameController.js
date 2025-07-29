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
            const { userId } = req.params;
            
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
    }
};

module.exports = gameController;