"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EXAM_MASTER_DATA, ExamEvent, TargetGrade } from '@/src/data/calendar';

export default function CalendarPage() {
  const [customEvents, setCustomEvents] = useState<ExamEvent[]>([]);
  const [selectedMockIds, setSelectedMockIds] = useState<string[]>([]);
  
  const [customTitle, setCustomTitle] = useState('');
  const [customDate, setCustomDate] = useState('');
  
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<TargetGrade | 'all'>('all');
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  
  // イベント読み込み
  useEffect(() => {
    // カスタムイベントの読み込み
    const savedCustoms = localStorage.getItem('passpica_calendar_events');
    if (savedCustoms) {
      try {
        setCustomEvents(JSON.parse(savedCustoms));
      } catch (e) {
        setCustomEvents([]);
      }
    }

    // 選択された模試の読み込み
    const savedMocks = localStorage.getItem('passpica_calendar_selected_mocks');
    if (savedMocks) {
      try {
        setSelectedMockIds(JSON.parse(savedMocks));
      } catch (e) {
        setSelectedMockIds([]);
      }
    }
  }, []);

  // カレンダーに表示するすべてのイベントをマージ
  const displayEvents = useMemo(() => {
    const fixedEvents = EXAM_MASTER_DATA.filter(ev => ev.isFixed);
    const selectedMocks = EXAM_MASTER_DATA.filter(ev => selectedMockIds.includes(ev.id));
    return [...fixedEvents, ...selectedMocks, ...customEvents];
  }, [selectedMockIds, customEvents]);

  // カスタムマイルストーン追加
  const addCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDate) return;

    const newEvent: ExamEvent = {
      id: 'c_' + Date.now(),
      date: customDate,
      title: customTitle.trim(),
      type: 'custom'
    };

    const updatedCustoms = [...customEvents, newEvent];
    setCustomEvents(updatedCustoms);
    localStorage.setItem('passpica_calendar_events', JSON.stringify(updatedCustoms));

    setCustomTitle('');
    setCustomDate('');
  };

  // カスタムマイルストーン削除
  const deleteCustomEvent = (id: string) => {
    if (!id.startsWith('c_')) return;
    const updatedCustoms = customEvents.filter(ev => ev.id !== id);
    setCustomEvents(updatedCustoms);
    localStorage.setItem('passpica_calendar_events', JSON.stringify(updatedCustoms));
  };

  // 模試の選択・解除
  const toggleMock = (id: string) => {
    let newSelected: string[];
    if (selectedMockIds.includes(id)) {
      newSelected = selectedMockIds.filter(mockId => mockId !== id);
    } else {
      newSelected = [...selectedMockIds, id];
    }
    setSelectedMockIds(newSelected);
    localStorage.setItem('passpica_calendar_selected_mocks', JSON.stringify(newSelected));
  };

  // フィルタリングと日付順ソート（表示用）
  const filteredDisplayEvents = displayEvents.filter(ev => filterType === 'all' || ev.type === filterType);
  const sortedEvents = [...filteredDisplayEvents].sort((a, b) => a.date.localeCompare(b.date));

  // 模試選択用のリストを抽出（固定でないもの）
  const mockCandidates = EXAM_MASTER_DATA.filter(ev => !ev.isFixed && ev.type === 'mock');
  
  // 学年で絞り込み
  const gradeFilteredCandidates = useMemo(() => {
    if (selectedGrade === 'all') return mockCandidates;
    return mockCandidates.filter(ev => !ev.targetGrades || ev.targetGrades.includes(selectedGrade));
  }, [mockCandidates, selectedGrade]);

  // プロバイダーごとにグループ化
  const providers = Array.from(new Set(gradeFilteredCandidates.map(ev => ev.provider).filter(Boolean))) as string[];

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
          <div className="border border-gray-300 bg-gray-50 p-3 flex flex-wrap gap-2 items-center">
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
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        ev.type === 'national' ? 'bg-red-50 text-red-700 border border-red-200' : 
                        ev.type === 'mock' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {ev.type === 'national' ? '入試公式' : ev.type === 'mock' ? '模試' : '自分用'}
                      </span>
                    </td>
                    <td className="font-bold text-slate-800 text-left">
                      {ev.provider && <span className="text-[10px] text-gray-500 mr-1">[{ev.provider}]</span>}
                      {ev.title}
                    </td>
                    <td className="text-center">
                      {ev.type === 'custom' ? (
                        <button 
                          onClick={() => deleteCustomEvent(ev.id)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          削除
                        </button>
                      ) : ev.type === 'mock' ? (
                        <button 
                          onClick={() => toggleMock(ev.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          はずす
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
          
          {/* 模試の追加フォーム */}
          <div className="retro-box space-y-4">
            <div className="flex justify-between items-end border-b border-gray-300 pb-1.5">
              <h3 className="font-bold text-slate-800">
                ■ 公式模試から追加する
              </h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">対象学年</label>
                <select 
                  value={selectedGrade} 
                  onChange={(e) => {
                    setSelectedGrade(e.target.value as TargetGrade | 'all');
                    setActiveProvider(null); // 学年変更時はアコーディオンをリセット
                  }}
                  className="w-full retro-input font-sans text-xs"
                >
                  <option value="all">すべての学年</option>
                  <option value="高3・高卒">高3・高卒生</option>
                  <option value="高2">高2生</option>
                  <option value="高1">高1生</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-600 mb-1">予備校・主催者</label>
                {providers.length === 0 ? (
                  <p className="text-gray-500 text-[10px]">該当する模試がありません</p>
                ) : (
                  providers.map(provider => (
                    <div key={provider} className="border border-gray-200 rounded overflow-hidden">
                      <button
                        onClick={() => setActiveProvider(activeProvider === provider ? null : provider)}
                        className={`w-full text-left px-3 py-2 text-xs font-bold flex justify-between items-center hover:bg-gray-50 ${activeProvider === provider ? 'bg-blue-50 border-b border-gray-200' : 'bg-white'}`}
                      >
                        {provider}
                        <span className="text-[10px] text-gray-400">
                          {activeProvider === provider ? '▼' : '▶'}
                        </span>
                      </button>
                      
                      {activeProvider === provider && (
                        <div className="bg-white p-2 max-h-48 overflow-y-auto space-y-1">
                          {gradeFilteredCandidates.filter(ev => ev.provider === provider).map(ev => (
                            <label key={ev.id} className="flex items-start gap-2 p-1 hover:bg-gray-50 cursor-pointer rounded">
                              <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={selectedMockIds.includes(ev.id)}
                                onChange={() => toggleMock(ev.id)}
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-[11px] leading-tight">{ev.title}</span>
                                <span className="text-[9px] text-gray-500 font-mono">{ev.date.replace(/-/g, '/')}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* カスタム予定の追加フォーム */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 新しい予定を登録する
            </h3>

            <form onSubmit={addCustomEvent} className="space-y-3">
              
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

        </div>

      </div>

    </div>
  );
}
