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
  Briefcase, 
  TrendingUp, 
  ShoppingCart, 
  RefreshCw, 
  DollarSign,
  TrendingDown,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { api, type PortfolioItem, type PerformanceData, type SellResult, type BuyResult } from "@/lib/api";

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
  const [actionType, setActionType] = useState<'buy' | 'sell'>('sell');
  const [buyProductId, setBuyProductId] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [buyResult, setBuyResult] = useState<BuyResult | null>(null);



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

  // 初始加载
  useEffect(() => {
    loadUserData();
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
        loadUserData();
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

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await api.buyProduct(buyProductId, userId, Number(buyAmount));
      setBuyResult(result);
      setMessage({ type: 'success', text: '买入操作成功' });
     
      // 刷新数据
      setTimeout(() => {
        loadUserData();
      }, 1000);
    } catch (error) {
      setBuyResult({
        success: false,
        message: '买入操作失败'
      });
      setMessage({ type: 'error', text: '买入操作失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    if (actionType === 'sell') {
      await handleSell(e);
    } else {
      await handleBuy(e);
    }
  };

  const updatePrices = async () => {
    try {
      setLoading(true);
      const result = await api.updatePrices();
      setMessage({ type: 'success', text: result.message });
      
      // 刷新数据
      setTimeout(() => {
        loadUserData();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: '价格更新失败' });
    } finally {
      setLoading(false);
    }
  };

  const getPriceStatus = async () => {
    try {
      const result = await api.getPriceStatus();
      setMessage({ type: 'success', text: `价格状态: 已更新${result.daysUpdated}天，共${result.totalDays}天` });
    } catch (error) {
      setMessage({ type: 'error', text: '获取价格状态失败' });
    }
  };

  const resetPriceDays = async () => {
    if (!confirm('确定要重置价格更新天数吗？')) {
      return;
    }
    
    try {
      const result = await api.resetPriceDays();
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: '重置天数失败' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            投资管理系统
          </h1>
          <p className="text-gray-600">
            管理您的投资组合，跟踪表现，执行交易
          </p>
        </div>

        {/* 用户选择和快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                用户设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">用户ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="输入用户ID"
                  />
                </div>
                                 <Button className="w-full" onClick={loadUserData} disabled={loading}>
                   {loading ? (
                     <>
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       加载中...
                     </>
                   ) : (
                     '加载数据'
                   )}
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                快速操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={updatePrices}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  更新价格
                </Button>
                <Button variant="outline" onClick={getPriceStatus}>
                  <Info className="h-4 w-4 mr-2" />
                  价格状态
                </Button>
                <Button variant="outline" onClick={resetPriceDays}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  重置天数
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容 */}
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
            <TabsTrigger value="action" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              交易操作
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
                                                 <p className={`text-2xl font-bold ${performance?.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {performance?.totalGainLoss >= 0 ? '+' : ''}¥{performance?.totalGainLoss.toFixed(2) || '0.00'}
                         </p>
                       </div>
                       {performance?.totalGainLoss >= 0 ? (
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
                                                 <p className={`text-2xl font-bold ${performance?.totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {performance?.totalGainLossPercentage >= 0 ? '+' : ''}{performance?.totalGainLossPercentage.toFixed(2) || '0.00'}%
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
          <TabsContent value="action">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    {actionType === 'sell' ? '卖出操作' : '买入操作'}
                  </CardTitle>
                  <CardDescription>
                    {actionType === 'sell' ? '使用FIFO策略卖出产品' : '买入产品'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-4">
                    <Button
                      variant={actionType === 'sell' ? 'default' : 'outline'}
                      onClick={() => setActionType('sell')}
                      className="rounded-r-none"
                    >
                      卖出
                    </Button>
                    <Button
                      variant={actionType === 'buy' ? 'default' : 'outline'}
                      onClick={() => setActionType('buy')}
                      className="rounded-l-none"
                    >
                      买入
                    </Button>
                  </div>
                  <form onSubmit={handleAction} className="space-y-4">
                    <div>
                      <Label htmlFor="productId">产品ID</Label>
                      <Input
                        id="productId"
                        type="number"
                        value={actionType === 'sell' ?sellProductId: buyProductId}
                        onChange={(e) => actionType === 'sell' ? setSellProductId(e.target.value) : setBuyProductId(e.target.value)}
                        
                        placeholder="输入产品ID"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">数量</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={actionType === 'sell' ? sellAmount : buyAmount}

                        onChange={(e) => actionType === 'sell' ? setSellAmount(e.target.value) : setBuyAmount(e.target.value)}
                        placeholder={`输入${actionType === 'sell' ? '卖出' : '买入'}数量`}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "处理中..." : `确认${actionType === 'sell' ? '卖出' : '买入'}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{actionType === 'sell' ? '卖出结果' : '买入结果'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {actionType === 'sell' ? (
                    sellResult ? (
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
                    buyResult ? (
                      <div className="space-y-4">
                        <Alert className={buyResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            {buyResult.message}
                          </AlertDescription>
                        </Alert>
                        
                        {buyResult.success && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>产品名称:</span>
                              <span className="font-medium">{buyResult.data?.productName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>买入价格:</span>
                              <span className="font-medium">¥{buyResult.data?.buyPrice ? Number(buyResult.data.buyPrice).toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>买入数量:</span>
                              <span className="font-medium">{buyAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>总花费:</span>
                              <span className="font-medium">¥{buyResult.data?.totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>当前总持仓:</span>
                              <span className="font-medium">{buyResult.data?.currentHoldingAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>剩余库存:</span>
                              <span className="font-medium">{buyResult.data?.remainingQuantity}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        请先执行买入操作查看结果
                      </p>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
