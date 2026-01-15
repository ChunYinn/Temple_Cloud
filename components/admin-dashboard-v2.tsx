'use client';

import { useState, useActionState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { BRAND } from '@/lib/constants';
import { deleteTempleAction } from '@/app/actions';
import { protocol, rootDomain } from '@/lib/utils';
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


// =============================================
// Main Admin Component
// =============================================
export function AdminDashboardV2({
  tenants,
  userName = '使用者'
}: Readonly<{
  tenants: Temple[];
  userName?: string;
}>) {
  const router = useRouter();

  const handleSelectTemple = (temple: Temple) => {
    // Navigate to the temple management page
    router.push(`/admin/temple/${temple.id}`);
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/')} className="flex items-center gap-2 hover:opacity-80">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-lg shadow-md">
                  🏮
                </div>
                <span className="font-bold text-stone-800 hidden sm:block">{BRAND.name}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
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

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <TenantsSection
          tenants={tenants}
          onSelectTemple={handleSelectTemple}
        />
      </main>
    </div>
  );
}

// =============================================
// Tenants Section Component
// =============================================
function TenantsSection({
  tenants,
  onSelectTemple
}: Readonly<{
  tenants: Temple[];
  onSelectTemple: (temple: Temple) => void;
}>) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteState, deleteAction, isPending] = useActionState(deleteTempleAction as any, {} as { error?: string; success?: string });

  return (
    <div>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 lg:mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-stone-800">管理中的寺廟</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 lg:px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>新增寺廟</span>
          </button>
        </div>
        <p className="text-stone-500">選擇要管理的寺廟，查看數據、管理內容與設定</p>
      </motion.div>

      {/* Temples Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {tenants.map((temple, i) => (
          <TempleCard
            key={temple.id}
            temple={temple}
            index={i}
            onSelect={onSelectTemple}
            onDelete={deleteAction}
            isPending={isPending}
          />
        ))}

        {/* Empty state for adding new temple */}
        {tenants.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full"
          >
            <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏛️</span>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">開始建立您的第一個寺廟</h3>
              <p className="text-stone-500 mb-6 max-w-sm mx-auto">
                建立寺廟頁面，開始接受香油錢與活動報名
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
              >
                新增寺廟
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Temple Modal */}
      {showCreateModal && (
        <CreateTempleModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Delete Error Message */}
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
// Temple Card Component
// =============================================
function TempleCard({
  temple,
  index,
  onSelect,
  onDelete,
  isPending
}: Readonly<{
  temple: Temple;
  index: number;
  onSelect: (temple: Temple) => void;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div
        className="relative p-5 lg:p-6 cursor-pointer"
        onClick={() => onSelect(temple)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(temple);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`選擇管理 ${temple.name}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
            🏛️
          </div>
          <div className="flex gap-1">
            {/* View button */}
            <a
              href={`${protocol}://${temple.slug}.${rootDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              title="查看公開頁面"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Delete button */}
            <form
              action={async (formData) => {
                if (confirm(`確定要刪除「${temple.name}」嗎？此操作無法復原。`)) {
                  formData.append('templeId', temple.id);
                  onDelete(formData);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="submit"
                disabled={isPending}
                className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="刪除寺廟"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Temple Info */}
        <h3 className="font-bold text-lg text-stone-800 mb-1 group-hover:text-red-700 transition-colors">
          {temple.name}
        </h3>

        <p className="text-sm text-stone-500 mb-3 line-clamp-2">
          {temple.intro || '尚未設定寺廟簡介'}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <span>📍</span>
            {(() => {
              if (!temple.address) return '未設定';
              if (temple.address.length > 10) {
                return temple.address.substring(0, 10) + '...';
              }
              return temple.address;
            })()}
          </span>
          {temple.phone && (
            <span className="flex items-center gap-1">
              <span>📞</span>
              {temple.phone}
            </span>
          )}
        </div>

        {/* URL Preview */}
        <div className="mt-4 p-2 bg-stone-50 rounded-lg">
          <p className="text-xs text-stone-400 truncate">
            {protocol}://{temple.slug}.{rootDomain}
          </p>
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </motion.div>
  );
}