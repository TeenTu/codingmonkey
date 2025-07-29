const getModel = require('../models/getPortfolioModel');

const getPortfolioController = {
    // Browse portfolio
    getPortfolio: async (req, res) => {
        try {
            const { userId } = req.params;

            if (!userId || isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            const portfolio = await getModel.getPortfolioByUserId(userId);

            if (portfolio.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No portfolio found for this user'
                });
            }

            res.json({
                success: true,
                message: `Successfully retrieved portfolio for user ${portfolio[0].username}`,
                data: portfolio
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Error retrieving portfolio: ${error.message}`
            });
        }
    }
};

module.exports = getPortfolioController;
