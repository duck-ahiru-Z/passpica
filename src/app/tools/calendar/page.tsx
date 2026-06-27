"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  MOCK_MASTER_DATA, 
  NATIONAL_MASTER_DATA, 
  CalendarDisplayEvent, 
  TargetGrade,
  TargetUniversity 
} from '@/src/data/calendar';

const UNIVERSITIES: TargetUniversity[] = [
  '東京大学', '京都大学', '北海道大学', '東北大学', 
  '名古屋大学', '大阪大学', '九州大学', '東京工業大学', '東京科学大学',
  '一橋大学', '神戸大学', '早稲田大学', '慶應義塾大学', 'その他'
];

export default function CalendarPage() {
  const [customEvents, setCustomEvents] = useState<CalendarDisplayEvent[]>([]);
  const [selectedMockIds, setSelectedMockIds] = useState<string[]>([]);
  
  const [customTitle, setCustomTitle] = useState('');
  const [customDate, setCustomDate] = useState('');
  
  const [filterType, setFilterType] = useState<string>('all');
  
  // 模試追加用UIのステート
  const [addTab, setAddTab] = useState<'normal' | 'kanmuri'>('normal');
  const [selectedGrade, setSelectedGrade] = useState<TargetGrade | 'all'>('all');
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  
  // 冠模試検索用のステート
  const [selectedUniv, setSelectedUniv] = useState<TargetUniversity | 'all'>('all');

  // イベント読み込み
  useEffect(() => {
    const savedCustoms = localStorage.getItem('passpica_calendar_events');
    if (savedCustoms) {
      try {
        setCustomEvents(JSON.parse(savedCustoms));
      } catch (e) {
        setCustomEvents([]);
      }
    }

    const savedMocks = localStorage.getItem('passpica_calendar_selected_mocks');
    if (savedMocks) {
      try {
        setSelectedMockIds(JSON.parse(savedMocks));
      } catch (e) {
        setSelectedMockIds([]);
      }
    }
  }, []);

  // カレンダーに表示するすべてのイベントを生成
  const displayEvents = useMemo(() => {
    const events: CalendarDisplayEvent[] = [];

    // 固定（公式）イベント
    NATIONAL_MASTER_DATA.forEach(n => {
      events.push({
        id: n.id,
        date: n.date,
        title: n.title,
        type: 'national',
        badge: n.badge
      });
    });

    // 選択された模試イベントを展開
    const selectedMocks = MOCK_MASTER_DATA.filter(ev => selectedMockIds.includes(ev.id));
    selectedMocks.forEach(mock => {
      const { schedule } = mock;
      if (schedule.applicationStart) {
        events.push({
          id: `${mock.id}-app-start`,
          date: schedule.applicationStart,
          title: mock.title,
          type: 'mock',
          provider: mock.provider,
          badge: '申込開始',
          parentMockId: mock.id
        });
      }
      if (schedule.applicationEnd) {
        events.push({
          id: `${mock.id}-app-end`,
          date: schedule.applicationEnd,
          title: mock.title,
          type: 'mock',
          provider: mock.provider,
          badge: '申込締切',
          parentMockId: mock.id
        });
      }
      schedule.examDates.forEach((d, i) => {
        events.push({
          id: `${mock.id}-exam-${i}`,
          date: d,
          title: mock.title,
          type: 'mock',
          provider: mock.provider,
          badge: '試験日',
          parentMockId: mock.id
        });
      });
      if (schedule.resultRelease) {
        events.push({
          id: `${mock.id}-result`,
          date: schedule.resultRelease,
          title: mock.title,
          type: 'mock',
          provider: mock.provider,
          badge: '成績返却',
          parentMockId: mock.id
        });
      }
    });

    // カスタムイベント
    events.push(...customEvents);

    return events;
  }, [selectedMockIds, customEvents]);

  // カスタム予定追加
  const addCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDate) return;

    const newEvent: CalendarDisplayEvent = {
      id: 'c_' + Date.now(),
      date: customDate,
      title: customTitle.trim(),
      type: 'custom',
      badge: '自分'
    };

    const updatedCustoms = [...customEvents, newEvent];
    setCustomEvents(updatedCustoms);
    localStorage.setItem('passpica_calendar_events', JSON.stringify(updatedCustoms));

    setCustomTitle('');
    setCustomDate('');
  };

  // カスタム予定削除
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

  // 表示用のフィルタとソート
  const filteredDisplayEvents = displayEvents.filter(ev => filterType === 'all' || ev.type === filterType);
  const sortedEvents = [...filteredDisplayEvents].sort((a, b) => a.date.localeCompare(b.date));

  // 追加UI用の候補データ
  const normalMocks = MOCK_MASTER_DATA.filter(ev => !ev.isKanmuri);
  const kanmuriMocks = MOCK_MASTER_DATA.filter(ev => ev.isKanmuri);

  // 学年で絞り込み（通常模試用）
  const gradeFilteredNormalMocks = useMemo(() => {
    if (selectedGrade === 'all') return normalMocks;
    return normalMocks.filter(ev => !ev.targetGrades || ev.targetGrades.includes(selectedGrade));
  }, [normalMocks, selectedGrade]);

  const normalProviders = Array.from(new Set(gradeFilteredNormalMocks.map(ev => ev.provider).filter(Boolean))) as string[];

  // 大学で絞り込み（冠模試用）
  const univFilteredKanmuriMocks = useMemo(() => {
    if (selectedUniv === 'all') return kanmuriMocks;
    return kanmuriMocks.filter(ev => ev.targetUniversity === selectedUniv);
  }, [kanmuriMocks, selectedUniv]);

  // バッジの色を決定するヘルパー
  const getBadgeColor = (badge?: string) => {
    switch(badge) {
      case '申込開始':
      case '申込締切': return 'bg-orange-100 text-orange-700 border-orange-200';
      case '試験日': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '成績返却': return 'bg-purple-100 text-purple-700 border-purple-200';
      case '公式': return 'bg-red-100 text-red-700 border-red-200';
      case '自分': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
                  <th className="w-24">年月日</th>
                  <th className="w-20">種類</th>
                  <th>イベント内容</th>
                  <th className="w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50">
                    <td className="font-mono text-center">{ev.date.replace(/-/g, '/')}</td>
                    <td className="text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] border whitespace-nowrap ${getBadgeColor(ev.badge)}`}>
                        {ev.badge || '予定'}
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
                      ) : ev.parentMockId ? (
                        <button 
                          onClick={() => toggleMock(ev.parentMockId!)}
                          className="text-gray-500 hover:text-gray-700"
                          title="この模試のすべての日程をカレンダーから外す"
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
            
            {/* タブ切り替え */}
            <div className="flex border-b border-gray-300">
              <button
                className={`flex-1 py-1.5 text-[11px] font-bold ${addTab === 'normal' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setAddTab('normal')}
              >
                通常模試
              </button>
              <button
                className={`flex-1 py-1.5 text-[11px] font-bold ${addTab === 'kanmuri' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setAddTab('kanmuri')}
              >
                冠模試
              </button>
            </div>
            
            {addTab === 'normal' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">対象学年</label>
                  <select 
                    value={selectedGrade} 
                    onChange={(e) => {
                      setSelectedGrade(e.target.value as TargetGrade | 'all');
                      setActiveProvider(null);
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
                  {normalProviders.length === 0 ? (
                    <p className="text-gray-500 text-[10px]">該当する模試がありません</p>
                  ) : (
                    normalProviders.map(provider => (
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
                            {gradeFilteredNormalMocks.filter(ev => ev.provider === provider).map(ev => (
                              <label key={ev.id} className="flex items-start gap-2 p-1 hover:bg-gray-50 cursor-pointer rounded">
                                <input
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={selectedMockIds.includes(ev.id)}
                                  onChange={() => toggleMock(ev.id)}
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-700 text-[11px] leading-tight">{ev.title}</span>
                                  <span className="text-[9px] text-gray-500 mt-0.5">
                                    {ev.schedule.examDates.length > 1 ? `${ev.schedule.examDates[0].replace(/-/g, '/')} 〜` : ev.schedule.examDates[0].replace(/-/g, '/')}
                                  </span>
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
            )}

            {addTab === 'kanmuri' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">対象大学 (冠模試)</label>
                  <select 
                    value={selectedUniv} 
                    onChange={(e) => setSelectedUniv(e.target.value as TargetUniversity | 'all')}
                    className="w-full retro-input font-sans text-xs"
                  >
                    <option value="all">すべての大学</option>
                    {UNIVERSITIES.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">検索結果</label>
                  {univFilteredKanmuriMocks.length === 0 ? (
                    <p className="text-gray-500 text-[10px]">該当する冠模試がありません</p>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded p-2 max-h-60 overflow-y-auto space-y-2">
                      {univFilteredKanmuriMocks.map(ev => (
                        <label key={ev.id} className="flex items-start gap-2 p-1 hover:bg-gray-50 cursor-pointer rounded border-b border-gray-100 last:border-0">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={selectedMockIds.includes(ev.id)}
                            onChange={() => toggleMock(ev.id)}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-[11px] leading-tight">
                              <span className="text-gray-500 mr-1 font-normal">[{ev.provider}]</span>
                              {ev.title}
                            </span>
                            <span className="text-[9px] text-gray-500 mt-0.5">
                              {ev.schedule.examDates[0].replace(/-/g, '/')}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-[10px] text-gray-500 mt-2 bg-gray-50 p-2 rounded">
              ※追加すると、試験日だけでなく「申込開始/締切」「成績返却日」も一括でカレンダーに表示されます。
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
