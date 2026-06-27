import { MockExamData } from './types';

export const kawaiEvents: MockExamData[] = [
  { 
    id: 'kawai-1', 
    title: '第1回 全統共通テスト模試', 
    provider: '河合塾', 
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-04-01',
      applicationEnd: '2026-04-20',
      examDates: ['2026-05-03'],
      resultRelease: '2026-06-05'
    }
  },
  { 
    id: 'kawai-2', 
    title: '第1回 全統記述模試', 
    provider: '河合塾', 
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-04-01',
      applicationEnd: '2026-04-20',
      examDates: ['2026-05-10'],
      resultRelease: '2026-06-12'
    }
  },
  { 
    id: 'kawai-3', 
    title: '第2回 全統共通テスト模試', 
    provider: '河合塾', 
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-06-01',
      applicationEnd: '2026-07-20',
      examDates: ['2026-08-02'],
      resultRelease: '2026-09-05'
    }
  },
  // 冠模試のサンプル
  {
    id: 'kawai-kanmuri-todai-1',
    title: '第1回 東大オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東京大学',
    schedule: {
      applicationStart: '2026-06-01',
      applicationEnd: '2026-07-20',
      examDates: ['2026-08-08', '2026-08-09'],
      resultRelease: '2026-09-10'
    }
  },
  {
    id: 'kawai-kanmuri-kyodai-1',
    title: '第1回 京大オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '京都大学',
    schedule: {
      applicationStart: '2026-06-01',
      applicationEnd: '2026-07-20',
      examDates: ['2026-08-16'],
      resultRelease: '2026-09-15'
    }
  }
];
