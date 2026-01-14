'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, DollarSign, Package, Users, Eye } from 'lucide-react';

// Mock data for donations and services
const MOCK_DONATIONS = [
  {
    id: '1',
    type: 'donation',
    name: '線上香油錢',
    description: '隨喜捐獻，護持道場',
    icon: '💰',
    status: 'active',
    totalAmount: 156800,
    donorCount: 234,
    lastMonth: 45600
  },
  {
    id: '2',
    type: 'donation',
    name: '建廟基金',
    description: '支持寺廟建設與修繕',
    icon: '🏗️',
    status: 'active',
    totalAmount: 890000,
    donorCount: 89,
    lastMonth: 120000
  }
];

const MOCK_SERVICES = [
  {
    id: '3',
    type: 'service',
    name: '光明燈登記',
    description: '為家人祈福點燈',
    icon: '🪔',
    price: 500,
    period: '年',
    status: 'active',
    currentCount: 156,
    maxCount: 200
  },
  {
    id: '4',
    type: 'service',
    name: '太歲安奉',
    description: '安太歲，保平安',
    icon: '🐲',
    price: 800,
    period: '年',
    status: 'active',
    currentCount: 89,
    maxCount: 100
  },
  {
    id: '5',
    type: 'service',
    name: '文昌燈',
    description: '學業進步，考運亨通',
    icon: '📚',
    price: 600,
    period: '年',
    status: 'inactive',
    currentCount: 45,
    maxCount: 100
  }
];

export function PrayerServicesManagement({ templeId }: { templeId: string }) {
  const [activeView, setActiveView] = useState<'donations' | 'services'>('donations');
  const [donations] = useState(MOCK_DONATIONS);
  const [services] = useState(MOCK_SERVICES);

  const stats = {
    donations: {
      total: donations.reduce((acc, d) => acc + d.totalAmount, 0),
      lastMonth: donations.reduce((acc, d) => acc + d.lastMonth, 0),
      donors: donations.reduce((acc, d) => acc + d.donorCount, 0)
    },
    services: {
      active: services.filter(s => s.status === 'active').length,
      total: services.length,
      occupied: services.reduce((acc, s) => acc + s.currentCount, 0),
      capacity: services.reduce((acc, s) => acc + s.maxCount, 0)
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle View */}
      <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-stone-200">
        <button
          onClick={() => setActiveView('donations')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeView === 'donations'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <span className="mr-2">💰</span>
          捐款項目
        </button>
        <button
          onClick={() => setActiveView('services')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeView === 'services'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <span className="mr-2">🪔</span>
          服務項目
        </button>
      </div>

      {/* Stats Cards */}
      {activeView === 'donations' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">總捐款金額</p>
                <p className="text-2xl font-bold text-stone-900">
                  NT$ {stats.donations.total.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">本月捐款</p>
                <p className="text-2xl font-bold text-stone-900">
                  NT$ {stats.donations.lastMonth.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">捐款人數</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.donations.donors}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">啟用項目</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.services.active}/{stats.services.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">已登記數量</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.services.occupied}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">總容量</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.services.capacity}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  使用率 {Math.round((stats.services.occupied / stats.services.capacity) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Donations List */}
      {activeView === 'donations' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-stone-100"
        >
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-stone-800">捐款項目管理</h3>
              <p className="text-sm text-stone-500 mt-1">管理線上捐款項目</p>
            </div>
            <button className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              新增項目
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {donations.map((donation) => (
              <div key={donation.id} className="p-6 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl shadow-sm">
                    {donation.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-stone-800">{donation.name}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        donation.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {donation.status === 'active' ? '啟用' : '停用'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mb-2">{donation.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-stone-500">
                        總額: <span className="font-medium text-stone-700">NT$ {donation.totalAmount.toLocaleString()}</span>
                      </span>
                      <span className="text-stone-500">
                        捐款人數: <span className="font-medium text-stone-700">{donation.donorCount}</span>
                      </span>
                      <span className="text-stone-500">
                        本月: <span className="font-medium text-stone-700">NT$ {donation.lastMonth.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Services List */}
      {activeView === 'services' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-stone-100"
        >
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-stone-800">服務項目管理</h3>
              <p className="text-sm text-stone-500 mt-1">管理點燈、安太歲等服務</p>
            </div>
            <button className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              新增服務
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {services.map((service) => (
              <div key={service.id} className="p-6 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl shadow-sm">
                    {service.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-stone-800">{service.name}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        service.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {service.status === 'active' ? '啟用' : '停用'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mb-2">{service.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-stone-500">
                        價格: <span className="font-medium text-stone-700">NT$ {service.price}/{service.period}</span>
                      </span>
                      <span className="text-stone-500">
                        已登記: <span className="font-medium text-stone-700">{service.currentCount}/{service.maxCount}</span>
                      </span>
                      <span className="text-stone-500">
                        使用率: <span className="font-medium text-stone-700">{Math.round((service.currentCount / service.maxCount) * 100)}%</span>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-stone-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          service.currentCount / service.maxCount > 0.8
                            ? 'bg-red-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(service.currentCount / service.maxCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}