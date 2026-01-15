'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { Trash2, Loader2, Plus, ExternalLink } from 'lucide-react';
import { deleteTempleAction, createTempleAction } from '@/app/actions';
import { rootDomain, protocol } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Temple = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type DeleteState = {
  error?: string;
  success?: string;
};

// Mock data for dashboard stats
const mockStats = {
  temples: 3,
  monthlyViews: 2126,
  monthlyRevenue: 69000,
  pending: 12
};

// Temple emojis for visual representation
const templeEmojis = ['🏛️', '🛕', '⛩️', '🕌', '⛪'];

export function AdminDashboard({ tenants }: { tenants: Temple[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [state, action, isPending] = useActionState<DeleteState, FormData>(
    deleteTempleAction,
    {}
  );
  const [createState, createAction, isCreating] = useActionState<DeleteState, FormData>(
    createTempleAction,
    {}
  );

  // Add mock view/donation data to temples
  const temples = tenants.map((temple, index) => ({
    ...temple,
    image: templeEmojis[index % templeEmojis.length],
    views: Math.floor(Math.random() * 2000),
    donations: Math.floor(Math.random() * 50000),
    status: 'active' as const
  }));

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800">
            歡迎回來 👋
          </h1>
          <p className="text-stone-500 text-sm sm:text-base mt-0.5 sm:mt-1">管理您的寺廟頁面</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          {[
            {
              id: 'temple-count',
              label: '寺廟數量',
              value: temples.length.toString(),
              icon: '🏛️',
              color: 'bg-gradient-to-br from-red-500 to-red-600'
            },
            {
              id: 'monthly-views',
              label: '本月瀏覽',
              value: mockStats.monthlyViews.toLocaleString(),
              icon: '👁️',
              color: 'bg-gradient-to-br from-blue-500 to-blue-600'
            },
            {
              id: 'monthly-revenue',
              label: '本月收款',
              value: `NT$ ${mockStats.monthlyRevenue.toLocaleString()}`,
              icon: '💰',
              color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            },
            {
              id: 'pending-tasks',
              label: '待處理',
              value: mockStats.pending.toString(),
              icon: '📋',
              color: 'bg-gradient-to-br from-amber-500 to-amber-600'
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-md border border-stone-200 transition-all hover:-translate-y-0.5"
            >
              <div className="flex flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-stone-500 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{stat.label}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-stone-800 break-all">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.color} flex items-center justify-center text-lg flex-shrink-0`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Temple List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
        >
          <div className="p-4 sm:p-5 lg:p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-stone-800">我的寺廟</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:scale-105"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">新增寺廟</span>
              <span className="sm:hidden">新增</span>
            </button>
          </div>

          {temples.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl">🏛️</span>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-stone-800 mb-1 sm:mb-2">還沒有寺廟</h3>
              <p className="text-sm sm:text-base text-stone-500 mb-4 sm:mb-6">建立您的第一個寺廟頁面吧！</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-medium"
              >
                + 建立寺廟
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {temples.map((temple) => (
                <motion.div
                  key={temple.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 sm:p-5 lg:p-6 hover:bg-stone-50 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Mobile Layout: Top Section */}
                    <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                      {/* Temple Icon */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                        {temple.image}
                      </div>

                      {/* Temple Info - Clickable */}
                      <a
                        href={`${protocol}://${temple.slug}.${rootDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0 group/link"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <h3 className="font-bold text-stone-800 text-base sm:text-lg group-hover/link:text-amber-600 transition-colors">{temple.name}</h3>
                            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400 group-hover/link:text-amber-600 transition-colors" />
                          </div>
                          <span className="px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-700 self-start sm:self-auto">
                            已發布
                          </span>
                        </div>
                        <p className="text-stone-500 text-xs sm:text-sm mt-0.5 group-hover/link:text-amber-600 transition-colors break-all">{temple.slug}.{rootDomain}</p>
                      </a>
                    </div>

                    {/* Stats - Show on mobile as row, desktop as before */}
                    <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 ml-0 sm:ml-auto pl-15 sm:pl-0">
                      <div className="text-center sm:text-center">
                        <p className="text-[10px] sm:text-xs text-stone-400">瀏覽</p>
                        <p className="text-sm sm:text-base font-bold text-stone-700">{temple.views.toLocaleString()}</p>
                      </div>
                      <div className="text-center sm:text-center">
                        <p className="text-[10px] sm:text-xs text-stone-400">收款</p>
                        <p className="text-sm sm:text-base font-bold text-emerald-600">NT$ {temple.donations.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 ml-auto sm:ml-0">
                      <Link
                        href={`/admin/temple/${temple.id}`}
                        className="p-2 rounded-lg hover:bg-amber-100 text-stone-500 hover:text-amber-600 transition-colors"
                        title="編輯寺廟"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>

                      <form action={action}>
                        <input type="hidden" name="templeId" value={temple.id} />
                        <button
                          type="submit"
                          disabled={isPending}
                          className="p-2 rounded-lg hover:bg-red-100 text-stone-500 hover:text-red-600 transition-colors"
                          title="刪除寺廟"
                        >
                          {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Temple Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>建立新寺廟</DialogTitle>
              <DialogDescription>
                為您的寺廟建立專屬頁面
              </DialogDescription>
            </DialogHeader>

            <form action={createAction} className="space-y-4">
              <div>
                <Label htmlFor="temple-name">寺廟名稱</Label>
                <Input
                  id="temple-name"
                  name="name"
                  type="text"
                  placeholder="例：天壇宮"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subdomain">網址名稱</Label>
                <div className="flex mt-1">
                  <Input
                    id="subdomain"
                    name="slug"
                    type="text"
                    placeholder="tiantan"
                    className="rounded-r-none"
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-stone-300 bg-stone-100 text-stone-500 text-sm">
                    .{rootDomain}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">僅可使用小寫英文字母、數字和連字符</p>
              </div>

              <div>
                <Label htmlFor="intro">寺廟簡介（選填）</Label>
                <Textarea
                  id="intro"
                  name="intro"
                  placeholder="簡短介紹您的寺廟，將顯示在公開頁面"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">地址（選填）</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="台北市中正區..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">電話（選填）</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="02-1234-5678"
                    className="mt-1"
                  />
                </div>
              </div>

              {createState.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {createState.error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      建立中...
                    </>
                  ) : (
                    '建立寺廟'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Notifications */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md"
          >
            {state.error}
          </motion.div>
        )}

        {state.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md"
          >
            {state.success}
          </motion.div>
        )}
      </div>
    </div>
  );
}