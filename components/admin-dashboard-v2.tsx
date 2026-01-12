'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { BRAND, COLORS } from '@/lib/constants';
import { deleteTempleAction } from '@/app/actions';
import { protocol, rootDomain } from '@/lib/utils';
import { useActionState } from 'react';
import { CreateTempleModal } from './create-temple-modal';

// =============================================
// Types
// =============================================
type Temple = {
  id: string;
  name: string;
  slug: string;
  intro?: string | null;
  address?: string | null;
  phone?: string | null;
  created_at: string;
};

type View = 'dashboard' | 'temple';
type TabType = 'stats' | 'services' | 'events' | 'orders' | 'settings';

// =============================================
// Main Admin Component
// =============================================
export function AdminDashboardV2({
  tenants,
  userName = '使用者'
}: {
  tenants: Temple[];
  userName?: string;
}) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const router = useRouter();

  const handleSelectTemple = (temple: Temple) => {
    setSelectedTemple(temple);
    setCurrentView('temple');
    setActiveTab('stats');
  };

  const handleBack = () => {
    setSelectedTemple(null);
    setCurrentView('dashboard');
    setActiveTab('stats');
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="flex items-center gap-2 hover:opacity-80">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-lg shadow-md">
                  🏮
                </div>
                <span className="font-bold text-stone-800 hidden sm:block">{BRAND.name}</span>
              </button>

              {selectedTemple && (
                <>
                  <span className="text-stone-300">/</span>
                  <span className="text-stone-600">{selectedTemple.name}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {selectedTemple && (
                <a
                  href={`${protocol}://${selectedTemple.slug}.${rootDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-stone-500 hover:text-red-600 text-sm border border-stone-200 rounded-lg hover:border-red-200"
                >
                  <span>🔗</span>
                  <span>查看公開頁面</span>
                </a>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {currentView === 'dashboard' && (
        <Dashboard
          tenants={tenants}
          userName={userName}
          onSelectTemple={handleSelectTemple}
        />
      )}
      {currentView === 'temple' && selectedTemple && (
        <TempleAdmin
          temple={selectedTemple}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

// =============================================
// DASHBOARD Component
// =============================================
function Dashboard({
  tenants,
  userName,
  onSelectTemple
}: {
  tenants: Temple[];
  userName: string;
  onSelectTemple: (temple: Temple) => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteState, deleteAction, isDeleting] = useActionState<any, FormData>(
    deleteTempleAction,
    {}
  );

  // Generate deterministic mock data based on temple ID
  const generateMockData = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const positive = Math.abs(hash);
    return {
      views: 500 + (positive % 2000),
      donations: 10000 + (positive % 50000),
      orders: 2 + (positive % 10)
    };
  };

  // Add mock data to temples
  const templesWithMockData = tenants.map((temple, index) => {
    const mockData = generateMockData(temple.id);
    return {
      ...temple,
      status: 'published' as const,
      views: mockData.views,
      donations: mockData.donations,
      orders: mockData.orders,
      avatar: ['🏛️', '🛕', '⛩️', '🏯', '🕍'][index % 5],
    };
  });

  // Calculate total stats from temples
  const totalStats = {
    temples: tenants.length,
    views: templesWithMockData.reduce((sum, t) => sum + t.views, 0),
    donations: templesWithMockData.reduce((sum, t) => sum + t.donations, 0),
    orders: templesWithMockData.reduce((sum, t) => sum + t.orders, 0),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800">歡迎回來，{userName} 👋</h1>
        <p className="text-stone-500 mt-1">管理您的寺廟</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        {[
          { label: '寺廟總數', value: totalStats.temples.toString(), icon: '🏛️', color: 'from-red-500 to-red-600' },
          { label: '本月瀏覽', value: totalStats.views.toLocaleString(), icon: '👁️', color: 'from-blue-500 to-blue-600' },
          { label: '本月收款', value: `NT$ ${totalStats.donations.toLocaleString()}`, icon: '💰', color: 'from-amber-500 to-amber-600' },
          { label: '待處理訂單', value: totalStats.orders.toString(), icon: '📋', color: 'from-emerald-500 to-emerald-600' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-stone-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-500 text-xs lg:text-sm mb-1">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-stone-800">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg lg:text-xl shadow-md`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Temple List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
      >
        <div className="p-4 lg:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-stone-800">我的寺廟</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <span>+</span>
            <span>新增寺廟</span>
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {templesWithMockData.map((temple) => (
            <div
              key={temple.id}
              onClick={() => onSelectTemple(temple)}
              className="p-4 lg:p-6 hover:bg-stone-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl lg:text-3xl shadow-lg group-hover:scale-105 transition-transform">
                  {temple.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-stone-800 text-lg">{temple.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      已發布
                    </span>
                  </div>
                  <p className="text-stone-500 text-sm">{temple.intro || '主祀玉皇大帝'}</p>
                  <p className="text-stone-400 text-xs mt-1">{temple.slug}.{rootDomain}</p>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-stone-400">瀏覽</p>
                    <p className="font-bold text-stone-700">{temple.views.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-stone-400">收款</p>
                    <p className="font-bold text-emerald-600">NT$ {temple.donations.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-stone-400">待處理</p>
                    <p className={`font-bold ${temple.orders > 0 ? 'text-amber-600' : 'text-stone-400'}`}>{temple.orders}</p>
                  </div>
                </div>
                <div className="text-stone-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all">→</div>
              </div>
            </div>
          ))}
        </div>

        {tenants.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">🏛️</div>
            <p className="text-stone-500 mb-4">您還沒有建立任何寺廟</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white font-medium shadow-md"
            >
              建立第一個寺廟
            </button>
          </div>
        )}
      </motion.div>

      {/* Create Temple Modal */}
      {showCreateModal && (
        <CreateTempleModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Error/Success Messages */}
      {deleteState.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md"
        >
          {deleteState.error}
        </motion.div>
      )}
    </div>
  );
}

// =============================================
// TEMPLE ADMIN Component
// =============================================
function TempleAdmin({
  temple,
  activeTab,
  setActiveTab
}: {
  temple: Temple;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) {
  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'stats', icon: '📊', label: '數據總覽' },
    { id: 'services', icon: '🪔', label: '服務項目' },
    { id: 'events', icon: '📅', label: '活動管理' },
    { id: 'orders', icon: '📋', label: '訂單記錄' },
    { id: 'settings', icon: '⚙️', label: '寺廟設定' },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 sticky top-14 lg:top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-700'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {activeTab === 'stats' && <StatsTab temple={temple} />}
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'settings' && <SettingsTab temple={temple} />}
      </div>
    </div>
  );
}

// =============================================
// Tab Components (Simplified versions)
// =============================================

function StatsTab({ temple }: { temple: Temple }) {
  const stats = [
    { label: '本月瀏覽', value: '1,234', change: '+12%', icon: '👁️', color: 'from-blue-500 to-blue-600' },
    { label: '本月收款', value: 'NT$ 45,600', change: '+8%', icon: '💰', color: 'from-amber-500 to-amber-600' },
    { label: '服務訂單', value: '23', change: '+5', icon: '🪔', color: 'from-red-500 to-red-600' },
    { label: '活動報名', value: '156', change: '+32', icon: '📅', color: 'from-emerald-500 to-emerald-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-stone-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg lg:text-xl shadow-md`}>
                {stat.icon}
              </div>
              <span className="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-stone-800">{stat.value}</p>
            <p className="text-stone-500 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-800">近期訂單</h3>
          <button className="text-red-600 text-sm font-medium hover:underline">查看全部 →</button>
        </div>
        <div className="divide-y divide-stone-100">
          {[
            { id: 1, type: '光明燈', name: '王大明', amount: 500, date: '今天 14:30', status: 'pending' },
            { id: 2, type: '香油錢', name: '林小華', amount: 1000, date: '今天 12:15', status: 'completed' },
            { id: 3, type: '太歲燈', name: '陳美玲', amount: 800, date: '昨天 18:40', status: 'completed' },
            { id: 4, type: '法會報名', name: '張志明', amount: 500, date: '昨天 10:20', status: 'completed' },
            { id: 5, type: '平安符', name: '黃雅婷', amount: 100, date: '前天 09:15', status: 'completed' },
          ].map((order) => (
            <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-lg">
                {order.type === '光明燈' ? '🪔' :
                 order.type === '太歲燈' ? '🐲' :
                 order.type === '香油錢' ? '💰' :
                 order.type === '法會報名' ? '📅' :
                 order.type === '平安符' ? '📿' : '🙏'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800">{order.type}</p>
                <p className="text-stone-500 text-sm">{order.name} · {order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-stone-800">NT$ {order.amount}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {order.status === 'pending' ? '待處理' : '已完成'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ServicesTab() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">🪔</div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">服務項目管理</h3>
      <p className="text-stone-500">即將推出</p>
    </div>
  );
}

function EventsTab() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📅</div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">活動管理</h3>
      <p className="text-stone-500">即將推出</p>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📋</div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">訂單記錄</h3>
      <p className="text-stone-500">即將推出</p>
    </div>
  );
}

function SettingsTab({ temple }: { temple: Temple }) {
  const { TempleSettingsForm } = require('./temple-settings-form');

  const handleSave = async (data: Partial<Temple>) => {
    // TODO: Implement save functionality
    console.log('Saving temple settings:', data);
    // This would typically make an API call to save the data
  };

  return <TempleSettingsForm temple={temple} onSave={handleSave} />;
}