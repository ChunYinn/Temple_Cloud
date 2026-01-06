'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Save, Settings, BarChart3, FileText, Edit2, Trash2, GripVertical, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { rootDomain, protocol } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock block data structure
const mockBlocks = [
  { id: '1', type: 'donation', title: '線上香油錢', subtitle: '隨喜捐獻', icon: '💰', enabled: true },
  { id: '2', type: 'service', title: '光明燈登記', subtitle: '$500/年', icon: '🪔', enabled: true },
  { id: '3', type: 'service', title: '太歲安奉', subtitle: '$800/年', icon: '🐲', enabled: true },
  { id: '4', type: 'event', title: '法會活動', subtitle: '觀音誕辰法會', icon: '📅', enabled: false },
  { id: '5', type: 'link', title: '交通資訊', subtitle: '地址與停車', icon: '📍', enabled: true },
];

const blockTypes = [
  { icon: '🔗', label: '連結', desc: '外部連結', type: 'link' },
  { icon: '💰', label: '香油錢', desc: '線上捐款', type: 'donation' },
  { icon: '🪔', label: '點燈', desc: '光明燈/太歲', type: 'service' },
  { icon: '📅', label: '活動', desc: '法會報名', type: 'event' },
  { icon: '📝', label: '文字', desc: '說明文字', type: 'text' },
  { icon: '🖼️', label: '圖片', desc: '相片輪播', type: 'image' },
];

export function TempleManagement({ temple }: { temple: any }) {
  const [activeTab, setActiveTab] = useState('edit');
  const [blocks, setBlocks] = useState(mockBlocks);

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-xl">
                  {templeEmoji}
                </div>
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
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                預覽
              </a>
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900">
                <Save className="w-4 h-4 mr-2" />
                發布更新
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-0 p-0 h-auto">
              <TabsTrigger value="edit" className="px-4 py-3 border-b-2 rounded-none data-[state=active]:border-amber-500 data-[state=active]:bg-transparent">
                <Edit2 className="w-4 h-4 mr-1.5" />
                頁面編輯
              </TabsTrigger>
              <TabsTrigger value="orders" className="px-4 py-3 border-b-2 rounded-none data-[state=active]:border-amber-500 data-[state=active]:bg-transparent">
                <FileText className="w-4 h-4 mr-1.5" />
                訂單管理
              </TabsTrigger>
              <TabsTrigger value="stats" className="px-4 py-3 border-b-2 rounded-none data-[state=active]:border-amber-500 data-[state=active]:bg-transparent">
                <BarChart3 className="w-4 h-4 mr-1.5" />
                數據統計
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-4 py-3 border-b-2 rounded-none data-[state=active]:border-amber-500 data-[state=active]:bg-transparent">
                <Settings className="w-4 h-4 mr-1.5" />
                寺廟設定
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="edit" className="mt-0">
            <div className="flex gap-8">
              {/* Left: Phone Preview */}
              <div className="hidden lg:block">
                <div className="sticky top-40">
                  <div className="bg-stone-800 rounded-[2.5rem] p-3 shadow-2xl">
                    <div className="bg-gradient-to-b from-red-900 via-red-800 to-stone-900 rounded-[2rem] overflow-hidden w-[280px] h-[560px]">
                      <div className="h-full overflow-y-auto p-4">
                        {/* Temple Info */}
                        <div className="text-center mb-6 pt-6">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <span className="text-3xl">{templeEmoji}</span>
                          </div>
                          <h3 className="text-xl font-bold text-amber-50">{temple.name}</h3>
                          <p className="text-amber-200/60 text-sm">主祀玉皇大帝</p>
                        </div>

                        {/* Blocks List */}
                        <div className="space-y-3">
                          {blocks.filter(b => b.enabled).map((block) => (
                            <div
                              key={block.id}
                              className="bg-stone-800/80 rounded-xl p-4 border border-amber-500/20"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-lg">
                                  {block.icon}
                                </div>
                                <div>
                                  <div className="text-amber-50 font-medium text-sm">{block.title}</div>
                                  <div className="text-amber-200/50 text-xs">{block.subtitle}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Brand */}
                        <div className="mt-8 text-center">
                          <span className="text-amber-200/30 text-xs">🏮 廟務雲</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-stone-400 text-sm mt-3">即時預覽</p>
                </div>
              </div>

              {/* Right: Edit Panel */}
              <div className="flex-1">
                {/* Blocks List */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>頁面區塊</CardTitle>
                    <CardDescription>拖曳調整順序，點擊編輯內容</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-stone-100">
                      {blocks.map((block) => (
                        <motion.div
                          key={block.id}
                          layout
                          className="p-4 hover:bg-stone-50 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            {/* Drag Handle */}
                            <div className="text-stone-300 cursor-move hover:text-stone-400">
                              <GripVertical className="w-5 h-5" />
                            </div>

                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-xl shadow">
                              {block.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="font-medium text-stone-800">{block.title}</div>
                              <div className="text-stone-500 text-sm">{block.subtitle}</div>
                            </div>

                            {/* Toggle */}
                            <Switch
                              checked={block.enabled}
                              onCheckedChange={(checked) => {
                                setBlocks(blocks.map(b =>
                                  b.id === block.id ? { ...b, enabled: checked } : b
                                ));
                              }}
                            />

                            {/* Edit Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <Edit2 className="w-5 h-5" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-stone-400 hover:text-red-600"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Add Block */}
                <Card>
                  <CardHeader>
                    <CardTitle>新增區塊</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {blockTypes.map((item, i) => (
                        <button
                          key={i}
                          className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-stone-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {item.icon}
                          </span>
                          <div className="text-left">
                            <div className="text-stone-700 font-medium">{item.label}</div>
                            <div className="text-stone-400 text-xs">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-stone-800 mb-2">訂單管理</h3>
                <p className="text-stone-500">查看香油錢、點燈服務等訂單記錄</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-stone-800 mb-2">數據統計</h3>
                <p className="text-stone-500">瀏覽量、收款統計、訪客分析</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="text-lg font-medium text-stone-800 mb-2">寺廟設定</h3>
                <p className="text-stone-500">基本資訊、子網域、主題配色</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}