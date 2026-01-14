'use client';

import { motion } from 'framer-motion';

export function TempleStatsDashboard({ temple }: { temple: any }) {
  const stats = [
    { label: '本月瀏覽', value: '1,234', change: '+12%', icon: '👁️', color: 'from-blue-500 to-blue-600' },
    { label: '本月收款', value: 'NT$ 45,600', change: '+8%', icon: '💰', color: 'from-amber-500 to-amber-600' },
    { label: '服務訂單', value: '23', change: '+5', icon: '🪔', color: 'from-red-500 to-red-600' },
    { label: '活動報名', value: '156', change: '+32', icon: '📅', color: 'from-emerald-500 to-emerald-600' },
  ];

  const recentOrders = [
    { id: 1, type: '光明燈', name: '王大明', amount: 500, date: '今天 14:30', status: 'pending' },
    { id: 2, type: '香油錢', name: '林小華', amount: 1000, date: '今天 12:15', status: 'completed' },
    { id: 3, type: '太歲燈', name: '陳美玲', amount: 800, date: '昨天 18:40', status: 'completed' },
    { id: 4, type: '法會報名', name: '張志明', amount: 500, date: '昨天 10:20', status: 'completed' },
    { id: 5, type: '平安符', name: '黃雅婷', amount: 100, date: '前天 09:15', status: 'completed' },
  ];

  const getOrderIcon = (type: string) => {
    switch(type) {
      case '光明燈': return '🪔';
      case '太歲燈': return '🐲';
      case '香油錢': return '💰';
      case '法會報名': return '📅';
      case '平安符': return '📿';
      default: return '🙏';
    }
  };

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
          {recentOrders.map((order) => (
            <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-lg">
                {getOrderIcon(order.type)}
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