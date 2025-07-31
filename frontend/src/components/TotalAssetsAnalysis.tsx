"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import { api, type TotalAssetsData, type AssetsHistoryData, type ProductContributionsData } from '@/lib/api';

interface TotalAssetsAnalysisProps {
  userId: string;
  dataUpdateTimestamp?: number; // 新增：用于外部触发数据刷新
}

const TotalAssetsAnalysis: React.FC<TotalAssetsAnalysisProps> = ({ userId, dataUpdateTimestamp }) => {
  const [totalAssets, setTotalAssets] = useState<TotalAssetsData | null>(null);
  const [assetsHistory, setAssetsHistory] = useState<AssetsHistoryData | null>(null);
  const [contributions, setContributions] = useState<ProductContributionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 排序选项
  const [realizedSort, setRealizedSort] = useState('profit');
  const [realizedOrder, setRealizedOrder] = useState('desc');
  const [unrealizedSort, setUnrealizedSort] = useState('profit');
  const [unrealizedOrder, setUnrealizedOrder] = useState('desc');

  // 图表视图选项
  const [chartView, setChartView] = useState('overview');

  // 加载所有数据
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [assetsData, historyData, contributionsData] = await Promise.all([
        api.getTotalAssets(userId),
        api.getTotalAssetsHistory(userId),
        api.getProductContributions(userId, realizedSort, realizedOrder, unrealizedSort, unrealizedOrder)
      ]);

      setTotalAssets(assetsData);
      setAssetsHistory(historyData);
      setContributions(contributionsData);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '加载资产分析数据失败' 
      });
    } finally {
      setLoading(false);
    }
  };

  // 更新产品贡献数据（当排序改变时）
  const updateContributions = async () => {
    try {
      const contributionsData = await api.getProductContributions(
        userId, realizedSort, realizedOrder, unrealizedSort, unrealizedOrder
      );
      setContributions(contributionsData);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '更新产品贡献数据失败' 
      });
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userId]);

  // 当dataUpdateTimestamp改变时，刷新数据
  useEffect(() => {
    if (dataUpdateTimestamp) {
      loadAllData();
    }
  }, [dataUpdateTimestamp]);

  useEffect(() => {
    if (contributions) {
      updateContributions();
    }
  }, [realizedSort, realizedOrder, unrealizedSort, unrealizedOrder]);

  // 格式化货币
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '¥0.00';
    }
    return `¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 格式化百分比
  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    return `${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(2)}%`;
  };

  // 准备图表数据
  const prepareChartData = () => {
    if (!assetsHistory || !assetsHistory.history) return [];
    
    return assetsHistory.history.map((item) => ({
      day: `第${item.day}天`,
      dayNumber: item.day,
      date: item.date,
      totalAssets: Number(item.totalAssets) || 0,
      balance: Number(item.balance) || 0,
      portfolioValue: Number(item.portfolioValue) || 0,
      estimated: item.estimated || false
    }));
  };

  // 计算Y轴的动态范围
  const calculateYAxisDomain = () => {
    const chartData = prepareChartData();
    if (chartData.length === 0) return ['auto', 'auto'];
    
    let values = [];
    
    // 根据当前视图选择相应的数据
    switch (chartView) {
      case 'overview':
        // 总览模式：包含所有数据
        values = [
          ...chartData.map(item => item.totalAssets),
          ...chartData.map(item => item.balance),
          ...chartData.map(item => item.portfolioValue)
        ];
        break;
      case 'totalAssets':
        values = chartData.map(item => item.totalAssets);
        break;
      case 'balance':
        values = chartData.map(item => item.balance);
        break;
      case 'portfolioValue':
        values = chartData.map(item => item.portfolioValue);
        break;
      default:
        values = chartData.map(item => item.totalAssets);
    }

    const firstDayTotal = chartData[0]?.totalAssets || 0;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    const yMin = Math.min(firstDayTotal * 0.9, minValue * 0.9); 
    const yMax = Math.max(firstDayTotal * 1.1, maxValue * 1.1); 
    console.log(yMin, yMax);
    return [yMin, yMax];
  };

  // 获取图表视图配置
  const getChartConfig = () => {
    switch (chartView) {
      case 'overview':
        return {
          title: '账户资产总览',
          lines: [
            {
              dataKey: 'totalAssets',
              stroke: '#2563eb',
              strokeWidth: 2,
              name: '总资产',
              strokeDasharray: undefined
            },
            {
              dataKey: 'balance',
              stroke: '#10b981',
              strokeWidth: 1,
              name: '余额',
              strokeDasharray: '5 5'
            },
            {
              dataKey: 'portfolioValue',
              stroke: '#8b5cf6',
              strokeWidth: 1,
              name: '投资价值',
              strokeDasharray: '5 5'
            }
          ]
        };
      case 'totalAssets':
        return {
          title: '总资产变化趋势',
          lines: [
            {
              dataKey: 'totalAssets',
              stroke: '#2563eb',
              strokeWidth: 3,
              name: '总资产',
              strokeDasharray: undefined
            }
          ]
        };
      case 'balance':
        return {
          title: '余额变化趋势',
          lines: [
            {
              dataKey: 'balance',
              stroke: '#10b981',
              strokeWidth: 3,
              name: '余额',
              strokeDasharray: undefined
            }
          ]
        };
      case 'portfolioValue':
        return {
          title: '投资价值变化趋势',
          lines: [
            {
              dataKey: 'portfolioValue',
              stroke: '#8b5cf6',
              strokeWidth: 3,
              name: '投资价值',
              strokeDasharray: undefined
            }
          ]
        };
      default:
        return {
          title: '总资产变化趋势 - 总览',
          lines: [
            {
              dataKey: 'totalAssets',
              stroke: '#2563eb',
              strokeWidth: 2,
              name: '总资产',
              strokeDasharray: undefined
            },
            {
              dataKey: 'balance',
              stroke: '#10b981',
              strokeWidth: 1,
              name: '余额',
              strokeDasharray: '5 5'
            },
            {
              dataKey: 'portfolioValue',
              stroke: '#8b5cf6',
              strokeWidth: 1,
              name: '投资价值',
              strokeDasharray: '5 5'
            }
          ]
        };
    }
  };
  
  // 自定义图表提示框
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-gray-600">{data.date}</p>
          {data.estimated && (
            <p className="text-xs text-orange-500 mb-1">（估算数据）</p>
          )}
          {chartView === 'overview' ? (
            <>
              <p className="text-lg font-bold text-blue-600">
                总资产: {formatCurrency(data.totalAssets)}
              </p>
              <p className="text-sm text-green-600">
                余额: {formatCurrency(data.balance)}
              </p>
              <p className="text-sm text-purple-600">
                投资价值: {formatCurrency(data.portfolioValue)}
              </p>
            </>
          ) : (
            <p className="text-lg font-bold">
              {chartView === 'totalAssets' && `总资产: ${formatCurrency(data.totalAssets)}`}
              {chartView === 'balance' && `余额: ${formatCurrency(data.balance)}`}
              {chartView === 'portfolioValue' && `投资价值: ${formatCurrency(data.portfolioValue)}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 总收益概览 */}
      {totalAssets && contributions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 总资产 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                总资产
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAssets.totalAssets)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                余额: {formatCurrency(totalAssets.balance)} | 
                投资: {formatCurrency(totalAssets.portfolioValue)}
              </div>
            </CardContent>
          </Card>

          {/* 总收益 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                总收益
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (contributions.summary.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(contributions.summary.totalProfit)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                已实现: {formatCurrency(contributions.summary.totalRealizedProfit)} | 
                未实现: {formatCurrency(contributions.summary.totalUnrealizedProfit)}
              </div>
            </CardContent>
          </Card>

          {/* 总收益率 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                总收益率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (contributions.summary.totalProfitPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(contributions.summary.totalProfitPercentage)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                已实现持仓: {contributions.summary.realizedCount || 0} | 
                未实现持仓: {contributions.summary.unrealizedCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 总资产变化折线图 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {getChartConfig().title}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={loadAllData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {/* 图表视图切换按钮 */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant={chartView === 'overview' ? 'default' : 'outline'}
              onClick={() => setChartView('overview')}
            >
              总览
            </Button>
            <Button
              size="sm"
              variant={chartView === 'totalAssets' ? 'default' : 'outline'}
              onClick={() => setChartView('totalAssets')}
            >
              总资产
            </Button>
            <Button
              size="sm"
              variant={chartView === 'balance' ? 'default' : 'outline'}
              onClick={() => setChartView('balance')}
            >
              余额
            </Button>
            <Button
              size="sm"
              variant={chartView === 'portfolioValue' ? 'default' : 'outline'}
              onClick={() => setChartView('portfolioValue')}
            >
              投资价值
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assetsHistory && assetsHistory.history.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    domain={calculateYAxisDomain()}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {getChartConfig().lines.map((lineConfig, index) => (
                    <Line
                      key={`${lineConfig.dataKey}-${index}`}
                      type="monotone"
                      dataKey={lineConfig.dataKey}
                      stroke={lineConfig.stroke}
                      strokeWidth={lineConfig.strokeWidth}
                      strokeDasharray={lineConfig.strokeDasharray}
                      dot={{ fill: lineConfig.stroke, strokeWidth: lineConfig.strokeWidth === 3 ? 2 : 1, r: lineConfig.strokeWidth === 3 ? 4 : 2 }}
                      activeDot={{ r: 6 }}
                      name={lineConfig.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-80">
              <div className="text-gray-500">暂无总资产历史数据</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 产品贡献分析 */}
      {contributions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              产品贡献分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="unrealized" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="unrealized">
                  未实现盈亏 ({contributions.summary.unrealizedCount})
                </TabsTrigger>
                <TabsTrigger value="realized">
                  已实现盈亏 ({contributions.summary.realizedCount})
                </TabsTrigger>
              </TabsList>

              {/* 未实现盈亏 */}
              <TabsContent value="unrealized" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">排序:</label>
                    <Select value={unrealizedSort} onValueChange={setUnrealizedSort}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profit">收益金额</SelectItem>
                        <SelectItem value="profitPercentage">收益率</SelectItem>
                        <SelectItem value="name">产品名称</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUnrealizedOrder(unrealizedOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {unrealizedOrder === 'asc' ? '升序' : '降序'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {contributions.unrealizedProfits.length > 0 ? (
                    contributions.unrealizedProfits.map((item, index) => (
                      <div key={`unrealized-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">
                            持仓: {item.quantity} | 成本: {formatCurrency(item.cost || 0)} | 
                            现值: {formatCurrency(item.currentValue || 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            (item.unrealizedProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(item.unrealizedProfit || 0)}
                          </div>
                          <div className={`text-sm ${
                            (item.unrealizedProfitPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(item.unrealizedProfitPercentage || 0)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无未实现盈亏数据
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 已实现盈亏 */}
              <TabsContent value="realized" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">排序:</label>
                    <Select value={realizedSort} onValueChange={setRealizedSort}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profit">收益金额</SelectItem>
                        <SelectItem value="profitPercentage">收益率</SelectItem>
                        <SelectItem value="name">产品名称</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRealizedOrder(realizedOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {realizedOrder === 'asc' ? '升序' : '降序'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {contributions.realizedProfits.length > 0 ? (
                    contributions.realizedProfits.map((item, index) => (
                      <div key={`realized-${index}`} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              (item.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(item.totalProfit || 0)}
                            </div>
                            <div className={`text-sm ${
                              (item.totalProfitPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatPercentage(item.totalProfitPercentage || 0)}
                            </div>
                          </div>
                        </div>
                        {item.transactions && item.transactions.length > 0 && (
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>交易记录 ({item.transactions.length} 笔):</div>
                            {item.transactions.slice(0, 3).map((trans, transIndex) => (
                              <div key={transIndex} className="ml-2">
                                {trans.date}: 卖出{trans.sellAmount}股 @ ¥{trans.sellPrice.toFixed(2)} 
                                = {formatCurrency(trans.profit)} ({formatPercentage(trans.profitPercentage)})
                              </div>
                            ))}
                            {item.transactions.length > 3 && (
                              <div className="ml-2 text-gray-400">
                                ... 还有 {item.transactions.length - 3} 笔交易
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无已实现盈亏数据
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TotalAssetsAnalysis;
