/**
 * 运行时数据存储模块
 * 用于存储总资产历史、交易记录等临时数据
 * 数据在应用重启后会丢失
 */

class RuntimeStorage {
    constructor() {
        // 用户总资产历史记录 { userId: { date: string, totalAssets: number, balance: number, portfolioValue: number, day: number }[] }
        this.totalAssetsHistory = new Map();
        
        // 用户已实现盈亏记录 { userId: { productId: number, productName: string, totalProfit: number, totalProfitPercentage: number, transactions: [] }[] }
        this.realizedProfits = new Map();
        
        // 用户未实现盈亏记录 { userId: { productId: number, productName: string, unrealizedProfit: number, unrealizedProfitPercentage: number, currentValue: number, cost: number }[] }
        this.unrealizedProfits = new Map();
        
        // 初始化标记 { userId: boolean }
        this.initialized = new Map();
    }

    /**
     * 初始化用户数据
     */
    initializeUser(userId) {
        const userIdStr = String(userId);
        if (!this.initialized.get(userIdStr)) {
            this.totalAssetsHistory.set(userIdStr, []);
            this.realizedProfits.set(userIdStr, []);
            this.unrealizedProfits.set(userIdStr, []);
            this.initialized.set(userIdStr, true);
        }
    }

    /**
     * 记录总资产历史
     */
    recordTotalAssets(userId, totalAssets, balance, portfolioValue, day = null) {
        const userIdStr = String(userId);
        this.initializeUser(userIdStr);
        
        const history = this.totalAssetsHistory.get(userIdStr);
        const currentDate = new Date().toISOString().split('T')[0];
        
        // 使用传入的day或者基于历史记录的最大day + 1
        let recordDay = day;
        if (!recordDay) {
            const maxDay = history.length > 0 ? Math.max(...history.map(h => h.day)) : 0;
            recordDay = maxDay + 1;
        }
        
        // 检查是否已有相同天数的记录
        const existingIndex = history.findIndex(record => record.day === recordDay);
        
        const record = {
            date: currentDate,
            timestamp: Date.now(),
            totalAssets: Number(totalAssets),
            balance: Number(balance),
            portfolioValue: Number(portfolioValue),
            day: recordDay
        };
        
        if (existingIndex >= 0) {
            // 更新相同天数的记录
            history[existingIndex] = record;
        } else {
            // 添加新记录
            history.push(record);
        }
        
        // 按天数排序
        history.sort((a, b) => a.day - b.day);
        
        // 保持最近30天的记录
        if (history.length > 30) {
            history.shift();
        }
    }

    /**
     * 获取总资产历史
     */
    getTotalAssetsHistory(userId) {
        const userIdStr = String(userId);
        this.initializeUser(userIdStr);
        return this.totalAssetsHistory.get(userIdStr) || [];
    }

    /**
     * 记录已实现盈亏
     */
    recordRealizedProfit(userId, productId, productName, profit, profitPercentage, sellPrice, sellAmount, originalCost) {
        const userIdStr = String(userId);
        this.initializeUser(userIdStr);
        
        const profits = this.realizedProfits.get(userIdStr);
        let existingProduct = profits.find(p => p.productId === productId);
        
        if (!existingProduct) {
            existingProduct = {
                productId: Number(productId),
                productName: String(productName),
                totalProfit: 0,
                totalProfitPercentage: 0,
                transactions: []
            };
            profits.push(existingProduct);
        }
        
        // 记录交易
        const transaction = {
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            profit: Number(profit),
            profitPercentage: Number(profitPercentage),
            sellPrice: Number(sellPrice),
            sellAmount: Number(sellAmount),
            originalCost: Number(originalCost)
        };
        
        existingProduct.transactions.push(transaction);
        
        // 更新总盈亏
        existingProduct.totalProfit += Number(profit);
        
        // 重新计算总盈亏率（加权平均）
        const totalCost = existingProduct.transactions.reduce((sum, t) => sum + t.originalCost, 0);
        if (totalCost > 0) {
            existingProduct.totalProfitPercentage = (existingProduct.totalProfit / totalCost) * 100;
        }
    }

    /**
     * 更新未实现盈亏
     */
    updateUnrealizedProfits(userId, currentHoldings) {
        const userIdStr = String(userId);
        this.initializeUser(userIdStr);
        
        const unrealizedList = [];
        
        currentHoldings.forEach(holding => {
            const unrealizedProfit = holding.current_value - holding.cost;
            const unrealizedProfitPercentage = holding.cost > 0 ? (unrealizedProfit / holding.cost) * 100 : 0;
            
            unrealizedList.push({
                productId: holding.product_id || holding.id,
                productName: holding.product_name,
                unrealizedProfit: unrealizedProfit,
                unrealizedProfitPercentage: unrealizedProfitPercentage,
                currentValue: holding.current_value,
                cost: holding.cost,
                quantity: holding.quantity,
                currentPrice: holding.current_price,
                buyPrice: holding.buy_price
            });
        });
        
        this.unrealizedProfits.set(userIdStr, unrealizedList);
    }

    /**
     * 获取已实现盈亏
     */
    getRealizedProfits(userId, sortBy = 'profit', order = 'desc') {
        const userIdStr = String(userId);
        this.initializeUser(userIdStr);
        
        const profits = [...this.realizedProfits.get(userIdStr)];
        
        profits.sort((a, b) => {
            let valueA, valueB;
            if (sortBy === 'profit') {
                valueA = a.totalProfit;
                valueB = b.totalProfit;
            } else if (sortBy === 'profitPercentage') {
                valueA = a.totalProfitPercentage;
                valueB = b.totalProfitPercentage;
            } else {
                valueA = a.productName;
                valueB = b.productName;
                return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        });
        
        return profits;
    }

    /**
     * 获取未实现盈亏
     */
    getUnrealizedProfits(userId, sortBy = 'profit', order = 'desc') {
        const userIdStr = String(userId);
        this.initializeUser(userIdStr);
        
        const profits = [...this.unrealizedProfits.get(userIdStr)];
        
        profits.sort((a, b) => {
            let valueA, valueB;
            if (sortBy === 'profit') {
                valueA = a.unrealizedProfit;
                valueB = b.unrealizedProfit;
            } else if (sortBy === 'profitPercentage') {
                valueA = a.unrealizedProfitPercentage;
                valueB = b.unrealizedProfitPercentage;
            } else {
                valueA = a.productName;
                valueB = b.productName;
                return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        });
        
        return profits;
    }

    /**
     * 清除用户数据
     */
    clearUserData(userId) {
        const userIdStr = String(userId);
        this.totalAssetsHistory.delete(userIdStr);
        this.realizedProfits.delete(userIdStr);
        this.unrealizedProfits.delete(userIdStr);
        this.initialized.delete(userIdStr);
    }

    /**
     * 获取用户总体统计
     */
    getUserSummary(userId) {
        const userIdStr = String(userId);
        this.initializeUser(userIdStr);
        
        const realizedProfits = this.getRealizedProfits(userIdStr);
        const unrealizedProfits = this.getUnrealizedProfits(userIdStr);
        const assetsHistory = this.getTotalAssetsHistory(userIdStr);
        
        const totalRealizedProfit = realizedProfits.reduce((sum, p) => sum + p.totalProfit, 0);
        const totalUnrealizedProfit = unrealizedProfits.reduce((sum, p) => sum + p.unrealizedProfit, 0);
        const totalProfit = totalRealizedProfit + totalUnrealizedProfit;
        
        // 计算初始总资产（如果有历史记录）
        let totalProfitPercentage = 0;
        if (assetsHistory.length > 0) {
            const initialAssets = assetsHistory[0].totalAssets;
            const currentAssets = assetsHistory[assetsHistory.length - 1].totalAssets;
            if (initialAssets > 0) {
                totalProfitPercentage = ((currentAssets - initialAssets) / initialAssets) * 100;
            }
        }
        
        return {
            totalRealizedProfit,
            totalUnrealizedProfit,
            totalProfit,
            totalProfitPercentage,
            realizedCount: realizedProfits.length,
            unrealizedCount: unrealizedProfits.length,
            historyDays: assetsHistory.length
        };
    }
}

// 创建单例实例
const runtimeStorage = new RuntimeStorage();

module.exports = runtimeStorage;
