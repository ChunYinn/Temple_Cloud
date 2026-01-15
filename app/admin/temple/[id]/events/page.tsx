'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_EVENTS } from '@/lib/constants';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  Image,
  ChevronDown
} from 'lucide-react';

export default function TempleEventsPage() {
  const params = useParams();
  const templeId = params.id as string;
  const [events] = useState(MOCK_EVENTS);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [, setEditingEvent] = useState<any>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">活動管理</h1>
          <p className="text-stone-500 mt-1">管理寺廟的所有法會活動</p>
        </div>
        <button
          onClick={() => setShowNewEventForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增活動
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">總活動數</p>
              <p className="text-2xl font-bold text-stone-800">{events.length}</p>
            </div>
            <CalendarDays className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">進行中</p>
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.status === 'published').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">總報名人數</p>
              <p className="text-2xl font-bold text-blue-600">
                {events.reduce((sum, e) => sum + (e.currentRegistrations || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">需報名活動</p>
              <p className="text-2xl font-bold text-amber-600">
                {events.filter(e => e.registrationRequired).length}
              </p>
            </div>
            <ChevronDown className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50">
          <h2 className="font-semibold text-stone-800">所有活動</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  活動
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  日期時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  地點
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  報名狀況
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center">
                          <Image className="w-6 h-6 text-stone-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-800">{event.title}</p>
                        <p className="text-sm text-stone-500 truncate max-w-xs">{event.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-stone-800">{event.date}</p>
                      <p className="text-stone-500">{event.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-stone-600">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {event.registrationRequired ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stone-800">
                            {event.currentRegistrations}/{event.registrationLimit}
                          </span>
                          {event.currentRegistrations >= event.registrationLimit && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              已額滿
                            </span>
                          )}
                        </div>
                        <div className="w-24 bg-stone-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min((event.currentRegistrations / event.registrationLimit) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-stone-500">自由參加</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {event.status === 'published' ? '已發布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-stone-600" />
                      </button>
                      <button className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Event Form Modal */}
      {showNewEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <h2 className="text-xl font-bold text-stone-800">新增活動</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="event-name" className="block text-sm font-medium text-stone-700 mb-1">
                    活動名稱
                  </label>
                  <input
                    id="event-name"
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="例：觀音誕辰祈福法會"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-date" className="block text-sm font-medium text-stone-700 mb-1">
                      日期
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="event-time" className="block text-sm font-medium text-stone-700 mb-1">
                      時間
                    </label>
                    <input
                      id="event-time"
                      type="time"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="event-location" className="block text-sm font-medium text-stone-700 mb-1">
                    地點
                  </label>
                  <input
                    id="event-location"
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="例：大雄寶殿"
                  />
                </div>

                <div>
                  <label htmlFor="event-image" className="block text-sm font-medium text-stone-700 mb-1">
                    活動圖片
                  </label>
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-stone-400 transition-colors cursor-pointer">
                    <Image className="w-12 h-12 mx-auto text-stone-400 mb-2" />
                    <p className="text-sm text-stone-600">點擊上傳圖片</p>
                    <p className="text-xs text-stone-400 mt-1">建議尺寸: 1200x600px</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="event-desc" className="block text-sm font-medium text-stone-700 mb-1">
                    簡短描述
                  </label>
                  <textarea
                    id="event-desc"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="活動的簡短介紹..."
                  />
                </div>

                <div>
                  <label htmlFor="event-detail" className="block text-sm font-medium text-stone-700 mb-1">
                    詳細說明
                  </label>
                  <div className="border border-stone-200 rounded-lg">
                    <div className="flex items-center gap-2 p-2 border-b border-stone-200">
                      <button className="px-3 py-1 hover:bg-stone-100 rounded font-bold">B</button>
                      <button className="px-3 py-1 hover:bg-stone-100 rounded italic">I</button>
                      <button className="px-3 py-1 hover:bg-stone-100 rounded">H1</button>
                      <button className="px-3 py-1 hover:bg-stone-100 rounded">•</button>
                    </div>
                    <textarea
                      id="event-detail"
                      className="w-full px-3 py-2 focus:outline-none"
                      rows={8}
                      placeholder="活動流程、注意事項等詳細說明..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input id="require-register" type="checkbox" className="rounded border-stone-300 text-red-600 focus:ring-red-500" />
                    <span className="text-sm font-medium text-stone-700">需要報名</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label htmlFor="event-limit" className="text-sm font-medium text-stone-700">人數限制:</label>
                    <input
                      id="event-limit"
                      type="number"
                      className="w-24 px-3 py-1 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewEventForm(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  建立活動
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}