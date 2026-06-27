import { ExamEvent } from './types';

// ※ 以下は2026年度のサンプルデータです。毎年更新してください。
export const toshinEvents: ExamEvent[] = [
  { id: 'toshin-1', date: '2026-04-26', title: '第2回 共通テスト本番レベル模試', type: 'mock', provider: '東進', targetGrades: ['高3・高卒', '高2', '高1'] },
  { id: 'toshin-2', date: '2026-06-21', title: '全国統一高校生テスト', type: 'mock', provider: '東進', targetGrades: ['高3・高卒', '高2', '高1'] },
  { id: 'toshin-3', date: '2026-08-23', title: '第3回 共通テスト本番レベル模試', type: 'mock', provider: '東進', targetGrades: ['高3・高卒', '高2', '高1'] },
  { id: 'toshin-4', date: '2026-11-01', title: '全国統一高校生テスト', type: 'mock', provider: '東進', targetGrades: ['高3・高卒', '高2', '高1'] },
  { id: 'toshin-5', date: '2026-12-13', title: '最終 共通テスト本番レベル模試', type: 'mock', provider: '東進', targetGrades: ['高3・高卒', '高2', '高1'] },
];
