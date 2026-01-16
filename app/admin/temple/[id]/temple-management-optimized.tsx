'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { rootDomain, protocol } from '@/lib/utils';
import { usePrefetchTempleData } from '@/lib/hooks/use-temple-data';
import { useToast } from '@/lib/toast-context';

// Lazy load components to improve initial load performance
import dynamic from 'next/dynamic';

const EventsManagement = dynamic(
  () => import('@/components/events-management').then(mod => ({ default: mod.EventsManagement })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

const StatsDashboard = dynamic(
  () => import('@/components/stats-dashboard').then(mod => ({ default: mod.StatsDashboard })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

const TempleSettingsForm = dynamic(
  () => import('@/components/temple-settings-form').then(mod => ({ default: mod.TempleSettingsForm })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

const PrayerServicesManagementOptimized = dynamic(
  () => import('@/components/prayer-services-management-optimized').then(mod => ({ default: mod.PrayerServicesManagementOptimized })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

const OrdersManagement = dynamic(
  () => import('@/components/orders-management').then(mod => ({ default: mod.OrdersManagement })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

// Loading skeleton component for lazy loaded tabs
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-stone-200 rounded w-full"></div>
          <div className="h-4 bg-stone-200 rounded w-3/4"></div>
          <div className="h-4 bg-stone-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

// Tab configuration
const TABS = [
  { id: 'stats', icon: '📊', label: '數據統計' },
  { id: 'services', icon: '🙏', label: '祈福服務' },
  { id: 'events', icon: '📅', label: '活動管理' },
  { id: 'orders', icon: '📋', label: '訂單管理' },
  { id: 'settings', icon: '⚙️', label: '寺廟設定' }
] as const;

type TabId = typeof TABS[number]['id'];

export function TempleManagementOptimized({ temple }: Readonly<{ temple: any }>) {
  const [activeTab, setActiveTab] = useState<TabId>('stats');
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set(['stats']));
  const { success, error: showError } = useToast();
  const { prefetchAll } = usePrefetchTempleData(temple.id);

  const templeEmoji = '🏛️';

  // Prefetch data for all tabs on component mount
  useEffect(() => {
    // Prefetch all data in the background
    prefetchAll().catch(console.error);
  }, [temple.id]);

  // Track visited tabs to maintain their state
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setVisitedTabs(prev => new Set([...prev, tabId]));
  };

  // Render tab content based on active tab
  // Only render if tab has been visited (to maintain component state)
  const renderTabContent = () => {
    return (
      <>
        {/* Keep all visited tabs mounted but hidden to preserve state */}
        <div style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
          {visitedTabs.has('stats') && <StatsDashboard templeId={temple.id} />}
        </div>

        <div style={{ display: activeTab === 'services' ? 'block' : 'none' }}>
          {visitedTabs.has('services') && (
            <PrayerServicesManagementOptimized templeId={temple.id} />
          )}
        </div>

        <div style={{ display: activeTab === 'events' ? 'block' : 'none' }}>
          {visitedTabs.has('events') && (
            <EventsManagement templeId={temple.id} />
          )}
        </div>

        <div style={{ display: activeTab === 'orders' ? 'block' : 'none' }}>
          {visitedTabs.has('orders') && (
            <OrdersManagement templeId={temple.id} />
          )}
        </div>

        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          {visitedTabs.has('settings') && (
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
      </>
    );
  };

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

          {/* Tabs with optimized rendering */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
        {renderTabContent()}
      </div>
    </div>
  );
}