// API服务 - 连接真实后端
const API_BASE = 'http://localhost:3000/api';

export interface PortfolioItem {
  id: number;
  product_name: string;
  product_type: string;
  buy_price: number;
  current_price: number;
  buy_amount: number;
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

export interface ProductItem {
  id: number;
  name: string;
  code: string;
  current_price: number;
  product_type: string;
  available_quantity: number;
  daily_change: number;
  daily_change_percentage: number;
  previous_price: number | null;
}

// Add new interface for portfolio items used in dropdown
export interface PortfolioDropdownItem {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  product_type: string;
  quantity: number;
  buy_price: number;
  current_price: number;
}

export interface AllProductsData {
  stocks: ProductItem[];
  funds: ProductItem[];
  summary: {
    total_products: number;
    total_stocks: number;
    total_funds: number;
    stocks_gainers: number;
    stocks_losers: number;
    stocks_unchanged: number;
    funds_gainers: number;
    funds_losers: number;
    funds_unchanged: number;
  };
}

export interface BuyResult {
  success: boolean;
  message: string;
  data?: {
    holdingId: number;
    productId: number;
    userId: number;
    productName: string;
    userName: string;
    buyPrice: number;
    amount: number; // Add this field
    currentHoldingAmount: number;
    totalCost: number;
    remainingQuantity: number;
  };
}

export interface GameStatus {
  user_id: number;
  balance: number;
  remain_days: number;
  max_day: number;
  is_game_over: boolean;
  created_at: string;
  updated_at: string;
  user_name: string;
}

export interface PriceHistoryItem {
  day: number;
  date: string;
  price: number;
}

export interface ProductDetailData {
  id: number;
  name: string;
  code: string;
  current_price: number;
  product_type: string;
  available_quantity: number;
  daily_change: number;
  daily_change_percentage: number;
  previous_price: number | null;
  historical_prices: PriceHistoryItem[];
}

export interface TotalAssetsData {
  userId: number;
  totalAssets: number;
  balance: number;
  portfolioValue: number;
  timestamp: number;
  date: string;
}

export interface AssetsHistoryData {
  userId: number;
  history: Array<{
    date: string;
    timestamp: number;
    totalAssets: number;
    balance: number;
    portfolioValue: number;
    day: number;
    estimated?: boolean; // 标记是否为估算数据
  }>;
  count: number;
  currentDay?: number;
  maxDay?: number;
}

export interface ProductContribution {
  productId: number;
  productName: string;
  totalProfit?: number;
  totalProfitPercentage?: number;
  unrealizedProfit?: number;
  unrealizedProfitPercentage?: number;
  currentValue?: number;
  cost?: number;
  quantity?: number;
  currentPrice?: number;
  buyPrice?: number;
  transactions?: Array<{
    date: string;
    timestamp: number;
    profit: number;
    profitPercentage: number;
    sellPrice: number;
    sellAmount: number;
    originalCost: number;
  }>;
}

export interface ProductContributionsData {
  userId: number;
  summary: {
    totalRealizedProfit: number;
    totalUnrealizedProfit: number;
    totalProfit: number;
    totalProfitPercentage: number;
    realizedCount: number;
    unrealizedCount: number;
    historyDays: number;
  };
  realizedProfits: ProductContribution[];
  unrealizedProfits: ProductContribution[];
  sortOptions: {
    realized: { sort: string; order: string };
    unrealized: { sort: string; order: string };
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
      return data.data.map((item: {
        holding_id: number;
        product_name: string;
        product_type: string;
        buy_price: string;
        current_price: string;
        buy_amount: string;
        cost: string;
        total_current_value: string;
        change: string;
        change_percentage: string;
        profit_loss: string;
        profit_loss_percentage: string;
      }) => ({
        id: item.holding_id,
        product_name: item.product_name,
        product_type: item.product_type,
        buy_price: parseFloat(item.buy_price),
        current_price: parseFloat(item.current_price),
        buy_amount: parseInt(item.buy_amount),
        cost: parseFloat(item.cost),
        current_value: parseFloat(item.total_current_value),
        gain_loss: parseFloat(item.profit_loss),
        gain_loss_percentage: parseFloat(item.profit_loss_percentage)
      }));
    } catch (error) {
      console.error('获取投资组合失败:', error);
      throw error;
    }
  },

  // Add new method for portfolio dropdown data
  async getPortfolioForDropdown(userId: string): Promise<PortfolioDropdownItem[]> {
    try {
      const response = await fetch(`${API_BASE}/portfolio/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取投资组合失败');
      }
      
      // Convert to dropdown format
      return data.data.map((item: any) => ({
        id: item.holding_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        product_type: item.product_type,
        quantity: parseInt(item.buy_amount),
        buy_price: parseFloat(item.buy_price),
        current_price: parseFloat(item.current_price)
      }));
    } catch (error) {
      console.error('获取投资组合下拉数据失败:', error);
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
      const holdings = data.holdings.map((item: {
        id: number;
        product_name: string;
        buy_price: string;
        current_price: string;
        quantity: string;
        cost: string;
        current_value: string;
        gain_loss: string;
        gain_loss_percentage: string;
      }) => ({
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
   
  // 买入产品
  async buyProduct(productId: string, userId: string, amount: number): Promise<BuyResult> {
    try {
      console.log(`buyProduct called with productId: ${productId}, userId: ${userId}, amount: ${amount}`);
      const response = await fetch(`${API_BASE}/buy/product/${productId}/user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        console.log(`productId: ${productId},userId: ${userId}, buyAmount: ${amount}`);
       
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '买入操作失败');
      }
      
      return data;
    } catch (error) {
      console.error('买入产品失败:', error);
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
  async getPriceStatus(): Promise<{ success: boolean; daysUpdated: number; totalDays: number; currentDay?: number; date?: string }> {
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
  async initializeGame(userId: string, initialBalance: number, gameRemainDays: number): Promise<{ success: boolean; message: string; data?: { currentDay?: number; date?: string } }> {
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
  },

  // 推进到下一天
  async advanceDay(userId: string): Promise<{ success: boolean; message: string; data?: { currentDay?: number; date?: string } }> {
    try {
      const response = await fetch(`${API_BASE}/advanceday?user_id=${userId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '推进到下一天失败');
      }
      
      return data;
    } catch (error) {
      console.error('推进到下一天失败:', error);
      throw error;
    }
  },

  // 重置游戏
  async restartGame(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/restartgame?user_id=${userId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '重置游戏失败');
      }
      
      return data;
    } catch (error) {
      console.error('重置游戏失败:', error);
      throw error;
    }
  },

  // 获取所有产品
  async getAllProducts(): Promise<AllProductsData> {
    try {
      const response = await fetch(`${API_BASE}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取产品列表失败');
      }
      
      return data.data;
    } catch (error) {
      console.error('获取产品列表失败:', error);
      throw error;
    }
  },

  // 获取产品详情
  async getProductDetail(productId: string): Promise<ProductDetailData> {
    try {
      const response = await fetch(`${API_BASE}/product/detail/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取产品详情失败');
      }
      
      return data.data;
    } catch (error) {
      console.error('获取产品详情失败:', error);
      throw error;
    }
  },

  // 按类型获取产品
  async getProductsByType(type: 'stocks' | 'funds'): Promise<ProductItem[]> {
    try {
      const response = await fetch(`${API_BASE}/products/${type}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || `获取${type === 'stocks' ? '股票' : '基金'}列表失败`);
      }
      
      return data.data[type];
    } catch (error) {
      console.error(`获取${type === 'stocks' ? '股票' : '基金'}列表失败:`, error);
      throw error;
    }
  },

  // 获取游戏状态
  async getGameStatus(userId: string): Promise<GameStatus> {
    try {
      const response = await fetch(`${API_BASE}/gamestatus?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取游戏状态失败');
      }
      
      return data.data;
    } catch (error) {
      console.error('获取游戏状态失败:', error);
      throw error;
    }
  },

  // 获取总资产
  async getTotalAssets(userId: string): Promise<TotalAssetsData> {
    try {
      const response = await fetch(`${API_BASE}/assets/total?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取总资产失败');
      }
      
      return data.data;
    } catch (error) {
      console.error('获取总资产失败:', error);
      throw error;
    }
  },

  // 获取总资产历史
  async getTotalAssetsHistory(userId: string): Promise<AssetsHistoryData> {
    try {
      const response = await fetch(`${API_BASE}/assets/history?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取总资产历史失败');
      }
      
      return data.data;
    } catch (error) {
      console.error('获取总资产历史失败:', error);
      throw error;
    }
  },

  // 获取产品贡献分析
  async getProductContributions(
    userId: string, 
    realizedSort: string = 'profit', 
    realizedOrder: string = 'desc',
    unrealizedSort: string = 'profit', 
    unrealizedOrder: string = 'desc'
  ): Promise<ProductContributionsData> {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        realized_sort: realizedSort,
        realized_order: realizedOrder,
        unrealized_sort: unrealizedSort,
        unrealized_order: unrealizedOrder
      });

      const response = await fetch(`${API_BASE}/assets/contributions?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取产品贡献分析失败');
      }
      
      return data.data;
    } catch (error) {
      console.error('获取产品贡献分析失败:', error);
      throw error;
    }
  },

  // 清除用户分析数据
  async clearUserAnalysisData(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/assets/clear?user_id=${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '清除分析数据失败');
      }
      
      return data;
    } catch (error) {
      console.error('清除分析数据失败:', error);
      throw error;
    }
  }
};