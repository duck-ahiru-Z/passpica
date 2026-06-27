"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  MOCK_MASTER_DATA, 
  NATIONAL_MASTER_DATA, 
  CalendarDisplayEvent, 
  TargetGrade,
  TargetUniversity,
  ExamCategory
} from '@/src/data/calendar';

const UNIVERSITIES: TargetUniversity[] = [
  '東京大学', '京都大学', '北海道大学', '東北大学', 
  '名古屋大学', '大阪大学', '九州大学', '東京工業大学', '東京科学大学',
  '一橋大学', '神戸大学', '千葉大学', '広島大学', '早稲田大学', '慶應義塾大学', 'その他'
];

export default function CalendarPage() {
  const [customEvents, setCustomEvents] = useState<CalendarDisplayEvent[]>([]);
  const [selectedMockIds, setSelectedMockIds] = useState<string[]>([]);
  const [selectedNationalIds, setSelectedNationalIds] = useState<string[]>(NATIONAL_MASTER_DATA.map(n => n.id));
  
  const [customTitle, setCustomTitle] = useState('');
  const [customDate, setCustomDate] = useState('');
  
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // 模試追加用UIのステート
  const [addTab, setAddTab] = useState<'national' | 'normal' | 'kanmuri'>('normal');
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

    const savedNationals = localStorage.getItem('passpica_calendar_selected_nationals');
    if (savedNationals) {
      try {
        setSelectedNationalIds(JSON.parse(savedNationals));
      } catch (e) {
        setSelectedNationalIds(NATIONAL_MASTER_DATA.map(n => n.id));
      }
    } else {
      // 初回はすべて選択状態にして保存
      const allNationalIds = NATIONAL_MASTER_DATA.map(n => n.id);
      setSelectedNationalIds(allNationalIds);
      localStorage.setItem('passpica_calendar_selected_nationals', JSON.stringify(allNationalIds));
    }
  }, []);

  // カレンダーに表示するすべてのイベントを生成
  const displayEvents = useMemo(() => {
    const events: CalendarDisplayEvent[] = [];

    // 固定（公式）イベント (選択されたものだけ)
    NATIONAL_MASTER_DATA.filter(n => selectedNationalIds.includes(n.id)).forEach(n => {
      events.push({
        id: n.id,
        date: n.date,
        title: n.title,
        type: 'national',
        badge: n.badge,
        parentMockId: n.id // 公式日程の解除用
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
  }, [selectedMockIds, selectedNationalIds, customEvents]);

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

  // 公式日程の選択・解除
  const toggleNational = (id: string) => {
    let newSelected: string[];
    if (selectedNationalIds.includes(id)) {
      newSelected = selectedNationalIds.filter(nid => nid !== id);
    } else {
      newSelected = [...selectedNationalIds, id];
    }
    setSelectedNationalIds(newSelected);
    localStorage.setItem('passpica_calendar_selected_nationals', JSON.stringify(newSelected));
  };

  // 削除ハンドラ（リスト上の「はずす」ボタン用）
  const removeEventGroup = (parentMockId: string, type: ExamCategory) => {
    if (type === 'national') {
      toggleNational(parentMockId);
    } else if (type === 'mock') {
      toggleMock(parentMockId);
    }
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

  // カレンダー用のヘルパー
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const formatToYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = getDaysInMonth(year, month);
    const firstDayOfWeek = days[0].getDay(); // 0(Sun) to 6(Sat)
    
    // pad with nulls
    const paddedDays: (Date | null)[] = Array(firstDayOfWeek).fill(null);
    paddedDays.push(...days);
    
    return paddedDays;
  }, [currentMonth]);

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; 受験カレンダー
        </nav>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            受験カレンダー日程メモ
          </h1>
          {/* 表示形式切り替え */}
          <div className="flex border border-slate-300 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-[11px] font-bold ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              リスト形式
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-[11px] font-bold ${viewMode === 'calendar' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              カレンダー形式
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          共通テスト等の年間公式日程と、自分が受ける模試、出願予定日などを追加して管理できます。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：イベント一覧テーブル / カレンダー (2/3) */}
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

          {viewMode === 'list' ? (
            /* 表組み表示 */
            <div className="border border-gray-300 overflow-x-auto bg-white">
              <table className="classic-table text-xs w-full">
                <thead>
                  <tr className="bg-gray-100 font-bold">
                    <th className="w-20 md:w-24">年月日</th>
                    <th className="w-16 md:w-20">種類</th>
                    <th>イベント内容</th>
                    <th className="w-12 md:w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50/50">
                      <td className="font-mono text-center text-[10px] md:text-xs">{ev.date.replace(/-/g, '/')}</td>
                      <td className="text-center">
                        <span className={`px-1 py-0.5 rounded text-[9px] md:text-[10px] border whitespace-nowrap ${getBadgeColor(ev.badge)}`}>
                          {ev.badge || '予定'}
                        </span>
                      </td>
                      <td className="font-bold text-slate-800 text-left text-[11px] md:text-xs">
                        {ev.provider && <span className="text-[9px] md:text-[10px] text-gray-500 mr-1 hidden sm:inline-block">[{ev.provider}]</span>}
                        {ev.title}
                      </td>
                      <td className="text-center">
                        {ev.type === 'custom' ? (
                          <button 
                            onClick={() => deleteCustomEvent(ev.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-[10px] md:text-xs"
                          >
                            削除
                          </button>
                        ) : ev.parentMockId ? (
                          <button 
                            onClick={() => removeEventGroup(ev.parentMockId!, ev.type)}
                            className="text-gray-500 hover:text-gray-700 text-[10px] md:text-xs"
                            title="この日程・模試をカレンダーから外す"
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
          ) : (
            /* カレンダー表示 */
            <div className="border border-gray-300 bg-white">
              {/* カレンダーヘッダー */}
              <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-300">
                <button onClick={prevMonth} className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 font-bold text-slate-600">
                  ◀ 前月
                </button>
                <h2 className="text-lg font-bold text-slate-800">
                  {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                </h2>
                <button onClick={nextMonth} className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 font-bold text-slate-600">
                  次月 ▶
                </button>
              </div>
              
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 border-b border-gray-300 bg-gray-100 text-center font-bold text-slate-600 text-[10px] md:text-xs">
                <div className="py-2 text-red-600">日</div>
                <div className="py-2">月</div>
                <div className="py-2">火</div>
                <div className="py-2">水</div>
                <div className="py-2">木</div>
                <div className="py-2">金</div>
                <div className="py-2 text-blue-600">土</div>
              </div>

              {/* 日付グリッド */}
              <div className="grid grid-cols-7 auto-rows-[minmax(80px,auto)] md:auto-rows-[minmax(100px,auto)]">
                {calendarDays.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="border-b border-r border-gray-200 bg-gray-50/50"></div>;
                  }

                  const dateStr = formatToYYYYMMDD(date);
                  const dayEvents = filteredDisplayEvents.filter(ev => ev.date === dateStr);
                  const isToday = dateStr === formatToYYYYMMDD(new Date());

                  return (
                    <div key={dateStr} className={`border-b border-r border-gray-200 p-1 flex flex-col ${isToday ? 'bg-yellow-50/50' : 'bg-white'}`}>
                      <div className={`text-[10px] md:text-xs font-bold text-right mb-1 ${date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
                        {isToday && <span className="bg-yellow-400 text-white rounded-full px-1.5 py-0.5 text-[9px] mr-1">今日</span>}
                        {date.getDate()}
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                        {dayEvents.map(ev => (
                          <div key={ev.id} className="text-[9px] md:text-[10px] leading-tight border-l-2 pl-1 break-words" style={{ borderColor: ev.type === 'national' ? '#ef4444' : ev.type === 'mock' ? '#3b82f6' : '#10b981' }}>
                            <span className="font-bold text-slate-700 block mb-0.5">
                              {ev.badge && <span className={`inline-block mr-1 ${ev.badge === '申込開始' || ev.badge === '申込締切' ? 'text-orange-600' : ev.badge === '試験日' ? 'text-blue-600' : 'text-purple-600'}`}>[{ev.badge}]</span>}
                              {ev.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* 右側：追加フォーム (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 模試の追加フォーム */}
          <div className="retro-box space-y-4">
            
            {/* タブ切り替え */}
            <div className="flex border-b border-gray-300">
              <button
                className={`flex-1 py-1.5 text-[10px] md:text-[11px] font-bold ${addTab === 'national' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setAddTab('national')}
              >
                公式日程
              </button>
              <button
                className={`flex-1 py-1.5 text-[10px] md:text-[11px] font-bold border-l border-gray-200 ${addTab === 'normal' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setAddTab('normal')}
              >
                通常模試
              </button>
              <button
                className={`flex-1 py-1.5 text-[10px] md:text-[11px] font-bold border-l border-gray-200 ${addTab === 'kanmuri' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setAddTab('kanmuri')}
              >
                冠模試
              </button>
            </div>
            
            {/* 公式日程タブ */}
            {addTab === 'national' && (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">共通テスト・国公立二次試験など</label>
                  <div className="bg-white border border-gray-200 rounded p-2 max-h-60 overflow-y-auto space-y-2">
                    {NATIONAL_MASTER_DATA.map(ev => (
                      <label key={ev.id} className="flex items-start gap-2 p-1 hover:bg-gray-50 cursor-pointer rounded border-b border-gray-100 last:border-0">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={selectedNationalIds.includes(ev.id)}
                          onChange={() => toggleNational(ev.id)}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-[11px] leading-tight">
                            {ev.badge && <span className="text-red-600 mr-1">[{ev.badge}]</span>}
                            {ev.title}
                          </span>
                          <span className="text-[9px] text-gray-500 mt-0.5">
                            {ev.date.replace(/-/g, '/')}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 通常模試タブ */}
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

            {/* 冠模試タブ */}
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

            <div className="text-[10px] text-gray-500 mt-2 bg-gray-50 p-2 rounded leading-relaxed">
              ※追加すると、カレンダーや一覧にすべての関連日程が表示されます。<br/>
              ※不要になった場合は「はずす」かチェックを外してください。
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

          {/* 公式サイトへのリンク集 */}
          <div className="retro-box space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 各予備校の公式サイト
            </h3>
            <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
              最新の正確な日程や申込方法については、必ず各予備校の公式サイトをご確認ください。
            </p>
            <ul className="space-y-2 text-[11px]">
              <li>
                <a href="https://www.kawai-juku.ac.jp/zento/pdf/schedule-2026.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <span>河合塾 全統模試スケジュール</span>
                  <span className="text-[8px] text-gray-400">🔗</span>
                </a>
              </li>
              <li>
                <a href="https://www2.sundai.ac.jp/teacher/assets/pdf/2026-schedule.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <span>駿台模試 年間スケジュール</span>
                  <span className="text-[8px] text-gray-400">🔗</span>
                </a>
              </li>
              <li>
                <a href="https://www.toshin-moshi.com/schedules/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <span>東進 模試スケジュール</span>
                  <span className="text-[8px] text-gray-400">🔗</span>
                </a>
              </li>
              <li>
                <a href="https://www.yozemi.ac.jp/moshi/schedule/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <span>代ゼミ 模試・テストスケジュール</span>
                  <span className="text-[8px] text-gray-400">🔗</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
