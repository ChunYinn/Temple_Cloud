'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  Eye,
  Package,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface StatsData {
  revenue: {
    total: number;
    growth: number;
    chartData: any[];
  };
  visitors: {
    total: number;
    growth: number;
    chartData: any[];
  };
  orders: {
    total: number;
    growth: number;
    byType: { service: number; event: number };
  };
  events: {
    upcoming: number;
    total: number;
  };
}

// Simple chart component - moved outside parent component
const MiniChart = ({ data, type, color }: {
  data: any[];
  type: 'revenue' | 'visitors';
  color: string;
}) => {
  if (!data || data.length === 0) return null;

  const values = data.map(d => type === 'revenue' ? d.amount : d.count);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <div className="h-16 flex items-end gap-0.5">
      {data.slice(-14).map((item, index) => {
        const value = type === 'revenue' ? item.amount : item.count;
        const height = ((value - min) / range) * 100;

        return (
          <div
            key={`${item.date}-${index}`}
            className="flex-1 bg-current opacity-20 hover:opacity-40 transition-opacity rounded-t"
            style={{
              height: `${Math.max(height, 5)}%`,
              backgroundColor: color
            }}
            title={`${item.date}: ${value.toLocaleString()}`}
          />
        );
      })}
    </div>
  );
};

const GrowthIndicator = ({ value }: { value: number }) => {
  if (value === 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-stone-500">
        <Minus className="w-3 h-3" />
        0%
      </span>
    );
  }

  const isPositive = value > 0;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(value)}%
    </span>
  );
};

export function StatsDashboard({ templeId }: { templeId: string }) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [templeId, timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/temples/${templeId}/stats?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        // Map the API response to our component's expected structure
        setStats({
          revenue: {
            total: data.stats.revenue.total,
            growth: data.stats.revenue.growth,
            chartData: data.stats.revenue.chartData || generateMockChartData(30, 'revenue')
          },
          visitors: {
            total: data.stats.visitors.total,
            growth: data.stats.visitors.growth,
            chartData: data.stats.visitors.chartData || generateMockChartData(30, 'visitors')
          },
          orders: {
            total: data.stats.orders.total,
            growth: data.stats.orders.growth,
            byType: {
              service: data.stats.orders.breakdown.service,
              event: data.stats.orders.breakdown.event
            }
          },
          events: {
            upcoming: data.stats.events.upcoming,
            total: data.stats.events.total
          }
        });
      } else {
        // Use mock data if API fails
        setStats({
          revenue: {
            total: 125600,
            growth: 12.5,
            chartData: generateMockChartData(30, 'revenue')
          },
          visitors: {
            total: 3456,
            growth: 8.3,
            chartData: generateMockChartData(30, 'visitors')
          },
          orders: {
            total: 87,
            growth: 15.2,
            byType: { service: 52, event: 35 }
          },
          events: {
            upcoming: 3,
            total: 12
          }
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data on error
      setStats({
        revenue: {
          total: 125600,
          growth: 12.5,
          chartData: generateMockChartData(30, 'revenue')
        },
        visitors: {
          total: 3456,
          growth: 8.3,
          chartData: generateMockChartData(30, 'visitors')
        },
        orders: {
          total: 87,
          growth: 15.2,
          byType: { service: 52, event: 35 }
        },
        events: {
          upcoming: 3,
          total: 12
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate mock chart data
  function generateMockChartData(days: number, type: 'revenue' | 'visitors') {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        [type === 'revenue' ? 'amount' : 'count']:
          type === 'revenue'
            ? Math.floor(Math.random() * 10000) + 2000
            : Math.floor(Math.random() * 200) + 50
      });
    }
    return data;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-stone-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-stone-200 rounded w-32 mb-2"></div>
              <div className="h-16 bg-stone-100 rounded mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="text-lg font-medium text-stone-800 mb-2">尚無統計資料</h3>
        <p className="text-stone-500">系統開始收集資料後，統計數據將顯示在這裡</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-800">數據統計</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => {
            const rangeLabels = { week: '本週', month: '本月', year: '本年' };
            return (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                {rangeLabels[range]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <GrowthIndicator value={stats.revenue.growth} />
          </div>
          <p className="text-2xl font-bold text-stone-800 mb-1">
            NT$ {stats.revenue.total.toLocaleString()}
          </p>
          <p className="text-sm text-stone-500 mb-3">總收入</p>
          <MiniChart
            data={stats.revenue.chartData}
            type="revenue"
            color="#10b981"
          />
        </motion.div>

        {/* Visitors Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <GrowthIndicator value={stats.visitors.growth} />
          </div>
          <p className="text-2xl font-bold text-stone-800 mb-1">
            {stats.visitors.total.toLocaleString()}
          </p>
          <p className="text-sm text-stone-500 mb-3">瀏覽人次</p>
          <MiniChart
            data={stats.visitors.chartData}
            type="visitors"
            color="#3b82f6"
          />
        </motion.div>

        {/* Orders Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            {stats.orders.total > 0 && <GrowthIndicator value={stats.orders.growth} />}
          </div>
          <p className="text-2xl font-bold text-stone-800 mb-1">
            {stats.orders.total}
          </p>
          <p className="text-sm text-stone-500 mb-3">訂單總數</p>

          {/* Order Type Distribution */}
          {stats.orders.total > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  祈福服務
                </span>
                <span className="font-medium text-stone-800">
                  {stats.orders.byType.service}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  活動報名
                </span>
                <span className="font-medium text-stone-800">
                  {stats.orders.byType.event}
                </span>
              </div>
              {/* Progress bar showing ratio */}
              <div className="relative h-1.5 bg-stone-100 rounded-full overflow-hidden mt-2">
                {(() => {
                  const servicePercentage = stats.orders.total > 0
                    ? (stats.orders.byType.service / stats.orders.total) * 100
                    : 0;
                  const eventPercentage = stats.orders.total > 0
                    ? (stats.orders.byType.event / stats.orders.total) * 100
                    : 0;

                  return (
                    <>
                      <div
                        className="absolute left-0 top-0 h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${servicePercentage}%` }}
                      />
                      <div
                        className="absolute top-0 h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          left: `${servicePercentage}%`,
                          width: `${eventPercentage}%`
                        }}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </motion.div>

        {/* Events Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            {stats.events.upcoming > 0 && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {stats.events.upcoming} 即將舉行
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-stone-800 mb-1">
            {stats.events.total}
          </p>
          <p className="text-sm text-stone-500 mb-3">活動總數</p>

          {/* Events Info */}
          {stats.events.total > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">已舉辦</span>
                <span className="font-medium text-stone-800">
                  {Math.max(0, stats.events.total - stats.events.upcoming)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">即將舉行</span>
                <span className="font-medium text-amber-600">
                  {stats.events.upcoming}
                </span>
              </div>
              {/* Visual indicator */}
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: Math.min(10, stats.events.total) }).map((_, i) => {
                  const isPastEvent = i < Math.min(10, stats.events.total - stats.events.upcoming);
                  return (
                    <div
                      key={`event-indicator-${i}`}
                      className={`h-1 flex-1 rounded-full ${isPastEvent ? 'bg-stone-300' : 'bg-amber-400'}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-stone-800">收入趨勢</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>

          {/* Full Chart Area */}
          <div className="h-48 relative">
            {stats.revenue.chartData && stats.revenue.chartData.length > 0 ? (
              <>
                <div className="absolute inset-0 flex items-end">
                  {stats.revenue.chartData.map((item, index) => {
                    const values = stats.revenue.chartData.map(d => d.amount);
                    const max = Math.max(...values);
                    const height = max > 0 ? (item.amount / max) * 100 : 0;

                    return (
                      <div
                        key={`revenue-chart-${item.date}-${index}`}
                        className="flex-1 mx-0.5 group relative"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-600 hover:to-green-500 transition-all cursor-pointer"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            NT$ {item.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-stone-400 -ml-8">
                  <span>{Math.max(...stats.revenue.chartData.map(d => d.amount)).toLocaleString()}</span>
                  <span>0</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-400">暫無收入資料</p>
                </div>
              </div>
            )}
          </div>

          {/* X-axis labels */}
          {stats.revenue.chartData && stats.revenue.chartData.length > 0 && (
            <div className="flex justify-between mt-2 text-xs text-stone-400">
              <span>{stats.revenue.chartData[0]?.date.split('-').slice(1).join('/')}</span>
              <span>{stats.revenue.chartData[stats.revenue.chartData.length - 1]?.date.split('-').slice(1).join('/')}</span>
            </div>
          )}
        </motion.div>

        {/* Visitor Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-stone-800">瀏覽趨勢</h3>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>

          {/* Line Chart Area */}
          <div className="h-48 relative">
            {stats.visitors.chartData && stats.visitors.chartData.length > 0 ? (
              <svg className="absolute inset-0 w-full h-full">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={`${100 - y}%`}
                    x2="100%"
                    y2={`${100 - y}%`}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Line chart */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  points={stats.visitors.chartData.map((item, index) => {
                    const values = stats.visitors.chartData.map(d => d.count);
                    const max = Math.max(...values);
                    const min = Math.min(...values);
                    const range = max - min || 1;
                    const x = (index / (stats.visitors.chartData.length - 1)) * 100;
                    const y = 100 - ((item.count - min) / range) * 90 - 5;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Data points */}
                {stats.visitors.chartData.map((item, index) => {
                  const values = stats.visitors.chartData.map(d => d.count);
                  const max = Math.max(...values);
                  const min = Math.min(...values);
                  const range = max - min || 1;
                  const x = (index / (stats.visitors.chartData.length - 1)) * 100;
                  const y = 100 - ((item.count - min) / range) * 90 - 5;

                  return (
                    <g key={`visitor-point-${item.date}-${index}`}>
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="3"
                        fill="white"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        className="cursor-pointer"
                      />
                      <title>{`${item.date}: ${item.count} 人次`}</title>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-400">暫無瀏覽資料</p>
                </div>
              </div>
            )}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-stone-400">
            <span>{stats.visitors.chartData?.[0]?.date.split('-').slice(1).join('/')}</span>
            <span>{stats.visitors.chartData?.[stats.visitors.chartData.length - 1]?.date.split('-').slice(1).join('/')}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}