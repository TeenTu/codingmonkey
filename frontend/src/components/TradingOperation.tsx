"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { api, type BuyResult, type SellResult, type ProductItem, type PortfolioDropdownItem, type GameStatus } from '@/lib/api';

interface TradingOperationProps {
  userId: string;
  selectedProduct: ProductItem | null;
  onTradeComplete: () => void;
  allProducts?: { stocks: ProductItem[]; funds: ProductItem[] } | null;
  gameStatus?: GameStatus | null;
}

export default function TradingOperation({ 
  userId, 
  selectedProduct, 
  onTradeComplete, 
  allProducts,
  gameStatus 
}: TradingOperationProps) {
  const [actionType, setActionType] = useState<'buy' | 'sell'>('buy');
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buyResult, setBuyResult] = useState<BuyResult | null>(null);
  const [sellResult, setSellResult] = useState<SellResult | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  
  // Dropdown related states
  const [selectedDropdownProduct, setSelectedDropdownProduct] = useState<ProductItem | PortfolioDropdownItem | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioDropdownItem[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load portfolio data for sell dropdown
  const loadPortfolioData = async () => {
    setLoadingPortfolio(true);
    try {
      const data = await api.getPortfolioForDropdown(userId);
      setPortfolioData(data);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
      setMessage({ type: 'error', text: '获取持仓数据失败' });
    } finally {
      setLoadingPortfolio(false);
    }
  };

  // Load portfolio data when switching to sell mode
  useEffect(() => {
    if (actionType === 'sell') {
      loadPortfolioData();
    }
  }, [actionType, userId]);

  // Reset states when action type changes
  useEffect(() => {
    setSelectedDropdownProduct(null);
    setProductId("");
    setAmount("");
    setValidationErrors([]);
    setBuyResult(null);
    setSellResult(null);
    setMessage(null);
  }, [actionType]);

  // Handle external product selection (from product list)
  useEffect(() => {
    if (selectedProduct && actionType === 'buy') {
      setSelectedDropdownProduct(selectedProduct);
      setProductId(selectedProduct.id.toString());
    }
  }, [selectedProduct, actionType]);

  // Handle dropdown selection
  const handleDropdownSelect = (value: string) => {
    if (actionType === 'buy' && allProducts) {
      // Find product in all products
      const product = [...allProducts.stocks, ...allProducts.funds].find(p => p.id.toString() === value);
      if (product) {
        setSelectedDropdownProduct(product);
        setProductId(product.id.toString());
      }
    } else if (actionType === 'sell') {
      // Find product in portfolio
      const portfolioItem = portfolioData.find(p => p.product_id.toString() === value);
      if (portfolioItem) {
        setSelectedDropdownProduct(portfolioItem);
        setProductId(portfolioItem.product_id.toString());
      }
    }
  };

  // Validate transaction
  const validateTransaction = (): boolean => {
    const errors: string[] = [];
    const amountNum = Number(amount);

    if (!selectedDropdownProduct) {
      errors.push('请选择产品');
      setValidationErrors(errors);
      return false;
    }

    if (!amount || amountNum <= 0) {
      errors.push('请输入有效的数量');
      setValidationErrors(errors);
      return false;
    }

    if (actionType === 'buy') {
      const product = selectedDropdownProduct as ProductItem;
      const totalCost = amountNum * product.current_price;
      
      // Check user balance
      if (gameStatus && totalCost > gameStatus.balance) {
        errors.push(`余额不足！需要 ¥${Number(totalCost).toFixed(2)}，当前余额 ¥${Number(gameStatus.balance).toFixed(2)}`);
      }
      
      // Check product inventory
      if (amountNum > product.available_quantity) {
        errors.push(`库存不足！最多可买入 ${product.available_quantity} 份`);
      }
    } else if (actionType === 'sell') {
      const portfolioItem = selectedDropdownProduct as PortfolioDropdownItem;
      
      // Check holding quantity
      if (amountNum > portfolioItem.quantity) {
        errors.push(`持有量不足！最多可卖出 ${portfolioItem.quantity} 份`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle amount change with real-time validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // Clear previous validation errors
    setValidationErrors([]);
  };

  // Validate on amount blur
  const handleAmountBlur = () => {
    if (amount) {
      validateTransaction();
    }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTransaction()) {
      setMessage({ type: 'error', text: '请检查输入信息' });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await api.buyProduct(productId, userId, Number(amount));
      setBuyResult(result);
      setSellResult(null);
      setMessage({ type: 'success', text: '买入操作成功' });
      
      // Clear form
      setAmount("");
      setValidationErrors([]);
      
      // Refresh data
      setTimeout(() => {
        onTradeComplete();
      }, 1000);
    } catch (error) {
      setBuyResult({
        success: false,
        message: '买入操作失败'
      });
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '买入操作失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTransaction()) {
      setMessage({ type: 'error', text: '请检查输入信息' });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await api.sellProduct(productId, userId, Number(amount));
      setSellResult(result);
      setBuyResult(null);
      setMessage({ type: 'success', text: '卖出操作成功' });
      
      // Clear form
      setAmount("");
      setValidationErrors([]);
      
      // Refresh data
      setTimeout(() => {
        onTradeComplete();
        loadPortfolioData(); // Reload portfolio data for sell dropdown
      }, 1000);
    } catch (error) {
      setSellResult({
        success: false,
        message: '卖出操作失败'
      });
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '卖出操作失败' });
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

  // Get available products for buy dropdown
  const getAvailableProducts = () => {
    if (!allProducts) return [];
    return [...allProducts.stocks, ...allProducts.funds].filter(p => p.available_quantity > 0);
  };

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : message.type === 'warning'
            ? 'bg-yellow-100 border border-yellow-200 text-yellow-800'
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 验证错误提示 */}
      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-red-800">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
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

            <form onSubmit={handleAction} className="space-y-6">
              {/* 产品选择下拉框 */}
              <div className="space-y-3">
                <Label htmlFor="productSelect" className="text-base font-medium">选择产品</Label>
                <Select 
                  value={selectedDropdownProduct ? 
                    (actionType === 'buy' ? 
                      (selectedDropdownProduct as ProductItem).id?.toString() || "" : 
                      (selectedDropdownProduct as PortfolioDropdownItem).product_id?.toString() || ""
                    ) : 
                    ""
                  } 
                  onValueChange={handleDropdownSelect}
                >
                  <SelectTrigger className="h-30 px-4 text-base [&_svg]:!h-10 [&_svg]:!w-6">
                    <SelectValue placeholder={
                      actionType === 'buy' ? 
                        "选择要买入的产品" : 
                        loadingPortfolio ? "加载中..." : "选择要卖出的产品"
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {actionType === 'buy' ? (
                      // Buy dropdown - show available products
                      getAvailableProducts().map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()} className="py-3">
                          <div className="flex flex-col space-y-1">
                            <span className="font-medium text-sm">{product.name} ({product.code})</span>
                            <span className="text-xs text-gray-500">
                              {product.product_type} • ¥{product.current_price.toFixed(2)} • 库存: {product.available_quantity}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      // Sell dropdown - show portfolio holdings
                      portfolioData.map((item) => (
                        <SelectItem key={item.product_id} value={item.product_id.toString()} className="py-3">
                          <div className="flex flex-col space-y-1">
                            <span className="font-medium text-sm">{item.product_name} ({item.product_code})</span>
                            <span className="text-xs text-gray-500">
                              {item.product_type} • 持有: {item.quantity} 份 • 现价: ¥{item.current_price.toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* 选中产品信息显示 */}
              {selectedDropdownProduct && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-blue-800">已选择产品</h4>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {actionType === 'buy' ? '买入模式' : '卖出模式'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-blue-600 block mb-1">产品名称</span>
                        <p className="font-semibold">
                          {actionType === 'buy' ? 
                            (selectedDropdownProduct as ProductItem).name : 
                            (selectedDropdownProduct as PortfolioDropdownItem).product_name
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-blue-600 block mb-1">产品代码</span>
                        <p className="font-medium">
                          {actionType === 'buy' ? 
                            (selectedDropdownProduct as ProductItem).code : 
                            (selectedDropdownProduct as PortfolioDropdownItem).product_code
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-blue-600 block mb-1">产品类型</span>
                        <p className="font-medium">
                          {actionType === 'buy' ? 
                            (selectedDropdownProduct as ProductItem).product_type : 
                            (selectedDropdownProduct as PortfolioDropdownItem).product_type
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-blue-600 block mb-1">当前价格</span>
                        <p className="font-semibold text-lg">
                          ¥{actionType === 'buy' ? 
                            (selectedDropdownProduct as ProductItem).current_price?.toFixed(2) || '0.00' : 
                            (selectedDropdownProduct as PortfolioDropdownItem).current_price?.toFixed(2) || '0.00'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-blue-600 block mb-1">
                          {actionType === 'buy' ? '可买数量' : '持有数量'}
                        </span>
                        <p className="font-semibold text-green-700">
                          {actionType === 'buy' ? 
                            (selectedDropdownProduct as ProductItem).available_quantity || 0 : 
                            (selectedDropdownProduct as PortfolioDropdownItem).quantity || 0
                          } 份
                        </p>
                      </div>
                      {actionType === 'sell' && (selectedDropdownProduct as PortfolioDropdownItem).buy_price && (
                        <div>
                          <span className="text-xs text-blue-600 block mb-1">买入价格</span>
                          <p className="font-medium text-gray-700">
                            ¥{(selectedDropdownProduct as PortfolioDropdownItem).buy_price.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 产品代码（只读显示） */}
              <div className="space-y-3">
                <Label htmlFor="productCode" className="text-base font-medium text-gray-700">产品代码</Label>
                <div className="relative">
                  <Input
                    id="productCode"
                    type="text"
                    value={selectedDropdownProduct ? 
                      (actionType === 'buy' ? 
                        (selectedDropdownProduct as ProductItem).code || '' : 
                        (selectedDropdownProduct as PortfolioDropdownItem).product_code || ''
                      ) : 
                      ""
                    }
                    placeholder="请先选择产品"
                    readOnly
                    className="bg-gray-100 h-12 text-center font-mono text-lg font-semibold border-2 border-gray-200"
                  />
                  {selectedDropdownProduct && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        CODE
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 数量输入 */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-medium">
                  {actionType === 'sell' ? '卖出数量' : '买入数量'}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  placeholder={`输入${actionType === 'sell' ? '卖出' : '买入'}数量`}
                  required
                  min="1"
                  max={selectedDropdownProduct ? 
                    (actionType === 'buy' ? 
                      (selectedDropdownProduct as ProductItem).available_quantity || 0 : 
                      (selectedDropdownProduct as PortfolioDropdownItem).quantity || 0
                    ) : undefined
                  }
                  className="h-12 text-center text-lg font-semibold"
                />
                {selectedDropdownProduct && (
                  <p className="text-xs text-gray-500 text-center">
                    最多可{actionType === 'sell' ? '卖出' : '买入'}: {
                      actionType === 'buy' ? 
                        (selectedDropdownProduct as ProductItem).available_quantity || 0 : 
                        (selectedDropdownProduct as PortfolioDropdownItem).quantity || 0
                    } 份
                  </p>
                )}
              </div>

              {/* 预计金额显示 */}
              {selectedDropdownProduct && amount && Number(amount) > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">交易预览</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        预计{actionType === 'sell' ? '收入' : '花费'}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ¥{(Number(amount) * (actionType === 'buy' ? 
                          (selectedDropdownProduct as ProductItem).current_price || 0 : 
                          (selectedDropdownProduct as PortfolioDropdownItem).current_price || 0
                        )).toFixed(2)}
                      </span>
                    </div>
                    
                    {actionType === 'buy' && gameStatus && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">当前余额</span>
                        <span className="font-semibold text-green-600">
                          ¥{Number(gameStatus.balance).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {actionType === 'sell' && selectedDropdownProduct && (selectedDropdownProduct as PortfolioDropdownItem).buy_price && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">预计盈亏</span>
                        <span className={`font-bold ${
                          (((selectedDropdownProduct as PortfolioDropdownItem).current_price || 0) - 
                           ((selectedDropdownProduct as PortfolioDropdownItem).buy_price || 0)) * Number(amount) >= 0 ? 
                          'text-green-600' : 'text-red-600'
                        }`}>
                          {(((selectedDropdownProduct as PortfolioDropdownItem).current_price || 0) - 
                           ((selectedDropdownProduct as PortfolioDropdownItem).buy_price || 0)) * Number(amount) >= 0 ? '+' : ''}
                          ¥{((((selectedDropdownProduct as PortfolioDropdownItem).current_price || 0) - 
                             ((selectedDropdownProduct as PortfolioDropdownItem).buy_price || 0)) * Number(amount)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                disabled={isLoading || !selectedDropdownProduct || !amount || validationErrors.length > 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  `确认${actionType === 'sell' ? '卖出' : '买入'}`
                )}
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
                        <span className="font-medium">
                          {buyResult.data?.amount || amount}
                        </span>
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
