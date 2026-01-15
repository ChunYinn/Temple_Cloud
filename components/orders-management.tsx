'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';

interface Order {
  id: string;
  order_number: string;
  type: 'service' | 'event';
  service_name?: string;
  event_name?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  quantity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  todayOrders: number;
  weekGrowth: number;
  monthGrowth: number;
}

// Helper component for loading state
const LoadingState = () => (
  <div className="text-center py-12">
    <div className="inline-flex items-center gap-2 text-stone-500">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-stone-300 border-t-stone-600"></div>
      載入中...
    </div>
  </div>
);

// Helper component for empty state
const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
  <div className="text-center py-12">
    <div className="inline-flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <Package className="w-10 h-10 text-stone-400" />
      </div>
      <h3 className="text-lg font-medium text-stone-700 mb-1">
        {hasFilters ? '沒有符合條件的訂單' : '尚無訂單記錄'}
      </h3>
      <p className="text-sm text-stone-500 max-w-sm">
        {hasFilters
          ? '請嘗試調整搜尋條件'
          : '當有客戶下訂單時，訂單資訊將顯示在這裡'}
      </p>
    </div>
  </div>
);

// Helper component for growth badge
const GrowthBadge = ({ growth }: { growth: number }) => {
  const isPositive = growth > 0;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      isPositive ? 'bg-green-50 text-green-600' : 'bg-stone-50 text-stone-600'
    }`}>
      {isPositive ? '+' : ''}{growth}%
    </span>
  );
};

export function OrdersManagement({ templeId }: Readonly<{ templeId: string }>) {
  const [activeTab, setActiveTab] = useState<'all' | 'service' | 'event'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const { success, error: showError } = useToast();

  // Fetch orders data
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [templeId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/temples/${templeId}/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
        // Set stats from the same API response
        if (data.stats) {
          setStats({
            totalOrders: data.stats.totalOrders || 0,
            totalRevenue: data.stats.totalRevenue || 0,
            pendingOrders: data.stats.pendingOrders || 0,
            completedOrders: data.stats.totalOrders - data.stats.pendingOrders || 0,
            averageOrderValue: data.stats.avgOrderValue || 0,
            todayOrders: 0,
            weekGrowth: 0,
            monthGrowth: 0
          });
        }
      } else {
        setOrders([]);
        setFilteredOrders([]);
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          averageOrderValue: 0,
          todayOrders: 0,
          weekGrowth: 0,
          monthGrowth: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // For now, use mock data
      setOrders([]);
      setFilteredOrders([]);
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        todayOrders: 0,
        weekGrowth: 0,
        monthGrowth: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Stats are now fetched with orders in the same API call
  };

  // Helper functions for filtering
  const filterByTab = (orderList: Order[], tab: string): Order[] => {
    if (tab === 'all') return orderList;
    return orderList.filter(order => order.type === tab);
  };

  const filterBySearch = (orderList: Order[], search: string): Order[] => {
    if (!search) return orderList;
    const searchLower = search.toLowerCase();
    return orderList.filter(order =>
      order.order_number.toLowerCase().includes(searchLower) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_email.toLowerCase().includes(searchLower)
    );
  };

  const filterByStatus = (orderList: Order[], status: string): Order[] => {
    if (status === 'all') return orderList;
    return orderList.filter(order => order.status === status);
  };

  const getDateFilterValue = (filter: string): Date => {
    const filterDate = new Date();

    switch (filter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(filterDate.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(filterDate.getMonth() - 1);
        break;
    }

    return filterDate;
  };

  const filterByDate = (orderList: Order[], filter: string): Order[] => {
    if (filter === 'all') return orderList;
    const filterDate = getDateFilterValue(filter);
    return orderList.filter(order => new Date(order.created_at) >= filterDate);
  };

  // Filter orders based on tab and search
  useEffect(() => {
    let filtered = [...orders];

    filtered = filterByTab(filtered, activeTab);
    filtered = filterBySearch(filtered, searchTerm);
    filtered = filterByStatus(filtered, statusFilter);
    filtered = filterByDate(filtered, dateFilter);

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, activeTab, searchTerm, statusFilter, dateFilter]);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/temples/${templeId}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        success('訂單狀態更新成功');
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      showError('更新失敗');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-stone-600 bg-stone-50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-amber-600';
      case 'refunded': return 'text-red-600';
      default: return 'text-stone-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch(status) {
      case 'paid': return '已付款';
      case 'pending': return '待付款';
      case 'refunded': return '已退款';
      default: return '待付款';
    }
  };

  // Count orders by type
  const serviceOrdersCount = orders.filter(o => o.type === 'service').length;
  const eventOrdersCount = orders.filter(o => o.type === 'event').length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 mb-4">訂單管理</h2>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-stone-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-blue-500" />
                <GrowthBadge growth={stats.weekGrowth} />
              </div>
              <p className="text-2xl font-bold text-stone-800">{stats.totalOrders}</p>
              <p className="text-sm text-stone-500">總訂單數</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-stone-100"
            >
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <GrowthBadge growth={stats.monthGrowth} />
              </div>
              <p className="text-2xl font-bold text-stone-800">
                NT$ {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-stone-500">總收入</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-stone-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-stone-800">{stats.pendingOrders}</p>
              <p className="text-sm text-stone-500">待處理</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-stone-100"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-stone-800">
                NT$ {Math.round(stats.averageOrderValue)}
              </p>
              <p className="text-sm text-stone-500">平均訂單金額</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
        {/* Tabs */}
        <div className="border-b border-stone-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              全部訂單 {orders.length > 0 && `(${orders.length})`}
            </button>
            {serviceOrdersCount > 0 && (
              <button
                onClick={() => setActiveTab('service')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'service'
                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                祈福服務 ({serviceOrdersCount})
              </button>
            )}
            {eventOrdersCount > 0 && (
              <button
                onClick={() => setActiveTab('event')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'event'
                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                活動報名 ({eventOrdersCount})
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="搜尋訂單編號、客戶姓名、Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-1 focus:ring-red-100 outline-none text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-1 focus:ring-red-100 outline-none text-sm"
            >
              <option value="all">所有狀態</option>
              <option value="pending">待確認</option>
              <option value="confirmed">已確認</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-1 focus:ring-red-100 outline-none text-sm"
            >
              <option value="all">所有時間</option>
              <option value="today">今天</option>
              <option value="week">過去 7 天</option>
              <option value="month">過去 30 天</option>
            </select>

            {/* Export Button */}
            <button className="px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm font-medium text-stone-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              匯出
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4">
          {loading ? (
            <LoadingState />
          ) : filteredOrders.length === 0 ? (
            <EmptyState hasFilters={searchTerm !== '' || statusFilter !== 'all' || dateFilter !== 'all'} />
          ) : (
            <>
              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">訂單編號</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">類型</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">客戶</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">項目</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">金額</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">狀態</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">付款</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">日期</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-stone-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-3 px-3">
                          <span className="font-medium text-stone-800">#{order.order_number}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.type === 'service' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {order.type === 'service' ? '🪔 祈福' : '📅 活動'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium text-stone-800 text-sm">{order.customer_name}</p>
                            <p className="text-xs text-stone-500">{order.customer_phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-sm text-stone-700">
                            {order.service_name || order.event_name}
                          </p>
                          {order.quantity > 1 && (
                            <span className="text-xs text-stone-500">x{order.quantity}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-stone-800">
                            NT$ {order.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">待確認</option>
                            <option value="confirmed">已確認</option>
                            <option value="completed">已完成</option>
                            <option value="cancelled">已取消</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                            {getPaymentStatusText(order.payment_status)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-sm text-stone-600">
                            {new Date(order.created_at).toLocaleDateString('zh-TW')}
                          </p>
                          <p className="text-xs text-stone-400">
                            {new Date(order.created_at).toLocaleTimeString('zh-TW', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-stone-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-stone-600">
                    顯示 {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} 筆，
                    共 {filteredOrders.length} 筆訂單
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...new Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          currentPage === i + 1
                            ? 'bg-red-600 text-white'
                            : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal content here */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-4">
                  訂單詳情 #{selectedOrder.order_number}
                </h3>
                {/* Add detailed order view here */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="mt-4 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200"
                >
                  關閉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}