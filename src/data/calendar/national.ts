import { ExamEvent } from './types';

export const nationalEvents: ExamEvent[] = [
  { id: 'fixed-1', date: '2026-09-28', title: '共通テスト出願受付 開始', type: 'national', isFixed: true },
  { id: 'fixed-2', date: '2026-10-08', title: '共通テスト出願受付 締切', type: 'national', isFixed: true },
  { id: 'fixed-6', date: '2027-01-16', title: '令和9年度 大学入学共通テスト 1日目', type: 'national', isFixed: true },
  { id: 'fixed-7', date: '2027-01-17', title: '令和9年度 大学入学共通テスト 2日目', type: 'national', isFixed: true },
  { id: 'fixed-8', date: '2027-02-25', title: '国公立大学 二次試験 前期日程', type: 'national', isFixed: true },
  { id: 'fixed-9', date: '2027-03-12', title: '国公立大学 二次試験 後期日程', type: 'national', isFixed: true }
];
