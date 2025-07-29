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
    },

    // Internal function for updating prices (for use by other modules)
    _updatePrices: async () => {
        try {
            const result = await Price.updateAllPrices();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to update prices');
            }
            
            return result;
        } catch (error) {
            throw new Error(`Failed to update prices: ${error.message}`);
        }
    }
};

module.exports = priceUpdateController;

// 导出内部函数供其他模块使用Example usage:
// const priceUpdateController = require('./priceUpdateController');
// const result = await priceUpdateController._updatePrices();
// 需要验证result字段success是否为true
