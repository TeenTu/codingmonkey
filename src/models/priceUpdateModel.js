const db = require('../config/db');
const axios = require('axios');

// 保存当前更新到第几天
let currentDay = 0;
const MAX_DAYS = 30;

const Price = {
    updateStockPrice: async (productId, code) => {
        try {
            const response = await axios.get(
                `https://data.infoway.io/stock/batch_kline/8/30/${code}`,
                {
                    headers: {
                        'apikey': 'd8805f7e9314405ab83d00467247bbf0-infoway'
                    }
                }
            );

            if (response.data.ret === 200 && response.data.data[0]?.respList?.length > 0) {
                // 从后往前取对应天数的价格
                const priceIndex = response.data.data[0].respList.length - 1 - currentDay;
                const priceStr = response.data.data[0].respList[priceIndex]?.c;
                const latestPrice = parseFloat(priceStr);
                if (isNaN(latestPrice)) {
                    throw new Error('API返回的价格不是数字');
                }
                // 更新数据库中的价格
                const query = `
                    UPDATE product_price 
                    SET price = ? 
                    WHERE id = ?
                `;
                await db.query(query, [latestPrice, productId]);
                return true;
            }
            return false;
        } catch (error) {
            throw new Error(`Error updating stock price: ${error.message}`);
        }
    },

    updateAllPrices: async () => {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        try {
            // 如果已经更新到最大天数，返回false
            if (currentDay >= MAX_DAYS - 1) {
                return {
                    success: false,
                    message: `已经更新了${MAX_DAYS}天的数据，无法继续更新`
                };
            }

            // 获取所有股票类型的产品
            const [stocks] = await db.query(`
                SELECT p.id, p.code 
                FROM product p 
                JOIN product_type pt ON p.id = pt.id 
                WHERE pt.type = 'Stock' AND p.code IS NOT NULL
            `);

            // 逐个更新股票价格，每次间隔1秒
            for (const stock of stocks) {
                if (stock.code) {
                    await Price.updateStockPrice(stock.id, stock.code);
                    await sleep(1000); // 1秒延时
                }
            }

            // 更新成功后增加天数
            currentDay++;
            
            return {
                success: true,
                message: `成功更新第 ${currentDay} 天的价格数据`,
                currentDay: currentDay,
                remainingDays: MAX_DAYS - currentDay
            };
        } catch (error) {
            throw new Error(`Error updating all prices: ${error.message}`);
        }
    },

    // 获取当前更新状态
    getUpdateStatus: () => {
        return {
            currentDay,
            maxDays: MAX_DAYS,
            remainingDays: MAX_DAYS - currentDay,
            canUpdate: currentDay < MAX_DAYS
        };
    },

    // 重置天数（当服务器重启时会自动重置）
    resetDays: () => {
        currentDay = 0;
        return {
            success: true,
            message: '已重置更新天数'
        };
    }
};

module.exports = Price;
