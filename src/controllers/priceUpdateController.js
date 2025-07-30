const Price = require('../models/priceUpdateModel');

const priceUpdateController = {
    updatePrices: async (req, res) => {
        try {
            const result = await Price.updateAllPrices();
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update prices',
                error: error.message
            });
        }
    },

    // gh
    getStatus: (req, res) => {
        try {
            const status = Price.getUpdateStatus();
            res.json({
                success: true,
                ...status
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get update status',
                error: error.message
            });
        }
    },

    // 重置天数
    resetDays: (req, res) => {
        try {
            const result = Price.resetDays();
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to reset days',
                error: error.message
            });
        }
    }
};

module.exports = priceUpdateController;
