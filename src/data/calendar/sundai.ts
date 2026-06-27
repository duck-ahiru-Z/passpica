import { MockExamData } from './types';

export const sundaiEvents: MockExamData[] = [
  { 
    id: 'sundai-1', 
    title: '第1回 駿台全国模試', 
    provider: '駿台', 
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-04-10',
      applicationEnd: '2026-05-20',
      examDates: ['2026-06-07'],
      resultRelease: '2026-07-05'
    }
  },
  // 冠模試サンプル
  {
    id: 'sundai-kanmuri-todai-1',
    title: '第1回 東大入試実戦模試',
    provider: '駿台',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東京大学',
    schedule: {
      applicationStart: '2026-06-10',
      applicationEnd: '2026-07-25',
      examDates: ['2026-08-15', '2026-08-16'],
      resultRelease: '2026-09-12'
    }
  }
];
