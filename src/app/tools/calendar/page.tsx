"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'national' | 'mock' | 'custom';
}

const PRESET_EVENTS: CalendarEvent[] = [
  { id: 'p1', date: '2026-09-28', title: '共通テスト出願受付 開始', type: 'national' },
  { id: 'p2', date: '2026-10-08', title: '共通テスト出願受付 締切', type: 'national' },
  { id: 'p3', date: '2026-10-25', title: '第3回全統記述模試 (目安)', type: 'mock' },
  { id: 'p4', date: '2026-11-03', title: '第3回全統共通テスト模試 (目安)', type: 'mock' },
  { id: 'p5', date: '2026-11-23', title: '共通テストプレテスト (目安)', type: 'mock' },
  { id: 'p6', date: '2027-01-16', title: '令和9年度 大学入学共通テスト 1日目', type: 'national' },
  { id: 'p7', date: '2027-01-17', title: '令和9年度 大学入学共通テスト 2日目', type: 'national' },
  { id: 'p8', date: '2027-02-25', title: '国公立大学 二次試験 前期日程', type: 'national' },
  { id: 'p9', date: '2027-03-12', title: '国公立大学 二次試験 後期日程', type: 'national' }
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // イベント読み込み
  useEffect(() => {
    const saved = localStorage.getItem('passpica_calendar_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEvents([...PRESET_EVENTS, ...parsed]);
      } catch (e) {
        setEvents(PRESET_EVENTS);
      }
    } else {
      setEvents(PRESET_EVENTS);
    }
  }, []);

  // カスタムマイルストーン追加
  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDate) return;

    const newEvent: CalendarEvent = {
      id: 'c_' + Date.now(),
      date: customDate,
      title: customTitle.trim(),
      type: 'custom'
    };

    const savedCustoms = JSON.parse(localStorage.getItem('passpica_calendar_events') || '[]');
    const updatedCustoms = [...savedCustoms, newEvent];
    localStorage.setItem('passpica_calendar_events', JSON.stringify(updatedCustoms));

    setEvents([...PRESET_EVENTS, ...updatedCustoms]);
    setCustomTitle('');
    setCustomDate('');
  };

  // カスタムマイルストーン削除
  const deleteEvent = (id: string) => {
    if (!id.startsWith('c_')) return;
    
    const savedCustoms = JSON.parse(localStorage.getItem('passpica_calendar_events') || '[]');
    const updatedCustoms = savedCustoms.filter((ev: CalendarEvent) => ev.id !== id);
    localStorage.setItem('passpica_calendar_events', JSON.stringify(updatedCustoms));

    setEvents([...PRESET_EVENTS, ...updatedCustoms]);
  };

  // フィルタリングと日付順ソート
  const filteredEvents = events.filter(ev => filterType === 'all' || ev.type === filterType);
  const sortedEvents = [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; 受験カレンダー
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          受験カレンダー日程メモ
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          共通テスト等の年間公式日程と、自分が受ける模試、出願予定日などを追加して管理できます。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：イベント一覧テーブル (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* 絞り込みタブ */}
          <div className="border border-gray-300 bg-gray-50 p-3 flex gap-2 items-center">
            <span className="font-bold text-slate-700 mr-2">■ 表示切替:</span>
            {[
              { id: 'all', name: 'すべて' },
              { id: 'national', name: '公式・入試' },
              { id: 'mock', name: '大手模試' },
              { id: 'custom', name: '自分日程' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`retro-btn-classic ${filterType === tab.id ? 'bg-[#cbd5e1] font-bold' : ''}`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* 表組み表示 */}
          <div className="border border-gray-300 overflow-x-auto bg-white">
            <table className="classic-table text-xs">
              <thead>
                <tr className="bg-gray-100 font-bold">
                  <th className="w-28">年月日</th>
                  <th className="w-24">分類</th>
                  <th>イベント内容</th>
                  <th className="w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50">
                    <td className="font-mono text-center">{ev.date.replace(/-/g, '/')}</td>
                    <td className="text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${ev.type === 'national' ? 'bg-red-50 text-red-700 border border-red-200' : ev.type === 'mock' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {ev.type === 'national' ? '入試公式' : ev.type === 'mock' ? '模試' : '自分用'}
                      </span>
                    </td>
                    <td className="font-bold text-slate-800 text-left">{ev.title}</td>
                    <td className="text-center">
                      {ev.type === 'custom' ? (
                        <button 
                          onClick={() => deleteEvent(ev.id)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          削除
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {sortedEvents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400 italic">
                      表示する予定はありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* 右側：追加フォーム (1/3) */}
        <div className="col-span-1 space-y-6">
          
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 新しい予定を登録する
            </h3>

            <form onSubmit={addEvent} className="space-y-3">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">イベント名 (必須)</label>
                <input
                  type="text"
                  required
                  placeholder="例: 私立〇〇大学の出願日"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full retro-input font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">日付 (必須)</label>
                <input
                  type="date"
                  required
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full retro-input font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full retro-btn-classic font-bold text-center py-1.5 mt-2"
              >
                カレンダーに追加する
              </button>

            </form>
          </div>

          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed">
            <h4 className="font-bold text-slate-800 mb-1">■ 日程登録のススメ</h4>
            <p className="text-[11px] text-gray-500">
              共通テストの出願は9月下旬〜10月上旬にかけて行われ、期間が非常に短いです。
              カレンダーにあらかじめ出願期日と「期日3日前」の事前アラートをメモしておくことで、出願忘れ等のトラブルを未然に防ぐことができます。
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
