"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Briefcase } from "lucide-react";
import { api, type PortfolioItem, type PerformanceData } from "@/lib/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Home() {
  const [userId, setUserId] = useState("1");
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false); // 👈 toggle state

  // Load portfolio
  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.getPortfolio(userId);
      setPortfolio(data);
    } catch (error) {
      console.error("加载投资组合失败", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle data: group by type
  const chartData = Object.values(
    portfolio.reduce((acc: any, item: PortfolioItem) => {
      if (!acc[item.product_type]) {
        acc[item.product_type] = { name: item.product_type, value: 0 };
      }
      acc[item.product_type].value += item.current_price * item.buy_amount;
      return acc;
    }, {})
  );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* 用户设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              投资组合详情
            </CardTitle>
            <CardDescription>
              查看您的所有投资产品和持仓情况
            </CardDescription>
            <div className="mt-4">
              <Button onClick={() => setShowChart(!showChart)} variant="outline">
                {showChart ? "查看表格" : "查看图表"}
              </Button>
              <Button className="ml-2" onClick={loadPortfolio} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 加载中...
                  </>
                ) : (
                  "加载数据"
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : showChart ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">产品名称</th>
                      <th className="text-left p-2">产品代码</th>
                      <th className="text-left p-2">类型</th>
                      <th className="text-left p-2">买入价格</th>
                      <th className="text-left p-2">持有数量</th>
                      <th className="text-left p-2">当前价格</th>
                      <th className="text-left p-2">可用库存</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.length > 0 ? (
                      portfolio.map((item: PortfolioItem) => (
                        <tr key={item.holding_id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{item.product_name}</td>
                          <td className="p-2">{item.product_code || "-"}</td>
                          <td className="p-2">{item.product_type}</td>
                          <td className="p-2">¥{item.buy_price.toFixed(2)}</td>
                          <td className="p-2">{item.buy_amount}</td>
                          <td className="p-2">¥{item.current_price.toFixed(2)}</td>
                          <td className="p-2">{item.available_amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-gray-500">
                          暂无投资组合数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
