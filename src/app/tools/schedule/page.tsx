"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// コア教科定義
const SUBJECTS = [
  { name: '英語', color: 'bg-blue-50 text-blue-900 border-blue-200' },
  { name: '数学', color: 'bg-red-50 text-red-900 border-red-200' },
  { name: '国語', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  { name: '理科', color: 'bg-purple-50 text-purple-900 border-purple-200' },
  { name: '社会', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  { name: '情報I', color: 'bg-sky-50 text-sky-900 border-sky-200' },
  { name: '自習/模試', color: 'bg-slate-50 text-slate-900 border-slate-200' },
  { name: 'その他', color: 'bg-gray-50 text-gray-900 border-gray-200' }
];

const DAYS = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土・日'];
const PERIODS = [
  { id: 1, name: '1時間目', time: '09:00 - 10:30' },
  { id: 2, name: '2時間目', time: '10:45 - 12:15' },
  { id: 3, name: '3時間目', time: '13:00 - 14:30' },
  { id: 4, name: '4時間目', time: '14:45 - 16:15' },
  { id: 5, name: '5時間目', time: '16:30 - 18:00' },
  { id: 6, name: '6時間目/夜', time: '19:00 - 21:00' }
];

interface ScheduleCell {
  day: string;
  period: number;
  subject: string;
  memo: string;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ day: string; period: number } | null>(null);
  const [editSubject, setEditSubject] = useState('自習/模試');
  const [editMemo, setEditMemo] = useState('');

  // スケジュール初期ロード
  useEffect(() => {
    const saved = localStorage.getItem('passpica_weekly_schedule');
    if (saved) {
      try {
        setSchedule(JSON.parse(saved));
      } catch (e) {
        setSchedule([]);
      }
    }
  }, []);

  // セルクリック時の編集オープン
  const openEdit = (day: string, period: number) => {
    setSelectedCell({ day, period });
    const cell = schedule.find(c => c.day === day && c.period === period);
    if (cell) {
      setEditSubject(cell.subject);
      setEditMemo(cell.memo);
    } else {
      setEditSubject('自習/模試');
      setEditMemo('');
    }
  };

  // セルの保存
  const saveCell = () => {
    if (!selectedCell) return;
    const { day, period } = selectedCell;

    const baseSchedule = schedule.filter(c => !(c.day === day && c.period === period));
    let updated: ScheduleCell[] = [...baseSchedule];

    if (editSubject !== '') {
      updated.push({
        day,
        period,
        subject: editSubject,
        memo: editMemo.trim()
      });
    }

    setSchedule(updated);
    localStorage.setItem('passpica_weekly_schedule', JSON.stringify(updated));
    setSelectedCell(null);
  };

  // 全リセット
  const resetSchedule = () => {
    if (window.confirm('登録されている時間割をすべてリセットし、初期状態（白紙）に戻しますか？')) {
      setSchedule([]);
      localStorage.removeItem('passpica_weekly_schedule');
    }
  };

  // 対象セルのデータ取得
  const getCellData = (day: string, period: number) => {
    return schedule.find(c => c.day === day && c.period === period);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className="text-[10px] text-gray-500 mb-1">
            <Link href="/">トップ</Link> &gt; 時間割予定表
          </nav>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            自習時間割予定表（プランナー）
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            曜日と時間（1時間目〜6時間目）に合わせて、自分の学習予定を書き留めて保存しておけます。
          </p>
        </div>

        <button 
          onClick={resetSchedule}
          className="retro-btn-classic font-bold text-red-600 border-red-400 hover:bg-red-50"
        >
          白紙にリセットする
        </button>
      </div>

      {/* 時間割表グリッド */}
      <div className="border border-gray-300 overflow-x-auto">
        <table className="classic-table text-xs">
          <thead>
            <tr className="bg-gray-100 font-bold">
              <th className="w-24">時間割</th>
              {DAYS.map(day => (
                <th key={day} className="min-w-[130px]">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period.id}>
                
                {/* コマ表記 */}
                <td className="p-3 border border-gray-300 font-bold bg-gray-50 text-center flex flex-col justify-center items-center min-h-[90px]">
                  <span className="text-slate-800">{period.name}</span>
                  <span className="text-[9px] text-gray-400 font-mono mt-0.5">{period.time}</span>
                </td>

                {/* 各曜日のセル */}
                {DAYS.map(day => {
                  const data = getCellData(day, period.id);
                  const subType = data ? SUBJECTS.find(s => s.name === data.subject) : null;
                  
                  return (
                    <td 
                      key={day}
                      onClick={() => openEdit(day, period.id)}
                      className={`p-2 border border-gray-300 cursor-pointer align-top hover:bg-gray-50/70 transition-all ${data ? (subType?.color || 'bg-slate-50') : 'text-gray-300 font-sans'}`}
                      style={{ minHeight: '90px' }}
                    >
                      {data ? (
                        <div className="text-left space-y-1">
                          <span className="font-bold border-b border-slate-300 pb-0.5 block text-slate-800">
                            {data.subject}
                          </span>
                          <span className="text-[10px] text-slate-600 block break-all leading-normal whitespace-pre-wrap">
                            {data.memo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-gray-300 italic block pt-5 text-center">[登録なし]</span>
                      )}
                    </td>
                  );
                })}

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編集ダイアログ */}
      {selectedCell && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="border border-gray-400 bg-white p-6 max-w-sm w-full relative space-y-4">
            
            <button 
              onClick={() => setSelectedCell(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-sm"
            >
              ✕
            </button>

            <h3 className="font-bold text-sm text-slate-800 border-b border-gray-200 pb-1.5">
              ■ 自習予定を編集する
            </h3>
            
            <div className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 p-2 rounded">
              スロット: <strong>{selectedCell.day} / {PERIODS.find(p => p.id === selectedCell.period)?.name}</strong>
            </div>

            <div className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1.5">1. 教科を選択してください</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {SUBJECTS.map(s => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setEditSubject(s.name)}
                      className={`border border-gray-400 py-1.5 px-1 text-center rounded text-[11px] font-bold transition-all ${editSubject === s.name ? 'bg-amber-100 border-amber-600' : 'bg-white hover:bg-slate-50'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditSubject('')}
                    className="border border-red-300 py-1.5 px-1 text-center rounded text-[11px] font-bold bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    削除
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1.5">2. 自習内容（メモ）</label>
                <textarea
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  placeholder="例: 教科書の練習問題1〜10"
                  rows={2}
                  className="w-full border border-gray-400 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                <button
                  onClick={() => setSelectedCell(null)}
                  className="flex-1 border border-gray-400 py-2 bg-gray-50 hover:bg-gray-100 font-bold"
                >
                  キャンセル
                </button>
                <button
                  onClick={saveCell}
                  className="flex-1 retro-btn-classic py-2 font-bold text-center"
                >
                  保存する
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 勉強ガイド */}
      <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed max-w-3xl">
        <h4 className="font-bold text-slate-800 mb-1">■ 勉強予定表の立て方のコツ</h4>
        <p className="text-[11px] text-gray-500">
          勉強の枠（コマ）を決めてから内容を埋めることで、無計画に勉強するのを防ぐことができます。
          「朝一の1時間目は英語の単語」、「最後の6時間目は今日間違えた問題のやり直し」など、定型的なスケジュールを作っておくのが長続きする秘訣です。
        </p>
      </div>

    </div>
  );
}
