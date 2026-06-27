import { MockExamData } from './types';

export const yozemiEvents: MockExamData[] = [
  { 
    id: 'yozemi-1', 
    title: '第1回 代ゼミ全国共通テスト模試', 
    provider: '代ゼミ', 
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-04-15',
      applicationEnd: '2026-05-10',
      examDates: ['2026-05-24'],
      resultRelease: '2026-06-20'
    }
  },
  {
    id: 'yozemi-kanmuri-waseda-1',
    title: '早大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '早稲田大学',
    schedule: {
      applicationStart: '2026-09-01',
      applicationEnd: '2026-10-15',
      examDates: ['2026-11-01'],
      resultRelease: '2026-11-25'
    }
  }
];
