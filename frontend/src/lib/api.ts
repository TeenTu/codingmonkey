// API服务 - 连接真实后端
const API_BASE = 'http://localhost:3000/api';

export interface PortfolioItem {
  id: number;
  product_name: string;
  buy_price: number;
  current_price: number;
  quantity: number;
  cost: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percentage: number;
}

export interface PerformanceData {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdings: PortfolioItem[];
}

export interface SellResult {
  success: boolean;
  message: string;
  data?: {
    sold_amount: number;
    profit_summary: {
      total_profit: number;
      total_profit_percentage: number;
      current_price: number;
    };
  };
}

// API函数
export const api = {
  // 获取投资组合
  async getPortfolio(userId: string): Promise<PortfolioItem[]> {
    try {
      const response = await fetch(`${API_BASE}/portfolio/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取投资组合失败');
      }
      
      // 转换后端数据格式为前端格式
      return data.data.map((item: any) => ({
        id: item.holding_id,
        product_name: item.product_name,
        buy_price: parseFloat(item.buy_price),
        current_price: parseFloat(item.current_price),
        quantity: parseInt(item.buy_amount),
        cost: parseFloat(item.total_buy_value),
        current_value: parseFloat(item.total_current_value),
        gain_loss: parseFloat(item.profit_loss),
        gain_loss_percentage: parseFloat(item.profit_loss_percentage)
      }));
    } catch (error) {
      console.error('获取投资组合失败:', error);
      throw error;
    }
  },

  // 获取投资表现
  async getPerformance(userId: string): Promise<PerformanceData> {
    try {
      const response = await fetch(`${API_BASE}/performance?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 转换后端数据格式为前端格式
      const holdings = data.holdings.map((item: any) => ({
        id: item.id,
        product_name: item.product_name,
        buy_price: parseFloat(item.buy_price),
        current_price: parseFloat(item.current_price),
        quantity: parseInt(item.quantity),
        cost: parseFloat(item.cost),
        current_value: parseFloat(item.current_value),
        gain_loss: parseFloat(item.gain_loss),
        gain_loss_percentage: parseFloat(item.gain_loss_percentage)
      }));
      
      return {
        totalValue: parseFloat(data.totalValue),
        totalCost: parseFloat(data.totalCost),
        totalGainLoss: parseFloat(data.totalGainLoss),
        totalGainLossPercentage: parseFloat(data.totalGainLossPercentage),
        holdings
      };
    } catch (error) {
      console.error('获取投资表现失败:', error);
      throw error;
    }
  },

  // 卖出产品
  async sellProduct(productId: string, userId: string, amount: number): Promise<SellResult> {
    try {
      const response = await fetch(`${API_BASE}/sell/product/${productId}/user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '卖出操作失败');
      }
      
      return data;
    } catch (error) {
      console.error('卖出产品失败:', error);
      throw error;
    }
  },

  // 更新价格
  async updatePrices(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/update-prices`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '价格更新失败');
      }
      
      return data;
    } catch (error) {
      console.error('更新价格失败:', error);
      throw error;
    }
  },

  // 获取价格状态
  async getPriceStatus(): Promise<{ success: boolean; daysUpdated: number; totalDays: number }> {
    try {
      const response = await fetch(`${API_BASE}/price-update-status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取价格状态失败');
      }
      
      return data;
    } catch (error) {
      console.error('获取价格状态失败:', error);
      throw error;
    }
  },

  // 重置价格天数
  async resetPriceDays(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/reset-price-updates`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '重置天数失败');
      }
      
      return data;
    } catch (error) {
      console.error('重置价格天数失败:', error);
      throw error;
    }
  },

  // 模拟投资初始化
  async initializeGame(userId: string, initialBalance: number, gameRemainDays: number): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch(`${API_BASE}/gameinit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number(userId),
          initialBalance,
          gameRemainDays
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '模拟投资初始化失败');
      }
      
      return data;
    } catch (error) {
      console.error('模拟投资初始化失败:', error);
      throw error;
    }
  }
};