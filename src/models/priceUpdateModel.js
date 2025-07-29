
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// 保存当前更新到第几天
let currentDay = 0;
const MAX_DAYS = 30;


const Price = {
    updateAllPrices: async () => {
        try {
            if (currentDay >= MAX_DAYS) {
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

            // 读取并解析 CSV 文件
            const stocksCsvPath = path.join(__dirname, '../tools/stocksprices.csv');
            const fundsCsvPath = path.join(__dirname, '../tools/fundsprices.csv');
            const stocksCsv = fs.readFileSync(stocksCsvPath, 'utf8');
            const fundsCsv = fs.readFileSync(fundsCsvPath, 'utf8');
            const stocksData = parse(stocksCsv, { columns: true, skip_empty_lines: true });
            const fundsData = parse(fundsCsv, { columns: true, skip_empty_lines: true });

            // 收集所有日期
            const allDatesSet = new Set();
            for (const row of stocksData) allDatesSet.add(row.Date);
            for (const row of fundsData) allDatesSet.add(row.Date);
            const allDates = Array.from(allDatesSet).sort();

            if (currentDay >= allDates.length) {
                return {
                    success: false,
                    message: `CSV文件日期不足，已无可更新天数`
                };
            }
            const targetDate = allDates[currentDay];

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
                    // 查找对应 code 在 stocksData 的 targetDate
                    const row = stocksData.find(r => r.Code === prod.code && r.Date === targetDate);
                    if (row && row.Close) {
                        const price = parseFloat(row.Close);
                        if (!isNaN(price)) {
                            await db.query('UPDATE product_price SET price = ? WHERE id = ?', [price, prod.id]);
                        }
                    }
                } else if (prod.type === 'Fund') {
                    // 查找对应 code 在 fundsData 的 targetDate
                    const row = fundsData.find(r => r.Code === prod.code && r.Date === targetDate);
                    if (row && row.Close) {
                        const price = parseFloat(row.Close);
                        if (!isNaN(price)) {
                            await db.query('UPDATE product_price SET price = ? WHERE id = ?', [price, prod.id]);
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

            currentDay++;
            return {
                success: true,
                message: `成功更新第 ${currentDay} 天（${targetDate}）的价格数据`,
                currentDay: currentDay,
                remainingDays: Math.max(0, Math.min(MAX_DAYS, allDates.length) - currentDay),
                date: targetDate
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
