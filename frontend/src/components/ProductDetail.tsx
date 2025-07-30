"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, type ProductDetailData, type BuyResult, type SellResult } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, PartyPopper, Trophy } from 'lucide-react';

interface ProductDetailProps {
  productId: string;
  userId: string;
  onBack: () => void;
}

const formatCurrency = (value: any): string => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// 礼花效果函数
const triggerConfetti = () => {
  // 如果没有安装 canvas-confetti，使用简单的 CSS 动画
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  
  // 创建礼花元素
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.animation = 'confetti-fall 3s linear forwards';
      
      document.body.appendChild(confetti);
      
      // 3秒后移除元素
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }, i * 50);
  }
};

// 喝彩效果函数
const triggerCelebration = () => {
  // 创建喝彩提示
  const celebration = document.createElement('div');
  celebration.style.position = 'fixed';
  celebration.style.top = '50%';
  celebration.style.left = '50%';
  celebration.style.transform = 'translate(-50%, -50%)';
  celebration.style.backgroundColor = 'rgba(255, 215, 0, 0.95)';
  celebration.style.color = '#000';
  celebration.style.padding = '20px 40px';
  celebration.style.borderRadius = '15px';
  celebration.style.fontSize = '24px';
  celebration.style.fontWeight = 'bold';
  celebration.style.zIndex = '10000';
  celebration.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  celebration.style.animation = 'celebration-pop 2s ease-out forwards';
  celebration.innerHTML = '🎉 恭喜盈利！🎉';
  
  document.body.appendChild(celebration);
  
  // 2秒后移除
  setTimeout(() => {
    if (celebration.parentNode) {
      celebration.parentNode.removeChild(celebration);
    }
  }, 2000);
};

export default function ProductDetail({ productId, userId, onBack }: ProductDetailProps) {
  const [productDetail, setProductDetail] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyResult, setBuyResult] = useState<BuyResult | null>(null);
  const [sellAmount, setSellAmount] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellResult, setSellResult] = useState<SellResult | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 添加CSS动画样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
      
      @keyframes celebration-pop {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 加载产品详情
  useEffect(() => {
    loadProductDetail();
  }, [productId]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      const detail = await api.getProductDetail(productId);
      setProductDetail(detail);
    } catch (error) {
      console.error('加载产品详情失败:', error);
      setMessage({ type: 'error', text: '加载产品详情失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!buyAmount || parseInt(buyAmount) <= 0) {
      setMessage({ type: 'error', text: '请输入有效的购买数量' });
      return;
    }

    if (!productDetail) {
      setMessage({ type: 'error', text: '产品信息加载中，请稍后' });
      return;
    }

    const amount = parseInt(buyAmount);
    const totalCost = amount * productDetail.current_price;

    if (!confirm(`确定要购买 ${amount} 个单位的 ${productDetail.name} 吗？\n总金额: ¥${totalCost.toFixed(2)}`)) {
      return;
    }

    try {
      setBuyLoading(true);
      setBuyResult(null);
      setMessage(null);

      const result = await api.buyProduct(productId, userId, amount);
      
      // 添加调试日志
      console.log('Buy result:', result);
      console.log('Buy result data:', result.data);
      
      setBuyResult(result);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setBuyAmount("");
        // 重新加载产品详情以更新库存
        await loadProductDetail();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: unknown) {
      console.error('买入失败:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '买入失败，请重试' });
    } finally {
      setBuyLoading(false);
    }
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sellAmount || parseInt(sellAmount) <= 0) {
      setMessage({ type: 'error', text: '请输入有效的卖出数量' });
      return;
    }

    if (!productDetail) {
      setMessage({ type: 'error', text: '产品信息加载中，请稍后' });
      return;
    }

    const amount = parseInt(sellAmount);
    const totalValue = amount * productDetail.current_price;

    if (!confirm(`确定要卖出 ${amount} 个单位的 ${productDetail.name} 吗？\n预计收入: ¥${totalValue.toFixed(2)}`)) {
      return;
    }

    try {
      setSellLoading(true);
      setSellResult(null);
      setMessage(null);

      const result = await api.sellProduct(productId, userId, amount);
      
      console.log('Sell result:', result);
      
      setSellResult(result);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setSellAmount("");
        
        // 检查是否盈利，如果盈利则触发庆祝效果
        if (result.data && result.data.profit_summary && result.data.profit_summary.total_profit >= 0) {
          // 延迟一点时间让用户看到结果，然后触发效果
          setTimeout(() => {
            triggerConfetti();
            triggerCelebration();
          }, 500);
        }
        
        // 重新加载产品详情以更新库存
        await loadProductDetail();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: unknown) {
      console.error('卖出失败:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '卖出失败，请重试' });
    } finally {
      setSellLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">加载产品详情中...</div>
      </div>
    );
  }

  if (!productDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-gray-600 mb-4">产品不存在或加载失败</div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回产品列表
        </Button>
      </div>
    );
  }

  const formatChartData = () => {
    return productDetail.historical_prices.map(item => ({
      day: `第${item.day}天`,
      price: item.price,
      date: item.date
    }));
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string; payload: { day: number; price: number; date: string } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-gray-600">{data.date}</p>
          <p className="text-lg font-bold text-blue-600">
            ¥{payload[0].value.toFixed(2)}
          </p>
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

      {/* 头部 */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{productDetail.name}</h1>
          <p className="text-gray-600">{productDetail.code}</p>
        </div>
        <Badge variant={productDetail.product_type === 'Stock' ? 'default' : 'secondary'}>
          {productDetail.product_type === 'Stock' ? '股票' : '基金'}
        </Badge>
      </div>

      {/* 产品基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>产品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ¥{productDetail.current_price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">当前价格</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold flex items-center justify-center ${
                productDetail.daily_change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {productDetail.daily_change >= 0 ? (
                  <TrendingUp className="w-5 h-5 mr-1" />
                ) : (
                  <TrendingDown className="w-5 h-5 mr-1" />
                )}
                {productDetail.daily_change >= 0 ? '+' : ''}
                {productDetail.daily_change.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">日涨跌</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                productDetail.daily_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {productDetail.daily_change_percentage >= 0 ? '+' : ''}
                {productDetail.daily_change_percentage.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">日涨跌幅</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {productDetail.available_quantity}
              </div>
              <div className="text-sm text-gray-600">可买数量</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 价格走势图 */}
      <Card>
        <CardHeader>
          <CardTitle>价格走势</CardTitle>
        </CardHeader>
        <CardContent>
          {productDetail.historical_prices.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-80">
              <div className="text-gray-500">暂无价格历史数据</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 交易操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 买入操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">买入操作</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBuy} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyAmount">购买数量</Label>
                  <Input
                    id="buyAmount"
                    type="number"
                    min="1"
                    max={productDetail.available_quantity}
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="输入购买数量"
                    disabled={buyLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>预计总金额</Label>
                  <div className="p-2 border rounded-md bg-gray-50">
                    ¥{buyAmount ? (parseInt(buyAmount) * productDetail.current_price).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={buyLoading || !buyAmount || parseInt(buyAmount) <= 0 || parseInt(buyAmount) > productDetail.available_quantity}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {buyLoading ? '购买中...' : '立即购买'}
              </Button>
            </form>

            {/* 买入结果 */}
            {buyResult && buyResult.success && buyResult.data && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">购买成功！</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>持仓ID: {buyResult.data.holdingId}</p>
                  <p>购买价格: ¥{formatCurrency(buyResult.data.buyPrice)}</p>
                  <p>当前持仓数量: {buyResult.data.currentHoldingAmount}</p>
                  <p>本次花费: ¥{formatCurrency(buyResult.data.totalCost)}</p>
                  <p>剩余可买数量: {buyResult.data.remainingQuantity}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 卖出操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">卖出操作</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSell} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellAmount">卖出数量</Label>
                  <Input
                    id="sellAmount"
                    type="number"
                    min="1"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="输入卖出数量"
                    disabled={sellLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>预计收入</Label>
                  <div className="p-2 border rounded-md bg-gray-50">
                    ¥{sellAmount ? (parseInt(sellAmount) * productDetail.current_price).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={sellLoading || !sellAmount || parseInt(sellAmount) <= 0}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {sellLoading ? '卖出中...' : '立即卖出'}
              </Button>
            </form>

            {/* 卖出结果 */}
            {sellResult && sellResult.success && sellResult.data && (
              <div className={`mt-4 p-4 border rounded-lg ${
                sellResult.data.profit_summary.total_profit >= 0 
                  ? 'bg-gradient-to-r from-green-50 to-yellow-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {sellResult.data.profit_summary.total_profit >= 0 ? (
                    <>
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold text-green-800">卖出成功！🎉</h4>
                    </>
                  ) : (
                    <h4 className="font-semibold text-red-800">卖出成功</h4>
                  )}
                </div>
                <div className={`text-sm space-y-1 ${
                  sellResult.data.profit_summary.total_profit >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  <p>卖出数量: {sellResult.data.sold_amount}</p>
                  <p className={`font-semibold ${
                    sellResult.data.profit_summary.total_profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    总盈亏: {sellResult.data.profit_summary.total_profit >= 0 ? '+' : ''}¥{formatCurrency(sellResult.data.profit_summary.total_profit)}
                  </p>
                  <p className={`font-semibold ${
                    sellResult.data.profit_summary.total_profit_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    盈亏率: {sellResult.data.profit_summary.total_profit_percentage >= 0 ? '+' : ''}{Number(sellResult.data.profit_summary.total_profit_percentage).toFixed(2)}%
                  </p>
                  {sellResult.data.profit_summary.total_profit >= 0 && (
                    <div className="flex items-center gap-1 mt-2 text-yellow-600">
                      <PartyPopper className="h-4 w-4" />
                      <span className="text-xs">恭喜盈利！</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
