"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import { api, type BuyResult, type SellResult, type ProductItem } from '@/lib/api';

interface TradingOperationProps {
  userId: string;
  selectedProduct: ProductItem | null;
  onTradeComplete: () => void;
}

export default function TradingOperation({ userId, selectedProduct, onTradeComplete }: TradingOperationProps) {
  const [actionType, setActionType] = useState<'buy' | 'sell'>('buy');
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buyResult, setBuyResult] = useState<BuyResult | null>(null);
  const [sellResult, setSellResult] = useState<SellResult | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isFromProductList, setIsFromProductList] = useState(false);
  const [manualProductId, setManualProductId] = useState(""); // 手动输入的产品ID


  // 当选择的产品改变时，仅在从产品列表选择时设置
  React.useEffect(() => {
    if (selectedProduct) {
      setIsFromProductList(true);
      setProductId(selectedProduct.id.toString());
      setManualProductId(""); // 清空手动输入
    }
  }, [selectedProduct]);

  // 手动输入产品ID时的处理
  const handleManualProductIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualProductId(value);
    setProductId(value);
    // 如果手动输入了产品ID，切换到手动模式
    if (value) {
      setIsFromProductList(false);
    }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await api.buyProduct(productId, userId, Number(amount));
      setBuyResult(result);
      setSellResult(null);
      setMessage({ type: 'success', text: '买入操作成功' });
      
      // 刷新数据
      setTimeout(() => {
        onTradeComplete();
      }, 1000);
    } catch {
      setBuyResult({
        success: false,
        message: '买入操作失败'
      });
      setMessage({ type: 'error', text: '买入操作失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await api.sellProduct(productId, userId, Number(amount));
      setSellResult(result);
      setBuyResult(null);
      setMessage({ type: 'success', text: '卖出操作成功' });
      
      // 刷新数据
      setTimeout(() => {
        onTradeComplete();
      }, 1000);
    } catch {
      setSellResult({
        success: false,
        message: '卖出操作失败'
      });
      setMessage({ type: 'error', text: '卖出操作失败' });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 交易操作表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {actionType === 'sell' ? '卖出操作' : '买入操作'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 模式提示 */}
            <div className="mb-4 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                {isFromProductList ? "🔄 产品列表模式" : "✏️ 手动输入模式"}
              </p>
            </div>

            {/* 选择交易类型 */}
            <div className="flex mb-4">
              <Button
                variant={actionType === 'buy' ? 'default' : 'outline'}
                onClick={() => setActionType('buy')}
                className="rounded-r-none"
              >
                买入
              </Button>
              <Button
                variant={actionType === 'sell' ? 'default' : 'outline'}
                onClick={() => setActionType('sell')}
                className="rounded-l-none"
              >
                卖出
              </Button>
            </div>

            {/* 选中产品显示 - 仅当从产品列表选择时显示 */}
            {isFromProductList && selectedProduct && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">已选择产品: {selectedProduct.name}</p>
                      <p>代码: {selectedProduct.code}</p>
                      <p>当前价格: ¥{selectedProduct.current_price.toFixed(2)}</p>
                      <p>可买数量: {selectedProduct.available_quantity}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsFromProductList(false);
                        setProductId("");
                        setManualProductId(""); // 清空手动输入
                      }}
                      className="text-xs"
                    >
                      清除选择
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <Label htmlFor="productId">产品ID</Label>
                <Input
                  id="productId"
                  type="number"
                  value={manualProductId} // 使用 manualProductId
                  onChange={handleManualProductIdChange}
                  placeholder={isFromProductList ? "已从产品列表选择" : "输入产品ID"}
                  required
                  disabled={isFromProductList}
                />
              </div>
              <div>
                <Label htmlFor="amount">数量</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`输入${actionType === 'sell' ? '卖出' : '买入'}数量`}
                  required
                  min="1"
                />
              </div>
              {/* 预计金额显示 - 仅当从产品列表选择时显示 */}
              {isFromProductList && selectedProduct && amount && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    预计{actionType === 'sell' ? '收入' : '花费'}: 
                    <span className="font-semibold ml-1">
                      ¥{(Number(amount) * selectedProduct.current_price).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
              
              {/* 手动模式下的提示 */}
              {!isFromProductList && amount && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    手动模式：请确保产品ID正确
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "处理中..." : `确认${actionType === 'sell' ? '卖出' : '买入'}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 交易结果显示 */}
        <Card>
          <CardHeader>
            <CardTitle>{actionType === 'sell' ? '卖出结果' : '买入结果'}</CardTitle>
          </CardHeader>
          <CardContent>
            {actionType === 'buy' ? (
              buyResult ? (
                <div className="space-y-4">
                  <Alert className={buyResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {buyResult.message}
                    </AlertDescription>
                  </Alert>
                  
                  {buyResult.success && buyResult.data && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>产品名称:</span>
                        <span className="font-medium">{buyResult.data.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>买入价格:</span>
                        <span className="font-medium">¥{buyResult.data.buyPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>买入数量:</span>
                        <span className="font-medium">{amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>总花费:</span>
                        <span className="font-medium">¥{buyResult.data.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>当前总持仓:</span>
                        <span className="font-medium">{buyResult.data.currentHoldingAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>剩余库存:</span>
                        <span className="font-medium">{buyResult.data.remainingQuantity}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  请先执行买入操作查看结果
                </p>
              )
            ) : (
              sellResult ? (
                <div className="space-y-4">
                  <Alert className={sellResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {sellResult.message}
                    </AlertDescription>
                  </Alert>
                  
                  {sellResult.success && sellResult.data && (
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
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
