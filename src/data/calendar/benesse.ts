import { MockExamData } from './types';

export const benesseEvents: MockExamData[] = [
  { 
    id: 'benesse-1', 
    title: '第1回 ベネッセ・駿台マーク模試', 
    provider: '進研模試', 
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-07-01',
      applicationEnd: '2026-08-31',
      examDates: ['2026-09-15'], // ※学校実施の場合は幅がありますが、代表日として
      resultRelease: '2026-10-20'
    }
  }
];
