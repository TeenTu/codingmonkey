"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Briefcase, 
  TrendingUp, 
  ShoppingCart, 
  RefreshCw, 
  DollarSign,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  GamepadIcon,
  Search
} from "lucide-react";
import { api, type PortfolioItem, type PerformanceData, type SellResult, type AllProductsData, type ProductItem } from "@/lib/api";

export default function Home() {
  const [userId, setUserId] = useState("1");
  const [sellProductId, setSellProductId] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [sellResult, setSellResult] = useState<SellResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 模拟投资初始化相关状态
  const [showGameInitDialog, setShowGameInitDialog] = useState(false);
  const [initialBalance, setInitialBalance] = useState("500000");
  const [gameRemainDays, setGameRemainDays] = useState("30");
  const [gameInitLoading, setGameInitLoading] = useState(false);

  // 推进天数相关状态
  const [advanceDayLoading, setAdvanceDayLoading] = useState(false);

  // 产品相关状态
  const [allProducts, setAllProducts] = useState<AllProductsData | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // 检查是否需要显示模拟投资初始化弹窗
  useEffect(() => {
    const hasInitialized = localStorage.getItem(`game_initialized_user_${userId}`);
    if (!hasInitialized) {
      setShowGameInitDialog(true);
    } else {
      loadAllData();
    }
  }, [userId]);

  // 当用户ID改变时，重置相关状态
  useEffect(() => {
    setPortfolio([]);
    setPerformance(null);
    setSellResult(null);
    setMessage(null);
  }, [userId]);

  // 模拟投资初始化处理
  const handleGameInit = async () => {
    setGameInitLoading(true);
    
    try {
      const result = await api.initializeGame(
        userId, 
        Number(initialBalance), 
        Number(gameRemainDays)
      );
      
      if (result.success) {
        // 标记用户已初始化
        localStorage.setItem(`game_initialized_user_${userId}`, 'true');
        setShowGameInitDialog(false);
        setMessage({ type: 'success', text: result.message });
        
        // 加载用户数据
        setTimeout(() => {
          loadAllData();
        }, 500);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '模拟投资初始化失败' 
      });
    } finally {
      setGameInitLoading(false);
    }
  };

  // 跳过模拟投资初始化
  const handleSkipGameInit = () => {
    localStorage.setItem(`game_initialized_user_${userId}`, 'true');
    setShowGameInitDialog(false);
    loadAllData();
  };

  // 加载投资组合数据
  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.getPortfolio(userId);
      setPortfolio(data);
    } catch (error) {
      setMessage({ type: 'error', text: '加载投资组合失败' });
    } finally {
      setLoading(false);
    }
  };

  // 加载投资表现数据
  const loadPerformance = async () => {
    try {
      setLoading(true);
      const data = await api.getPerformance(userId);
      setPerformance(data);
    } catch (error) {
      setMessage({ type: 'error', text: '加载投资表现失败' });
    } finally {
      setLoading(false);
    }
  };

  // 加载用户数据
  const loadUserData = async () => {
    await Promise.all([loadPortfolio(), loadPerformance()]);
  };

  // 加载所有数据（用户数据 + 产品数据）
  const loadAllData = async () => {
    await Promise.all([loadUserData(), loadAllProducts()]);
  };

  // 加载所有产品数据
  const loadAllProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await api.getAllProducts();
      setAllProducts(data);
    } catch (error) {
      setMessage({ type: 'error', text: '加载产品列表失败' });
    } finally {
      setProductsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadAllData();
  }, []);

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await api.sellProduct(sellProductId, userId, Number(sellAmount));
      setSellResult(result);
      setMessage({ type: 'success', text: '卖出操作成功' });
      
      // 刷新数据
      setTimeout(() => {
        loadAllData();
      }, 1000);
    } catch (error) {
      setSellResult({
        success: false,
        message: '卖出操作失败'
      });
      setMessage({ type: 'error', text: '卖出操作失败' });
    } finally {
      setIsLoading(false);
    }
  };

  // 推进到下一天
  const handleAdvanceDay = async () => {
    if (!confirm('确定要推进到下一天吗？这将更新所有价格。')) {
      return;
    }
    
    setAdvanceDayLoading(true);
    
    try {
      const result = await api.advanceDay(userId);
      setMessage({ type: 'success', text: result.message });
      
      // 刷新数据
      setTimeout(() => {
        loadAllData();
      }, 1000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '推进天数失败' 
      });
    } finally {
      setAdvanceDayLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 模拟投资初始化弹窗 */}
      <AlertDialog open={showGameInitDialog} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <GamepadIcon className="h-5 w-5" />
              模拟投资初始化设置
            </AlertDialogTitle>
            <AlertDialogDescription>
              欢迎来到投资管理系统！请设置您的初始资金和游戏天数。
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="initialBalance">初始资金（¥）</Label>
              <Input
                id="initialBalance"
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="请输入初始资金"
                min="1000"
                step="1000"
              />
              <p className="text-xs text-gray-500">建议金额：50万元以上</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gameRemainDays">剩余天数</Label>
              <Input
                id="gameRemainDays"
                type="number"
                value={gameRemainDays}
                onChange={(e) => setGameRemainDays(e.target.value)}
                placeholder="请输入投资周期"
                min="1"
                max="365"
              />
              <p className="text-xs text-gray-500">推荐：30-90天</p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipGameInit}>
              跳过设置
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleGameInit} 
              disabled={gameInitLoading || !initialBalance || !gameRemainDays}
            >
              {gameInitLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  初始化中...
                </>
              ) : (
                '开始游戏'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto py-8 px-4">
        {/* 消息提示 */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-200 text-green-800' 
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {message.text}
            </div>
          </div>
        )}
        {/* 头部 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              投资管理系统
            </h1>
            <p className="text-gray-600">
              管理您的投资组合，跟踪表现，执行交易
            </p>
          </div>
          
          {/* 用户状态显示 */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">当前用户</p>
              <p className="font-semibold text-gray-900">用户 ID: {userId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="用户ID"
                className="w-20 h-8 text-sm"
              />
              <Button size="sm" onClick={loadAllData} disabled={loading || productsLoading}>
                {loading || productsLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 主要内容 - 添加网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧边栏 - 产品列表 */}
          <div className="lg:col-span-1">
            <Card className="h-fit sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  产品市场
                </CardTitle>
                <CardDescription>
                  浏览所有可投资的股票和基金
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {productsLoading ? (
                  <div className="p-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">加载产品中...</p>
                  </div>
                ) : allProducts ? (
                  <div className="max-h-96 overflow-y-auto">
                    {/* 股票部分 */}
                    {allProducts.stocks.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b">
                          <h3 className="font-medium text-sm text-gray-700">
                            股票 ({allProducts.stocks.length})
                          </h3>
                        </div>
                        {allProducts.stocks.map((stock) => (
                          <div
                            key={stock.id}
                            onClick={() => setSelectedProduct(stock)}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedProduct?.id === stock.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {stock.name}
                                </p>
                                <p className="text-xs text-gray-500">{stock.code}</p>
                              </div>
                              <div className="text-right ml-2">
                                <p className="font-medium text-sm">¥{stock.current_price.toFixed(2)}</p>
                                <p className={`text-xs ${
                                  stock.daily_change > 0 ? 'text-green-600' : 
                                  stock.daily_change < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {stock.daily_change > 0 ? '+' : ''}{stock.daily_change_percentage.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 基金部分 */}
                    {allProducts.funds.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b">
                          <h3 className="font-medium text-sm text-gray-700">
                            基金 ({allProducts.funds.length})
                          </h3>
                        </div>
                        {allProducts.funds.map((fund) => (
                          <div
                            key={fund.id}
                            onClick={() => setSelectedProduct(fund)}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedProduct?.id === fund.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {fund.name}
                                </p>
                                <p className="text-xs text-gray-500">{fund.code}</p>
                              </div>
                              <div className="text-right ml-2">
                                <p className="font-medium text-sm">¥{fund.current_price.toFixed(2)}</p>
                                <p className={`text-xs ${
                                  fund.daily_change > 0 ? 'text-green-600' : 
                                  fund.daily_change < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {fund.daily_change > 0 ? '+' : ''}{fund.daily_change_percentage.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p className="text-sm">暂无产品数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧主要内容区域 */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              投资组合
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              投资表现
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              卖出产品
            </TabsTrigger>
          </TabsList>

          {/* 投资组合标签 */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  投资组合详情
                </CardTitle>
                <CardDescription>
                  查看您的所有投资产品和持仓情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">产品名称</th>
                        <th className="text-left p-2">买入价格</th>
                        <th className="text-left p-2">当前价格</th>
                        <th className="text-left p-2">持有数量</th>
                        <th className="text-left p-2">投资成本</th>
                        <th className="text-left p-2">当前价值</th>
                        <th className="text-left p-2">盈亏</th>
                        <th className="text-left p-2">盈亏率</th>
                      </tr>
                    </thead>
                                         <tbody>
                       {loading ? (
                         <tr>
                           <td colSpan={8} className="p-4 text-center">
                             <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                             <p className="mt-2 text-gray-500">加载中...</p>
                           </td>
                         </tr>
                       ) : portfolio.length > 0 ? (
                         portfolio.map((item: PortfolioItem) => (
                           <tr key={item.id} className="border-b hover:bg-gray-50">
                             <td className="p-2 font-medium">{item.product_name}</td>
                             <td className="p-2">¥{item.buy_price.toFixed(2)}</td>
                             <td className="p-2">¥{item.current_price.toFixed(2)}</td>
                             <td className="p-2">{item.quantity}</td>
                             <td className="p-2">¥{item.cost.toFixed(2)}</td>
                             <td className="p-2">¥{item.current_value.toFixed(2)}</td>
                             <td className={`p-2 ${item.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                               {item.gain_loss >= 0 ? '+' : ''}¥{item.gain_loss.toFixed(2)}
                             </td>
                             <td className={`p-2 ${item.gain_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                               {item.gain_loss_percentage >= 0 ? '+' : ''}{item.gain_loss_percentage.toFixed(2)}%
                             </td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                           <td colSpan={8} className="p-4 text-center text-gray-500">
                             暂无投资组合数据
                           </td>
                         </tr>
                       )}
                     </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 投资表现标签 */}
          <TabsContent value="performance">
            <div className="space-y-6">
              {/* 总体表现概览 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总投资价值</p>
                        <p className="text-2xl font-bold">¥{performance?.totalValue.toFixed(2) || '0.00'}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总投资成本</p>
                        <p className="text-2xl font-bold">¥{performance?.totalCost.toFixed(2) || '0.00'}</p>
                      </div>
                      <Briefcase className="h-8 w-8 text-gray-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总盈亏</p>
                                                 <p className={`text-2xl font-bold ${(performance?.totalGainLoss ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {(performance?.totalGainLoss ?? 0) >= 0 ? '+' : ''}¥{performance?.totalGainLoss?.toFixed(2) || '0.00'}
                         </p>
                       </div>
                       {(performance?.totalGainLoss ?? 0) >= 0 ? (
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总盈亏率</p>
                                                 <p className={`text-2xl font-bold ${(performance?.totalGainLossPercentage ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {(performance?.totalGainLossPercentage ?? 0) >= 0 ? '+' : ''}{performance?.totalGainLossPercentage?.toFixed(2) || '0.00'}%
                         </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-bold">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 详细表现表格 */}
              <Card>
                <CardHeader>
                  <CardTitle>详细表现分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">产品名称</th>
                          <th className="text-left p-2">买入价格</th>
                          <th className="text-left p-2">当前价格</th>
                          <th className="text-left p-2">持有数量</th>
                          <th className="text-left p-2">投资成本</th>
                          <th className="text-left p-2">当前价值</th>
                          <th className="text-left p-2">盈亏</th>
                          <th className="text-left p-2">盈亏率</th>
                        </tr>
                      </thead>
                      <tbody>
                                                 {performance?.holdings.map((item: PortfolioItem) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{item.product_name}</td>
                            <td className="p-2">¥{item.buy_price.toFixed(2)}</td>
                            <td className="p-2">¥{item.current_price.toFixed(2)}</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">¥{item.cost.toFixed(2)}</td>
                            <td className="p-2">¥{item.current_value.toFixed(2)}</td>
                            <td className={`p-2 ${item.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.gain_loss >= 0 ? '+' : ''}¥{item.gain_loss.toFixed(2)}
                            </td>
                            <td className={`p-2 ${item.gain_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.gain_loss_percentage >= 0 ? '+' : ''}{item.gain_loss_percentage.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 卖出产品标签 */}
          <TabsContent value="sell">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    卖出操作
                  </CardTitle>
                  <CardDescription>
                    使用FIFO策略卖出产品
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSell} className="space-y-4">
                    <div>
                      <Label htmlFor="productId">产品ID</Label>
                      <Input
                        id="productId"
                        type="number"
                        value={sellProductId}
                        onChange={(e) => setSellProductId(e.target.value)}
                        placeholder="输入产品ID"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">卖出数量</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        placeholder="输入卖出数量"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "处理中..." : "确认卖出"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>卖出结果</CardTitle>
                </CardHeader>
                <CardContent>
                  {sellResult ? (
                    <div className="space-y-4">
                      <Alert className={sellResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          {sellResult.message}
                        </AlertDescription>
                      </Alert>
                      
                      {sellResult.success && sellResult.data && (//检查操作是否成功，sellResult.data是否存在
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>卖出数量:</span>
                            <span className="font-medium">{sellResult.data.sold_amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>总盈亏:</span>
                            <span className={`font-medium ${Number(sellResult.data.profit_summary.total_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Number(sellResult.data.profit_summary.total_profit) >= 0 ? '+' : ''}¥{Number(sellResult.data.profit_summary.total_profit).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>盈亏率:</span>
                            <span className={`font-medium ${Number(sellResult.data.profit_summary.total_profit_percentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Number(sellResult.data.profit_summary.total_profit_percentage) >= 0 ? '+' : ''}{Number(sellResult.data.profit_summary.total_profit_percentage).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      请先执行卖出操作查看结果
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </div>

        {/* 下一天按钮 - 固定在右下角 */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg" 
            onClick={handleAdvanceDay} 
            disabled={advanceDayLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            {advanceDayLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                推进中...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                下一天
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
