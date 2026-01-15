'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { rootDomain, protocol } from '@/lib/utils';
import { EventsManagement } from '@/components/events-management';
import { StatsDashboard } from '@/components/stats-dashboard';
import { TempleSettingsForm } from '@/components/temple-settings-form';
import { PrayerServicesManagement } from '@/components/prayer-services-management';
import { OrdersManagement } from '@/components/orders-management';
import { useToast } from '@/lib/toast-context';

export function TempleManagement({ temple }: Readonly<{ temple: any }>) {
  const [activeTab, setActiveTab] = useState('stats');
  const { success, error: showError } = useToast();

  const templeEmoji = '🏛️';

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Back Button + Temple Name */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                {temple.logo_url ? (
                  <img
                    src={temple.logo_url}
                    alt={temple.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-xl">
                    {templeEmoji}
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-stone-800">{temple.name}</h1>
                  <p className="text-xs text-stone-500">{temple.slug}.{rootDomain}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`${protocol}://${temple.slug}.${rootDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-stone-100 to-stone-50 text-stone-700 hover:from-stone-200 hover:to-stone-100 transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <Eye className="w-4 h-4" />
                查看網站
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {[
              { id: 'stats', icon: '📊', label: '數據統計' },
              { id: 'services', icon: '🙏', label: '祈福服務' },
              { id: 'events', icon: '📅', label: '活動管理' },
              { id: 'orders', icon: '📋', label: '訂單管理' },
              { id: 'settings', icon: '⚙️', label: '寺廟設定' }
            ].map((tab) => (
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Tab */}
        {activeTab === 'stats' && <StatsDashboard templeId={temple.id} />}

        {/* Prayer Services Tab */}
        {activeTab === 'services' && (
          <PrayerServicesManagement templeId={temple.id} />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <EventsManagement templeId={temple.id} />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrdersManagement templeId={temple.id} />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <TempleSettingsForm
            temple={temple}
            onSave={async (data) => {
              try {
                const response = await fetch(`/api/temples/${temple.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                });

                const result = await response.json();

                if (result.success) {
                  success('儲存成功');
                } else {
                  throw new Error(result.error || '儲存失敗');
                }
              } catch (error) {
                console.error('Error saving temple settings:', error);
                showError(error instanceof Error ? error.message : '儲存失敗，請稍後再試');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}