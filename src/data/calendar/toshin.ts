import { MockExamData } from './types';

export const toshinEvents: MockExamData[] = [
  { 
    id: 'toshin-1', 
    title: '第2回 共通テスト本番レベル模試', 
    provider: '東進', 
    targetGrades: ['高3・高卒', '高2', '高1'],
    schedule: {
      applicationStart: '2026-03-01',
      applicationEnd: '2026-04-20',
      examDates: ['2026-04-26'],
      resultRelease: '2026-05-05'
    }
  },
  // 冠模試サンプル
  {
    id: 'toshin-kanmuri-kyodai-1',
    title: '第1回 京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '京都大学',
    schedule: {
      applicationStart: '2026-05-01',
      applicationEnd: '2026-06-15',
      examDates: ['2026-06-21'],
      resultRelease: '2026-07-01'
    }
  }
];
