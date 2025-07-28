const holdingperformance = require('../models/performanceModel');



const performanceController = {

    // Get portfolio performance
    getPerformance: async (req, res) => {
        try {
            const performance = await holdingperformance.getPerformance();
            
            if (!performance || performance.length === 0) {
                return res.status(404).json({ 
                    message: 'No holdings found',
                    totalValue: 0,
                    totalCost: 0,
                    totalGainLoss: 0,
                    totalGainLossPercentage: 0,
                    holdings: []
                });
            }

            // Calculate totals
            let totalCurrentValue = 0;
            let totalCost = 0;

            const holdingsWithPerformance = performance.map(holding => {
                const currentValue = holding.current_price * holding.buy_amount;
                const cost = holding.buy_price * holding.buy_amount;
                const gainLoss = currentValue - cost;
                const gainLossPercentage = cost > 0 ? (gainLoss / cost * 100) : 0;

                totalCurrentValue += currentValue;
                totalCost += cost;

                return {
                    holding_id: holding.holding_id,
                    product_id: holding.product_id,
                    product_name: holding.name,
                    buy_price: holding.buy_price,
                    current_price: holding.current_price,
                    quantity: holding.buy_amount,
                    cost: cost,
                    current_value: currentValue,
                    gain_loss: gainLoss,
                    gain_loss_percentage: gainLossPercentage
                };
            });

            const totalGainLoss = totalCurrentValue - totalCost;
            const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost * 100) : 0;

            res.json({
                totalValue: totalCurrentValue,
                totalCost: totalCost,
                totalGainLoss: totalGainLoss,
                totalGainLossPercentage: totalGainLossPercentage,
                holdings: holdingsWithPerformance
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Server error', 
                error: error.message 
            });
        }
    },
};

module.exports = performanceController;