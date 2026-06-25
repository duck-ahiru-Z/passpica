"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function HomePage() {
  // --- 共通テストカウントダウン計算 ---
  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    const targetDate = new Date('2027-01-16T09:00:00+09:00'); // 2027年共通テスト初日
    const calculateCountdown = () => {
      const now = new Date();
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 3600000);
    return () => clearInterval(timer);
  }, []);

  // --- ToDoリスト状態管理 ---
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  // ローカルストレージからToDoの読み込み
  useEffect(() => {
    const saved = localStorage.getItem('passpica_dashboard_todos');
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultTodos = [
        { id: '1', text: '時間割予定表で今週の勉強コマを組む', completed: false },
        { id: '2', text: '化学・炎色反応の語呂合わせを確認する', completed: false },
        { id: '3', text: '数学・三角比の座標変化を復習する', completed: false }
      ];
      setTodos(defaultTodos);
      localStorage.setItem('passpica_dashboard_todos', JSON.stringify(defaultTodos));
    }
  }, []);

  // ToDo保存
  const saveTodos = (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    localStorage.setItem('passpica_dashboard_todos', JSON.stringify(updatedTodos));
  };

  // ToDo追加
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false
    };
    saveTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  // ToDo切り替え
  const toggleTodo = (id: string) => {
    const updated = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updated);
  };

  // ToDo削除
  const deleteTodo = (id: string) => {
    const updated = todos.filter(todo => todo.id !== id);
    saveTodos(updated);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* ウェルカムバナー */}
      <div className="border border-gray-400 bg-gray-50 p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">
          ようこそ、passpica 自習室へ
        </h1>
        <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
          当サイトは、大学受験生が自習の合間に利用できるWebツール（勉強スケジュール作成、重要項目のビジュアル理解シミュレータ）を提供する個人運営の学習室サイトです。PC・スマートフォンどちらのブラウザでも軽快に動作します。
        </p>
      </div>

      {/* カウントダウン看板 */}
      <div className="border border-red-300 bg-red-50/40 p-4 text-center">
        <span className="text-xs font-bold text-red-600 block mb-1">【大学入学共通テスト カウントダウン】</span>
        <div className="text-xl md:text-2xl font-bold text-slate-800 font-mono tracking-wide">
          共通テスト本番まで あと <span className="text-red-600 text-3xl font-extrabold">{daysLeft}</span> 日
        </div>
        <span className="text-[10px] text-gray-500 block mt-1">試験日程：2027年1月16日・17日</span>
      </div>

      {/* 2カラム構成のメインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左カラム：学習室コンテンツ一覧 (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="retro-box">
            <h2 className="text-sm font-bold border-b border-gray-300 pb-1.5 mb-4 flex items-center gap-1">
              <span>■</span> 学習室の設置教材（解説＆シミュレータ）
            </h2>
            
            <div className="space-y-6 text-xs leading-relaxed">
              
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] bg-rose-100 border border-rose-300 text-rose-800 px-1 py-0.5 rounded">数学I・A</span>
                  <Link href="/learn/math/trigonometry">三角比（単位円）ビジュアル図解</Link>
                </h3>
                <p className="text-gray-500 pl-4">
                  角度θの値を変化させたときの、sin, cos, tan の長さの変化を動的に確認できる幾何学シミュレータです。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] bg-purple-100 border border-purple-300 text-purple-800 px-1 py-0.5 rounded">化学基礎</span>
                  <Link href="/learn/chemistry/flame-reaction">炎色反応ビジュアルシミュレーター</Link>
                </h3>
                <p className="text-gray-500 pl-4">
                  金属塩類のボトルの選択に応じて、炎の色の変化を視覚的に観察できます。暗記用の有名な語呂合わせも掲載。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] bg-purple-100 border border-purple-300 text-purple-800 px-1 py-0.5 rounded">化学基礎</span>
                  <Link href="/learn/chemistry/acid-base">指示薬・pH中和滴定シミュレーター</Link>
                </h3>
                <p className="text-gray-500 pl-4">
                  pHの強弱スライダーを操作し、主要なpH指示薬（フェノールフタレイン等）の色調変化を確認します。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] bg-blue-100 border border-blue-300 text-blue-800 px-1 py-0.5 rounded">情報I</span>
                  <Link href="/learn/information/pseudo-lang">共通テスト擬似言語（DNCL）エディタ</Link>
                </h3>
                <p className="text-gray-500 pl-4">
                  共通テストのプログラミング問題で使われる擬似言語（新DNCL）をブラウザ上で実行し、ステップ確認できます。
                </p>
              </div>

            </div>
          </div>

          {/* クイックツール案内 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="border border-gray-300 p-4 bg-gray-50/50">
              <h3 className="font-bold text-xs mb-2 text-slate-800 flex items-center gap-1">
                <span>■</span> <Link href="/tools/schedule">時間割予定表（勉強枠の作成）</Link>
              </h3>
              <p className="text-xs text-gray-500 leading-normal">
                1週間の自習スケジュールを1時限〜6時限の時間割形式で埋めて、ブラウザに保存・管理できます。
              </p>
            </div>

            <div className="border border-gray-300 p-4 bg-gray-50/50">
              <h3 className="font-bold text-xs mb-2 text-slate-800 flex items-center gap-1">
                <span>■</span> <Link href="/tools/calendar">受験カレンダー（日程メモ）</Link>
              </h3>
              <p className="text-xs text-gray-500 leading-normal">
                共通テストの重要日程の確認と、各自で受ける外部模試や私立大出願期日をカレンダーに登録します。
              </p>
            </div>

          </div>
        </div>

        {/* 右カラム：ToDoリスト (1/3) */}
        <div className="col-span-1">
          <div className="retro-box space-y-4">
            
            <div className="border-b border-gray-300 pb-2">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <span>■</span> 今日の自習ToDo
              </h2>
              <span className="text-[10px] text-gray-400 block mt-0.5">※ブラウザ（端末）に自動保存されます</span>
            </div>

            {/* ToDoフォーム */}
            <form onSubmit={addTodo} className="flex gap-2">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="例: 青チャート数学IA P10"
                className="flex-grow retro-input"
              />
              <button type="submit" className="retro-btn-classic shrink-0 font-bold">
                追加
              </button>
            </form>

            {/* ToDoリスト */}
            <ul className="space-y-2 text-xs">
              {todos.map(todo => (
                <li 
                  key={todo.id}
                  className="flex items-start justify-between gap-2 p-2 bg-gray-50 border border-gray-200"
                >
                  <label className="flex items-start gap-2 cursor-pointer flex-grow min-w-0">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="mt-0.5 shrink-0"
                    />
                    <span className={`break-words ${todo.completed ? 'line-through text-gray-400' : 'text-slate-700'}`}>
                      {todo.text}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-[10px] text-red-500 hover:text-red-700 font-bold px-1"
                    title="削除"
                  >
                    削除
                  </button>
                </li>
              ))}
              {todos.length === 0 && (
                <div className="text-center py-6 text-gray-400 italic">
                  登録されているやることがありません。
                </div>
              )}
            </ul>

            {/* 統計表示 */}
            {todos.length > 0 && (
              <div className="text-[10px] text-gray-500 text-right pt-2 border-t border-dashed border-gray-200">
                状況: {todos.filter(t => t.completed).length} / {todos.length} 完了
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}