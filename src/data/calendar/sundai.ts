import { ExamEvent } from './types';

// ※ 以下は2026年度のサンプルデータです。毎年更新してください。
export const sundaiEvents: ExamEvent[] = [
  { id: 'sundai-1', date: '2026-06-07', title: '第1回 駿台全国模試', type: 'mock', provider: '駿台', targetGrades: ['高3・高卒'] },
  { id: 'sundai-2', date: '2026-06-14', title: '第1回 駿台高1全国模試', type: 'mock', provider: '駿台', targetGrades: ['高1'] },
  { id: 'sundai-3', date: '2026-06-14', title: '第1回 駿台高2全国模試', type: 'mock', provider: '駿台', targetGrades: ['高2'] },
  { id: 'sundai-4', date: '2026-09-20', title: '第2回 駿台全国模試', type: 'mock', provider: '駿台', targetGrades: ['高3・高卒'] },
  { id: 'sundai-5', date: '2026-10-11', title: '第2回 駿台高1全国模試', type: 'mock', provider: '駿台', targetGrades: ['高1'] },
  { id: 'sundai-6', date: '2026-10-11', title: '第2回 駿台高2全国模試', type: 'mock', provider: '駿台', targetGrades: ['高2'] },
  { id: 'sundai-7', date: '2026-12-06', title: '駿台 共通テストプレテスト', type: 'mock', provider: '駿台', targetGrades: ['高3・高卒'] },
];
