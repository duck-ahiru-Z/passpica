import { MockExamData } from './types';

export const toshinEvents: MockExamData[] = [
  // --- 1月・2月・3月 (2026年) ---
  {
    id: 'toshin-1',
    title: '共通テスト体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1', '中3'],
    schedule: { applicationStart: '', applicationEnd: '2026-01-16', examDates: ['2026-01-18', '2026-01-19'], resultRelease: '' }
  },
  {
    id: 'toshin-2',
    title: 'プレ回 早大・慶大レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-02-05', examDates: ['2026-02-08'], resultRelease: '' }
  },
  {
    id: 'toshin-3',
    title: 'プレ回 上理・明青立法中レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-02-05', examDates: ['2026-02-08'], resultRelease: '' }
  },
  {
    id: 'toshin-4',
    title: 'プレ回 関関同立レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-02-05', examDates: ['2026-02-08'], resultRelease: '' }
  },
  {
    id: 'toshin-5',
    title: '第1回 共通テスト本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2'],
    schedule: { applicationStart: '', applicationEnd: '2026-02-19', examDates: ['2026-02-22'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-todai-experience',
    title: '東大入試同日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2026-02-22', examDates: ['2026-02-25', '2026-02-26'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-tohoku-experience',
    title: '東北大入試同日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東北大学',
    schedule: { applicationStart: '', applicationEnd: '2026-02-22', examDates: ['2026-02-25', '2026-02-26'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyodai-experience',
    title: '京大入試同日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2026-02-22', examDates: ['2026-02-25', '2026-02-26'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyudai-experience',
    title: '九大入試直近日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '九州大学',
    schedule: { applicationStart: '', applicationEnd: '2026-02-26', examDates: ['2026-03-01'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-meidai-experience',
    title: '名大入試直近日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '名古屋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-02-26', examDates: ['2026-03-01'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hokudai-experience',
    title: '北大入試直近日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '北海道大学',
    schedule: { applicationStart: '', applicationEnd: '2026-03-05', examDates: ['2026-03-08'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-handai-experience',
    title: '阪大入試直近日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '大阪大学',
    schedule: { applicationStart: '', applicationEnd: '2026-03-05', examDates: ['2026-03-08'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-isct-experience',
    title: '東京科学大入試直近日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京科学大学',
    schedule: { applicationStart: '', applicationEnd: '2026-03-05', examDates: ['2026-03-08'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hitotsubashi-experience',
    title: '一橋大入試直近日体験受験',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '一橋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-03-05', examDates: ['2026-03-08'], resultRelease: '' }
  },

  // --- 4月・5月 ---
  {
    id: 'toshin-6',
    title: '第1回 大学合格基礎力判定テスト',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2', '高1'],
    schedule: { applicationStart: '', applicationEnd: '2026-04-09', examDates: ['2026-04-12'], resultRelease: '' }
  },
  {
    id: 'toshin-7',
    title: '第2回 共通テスト本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2'],
    schedule: { applicationStart: '', applicationEnd: '2026-04-23', examDates: ['2026-04-26'], resultRelease: '' }
  },
  {
    id: 'toshin-8',
    title: '第1回 早大・慶大レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-05-21', examDates: ['2026-05-24'], resultRelease: '' }
  },
  {
    id: 'toshin-9',
    title: '第1回 全国国公立大 記述模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-05-21', examDates: ['2026-05-24'], resultRelease: '' }
  },
  {
    id: 'toshin-10',
    title: '第1回 上理・明青立法中レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-05-21', examDates: ['2026-05-24'], resultRelease: '' }
  },
  {
    id: 'toshin-11',
    title: '第1回 関関同立レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-05-21', examDates: ['2026-05-24'], resultRelease: '' }
  },

  // --- 6月 ---
  {
    id: 'toshin-kanmuri-todai-1',
    title: '第1回 東大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-04', examDates: ['2026-06-07'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-todai-high2-1',
    title: '第1回 高2東大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-04', examDates: ['2026-06-07'], resultRelease: '' }
  },
  {
    id: 'toshin-12',
    title: '全国統一高校生テスト',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2', '高1', '中3'],
    schedule: { applicationStart: '', applicationEnd: '2026-06-11', examDates: ['2026-06-14'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyodai-1',
    title: '第1回 京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-18', examDates: ['2026-06-21'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyodai-high2-1',
    title: '第1回 高2京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-18', examDates: ['2026-06-21'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hokudai-1',
    title: '第1回 北大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '北海道大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-18', examDates: ['2026-06-21'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hokudai-high2-1',
    title: '第1回 高2北大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '北海道大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-18', examDates: ['2026-06-21'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyudai-1',
    title: '第1回 九大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '九州大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-18', examDates: ['2026-06-21'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyudai-high2-1',
    title: '第1回 高2九大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '九州大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-18', examDates: ['2026-06-21'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hitotsubashi-1',
    title: '第1回 一橋大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '一橋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-25', examDates: ['2026-06-28'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hitotsubashi-high2-1',
    title: '第1回 高2一橋大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '一橋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-25', examDates: ['2026-06-28'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-isct-1',
    title: '第1回 東京科学大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東京科学大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-25', examDates: ['2026-06-28'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-isct-high2-1',
    title: '第1回 高2東京科学大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京科学大学',
    schedule: { applicationStart: '', applicationEnd: '2026-06-25', examDates: ['2026-06-28'], resultRelease: '' }
  },
  {
    id: 'toshin-13',
    title: '第1回 医学部82大学判定テスト',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-06-25', examDates: ['2026-06-28'], resultRelease: '' }
  },

  // --- 7月 ---
  {
    id: 'toshin-kanmuri-tohoku-1',
    title: '第1回 東北大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東北大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-02', examDates: ['2026-07-05'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-tohoku-high2-1',
    title: '第1回 高2東北大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東北大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-02', examDates: ['2026-07-05'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-meidai-1',
    title: '第1回 名大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '名古屋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-02', examDates: ['2026-07-05'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-meidai-high2-1',
    title: '第1回 高2名大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '名古屋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-02', examDates: ['2026-07-05'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-handai-1',
    title: '第1回 阪大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '大阪大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-02', examDates: ['2026-07-05'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-handai-high2-1',
    title: '第1回 高2阪大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '大阪大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-02', examDates: ['2026-07-05'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-chiba-1',
    title: '第1回 千葉大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '千葉大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-09', examDates: ['2026-07-12'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kobe-1',
    title: '第1回 神戸大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '神戸大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-09', examDates: ['2026-07-12'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hiroshima-1',
    title: '第1回 広島大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '広島大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-09', examDates: ['2026-07-12'], resultRelease: '' }
  },
  {
    id: 'toshin-14',
    title: '第2回 大学合格基礎力判定テスト',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2', '高1'],
    schedule: { applicationStart: '', applicationEnd: '2026-07-16', examDates: ['2026-07-19'], resultRelease: '' }
  },
  {
    id: 'toshin-15',
    title: '第2回 早大・慶大レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-07-17', examDates: ['2026-07-20'], resultRelease: '' }
  },
  {
    id: 'toshin-16',
    title: '第2回 全国国公立大 記述模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-07-17', examDates: ['2026-07-20'], resultRelease: '' }
  },
  {
    id: 'toshin-17',
    title: '第2回 上理・明青立法中レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-07-17', examDates: ['2026-07-20'], resultRelease: '' }
  },
  {
    id: 'toshin-18',
    title: '第2回 関関同立レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-07-17', examDates: ['2026-07-20'], resultRelease: '' }
  },
  {
    id: 'toshin-19',
    title: '第1回 高校レベル記述模試(高2)(高1)',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    schedule: { applicationStart: '', applicationEnd: '2026-07-23', examDates: ['2026-07-26'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyudai-2',
    title: '第2回 九大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '九州大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-23', examDates: ['2026-07-26'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyudai-high2-2',
    title: '第2回 高2九大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '九州大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-23', examDates: ['2026-07-26'], resultRelease: '' }
  },

  // --- 8月 ---
  {
    id: 'toshin-kanmuri-kyodai-2',
    title: '第2回 京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-30', examDates: ['2026-08-02'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyodai-high2-2',
    title: '第2回 高2京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-30', examDates: ['2026-08-02'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hitotsubashi-2',
    title: '第2回 一橋大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '一橋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-30', examDates: ['2026-08-02'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hitotsubashi-high2-2',
    title: '第2回 高2一橋大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '一橋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-30', examDates: ['2026-08-02'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-isct-2',
    title: '第2回 東京科学大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東京科学大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-30', examDates: ['2026-08-02'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-isct-high2-2',
    title: '第2回 高2東京科学大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京科学大学',
    schedule: { applicationStart: '', applicationEnd: '2026-07-30', examDates: ['2026-08-02'], resultRelease: '' }
  },
  {
    id: 'toshin-20',
    title: '第3回 共通テスト本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2'],
    schedule: { applicationStart: '', applicationEnd: '2026-08-20', examDates: ['2026-08-23'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-todai-2',
    title: '第2回 東大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2026-08-27', examDates: ['2026-08-30'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-todai-high2-2',
    title: '第2回 高2東大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2026-08-27', examDates: ['2026-08-30'], resultRelease: '' }
  },

  // --- 9月 ---
  {
    id: 'toshin-kanmuri-meidai-2',
    title: '第2回 名大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '名古屋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-09-03', examDates: ['2026-09-06'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-meidai-high2-2',
    title: '第2回 高2名大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '名古屋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-09-03', examDates: ['2026-09-06'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-handai-2',
    title: '第2回 阪大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '大阪大学',
    schedule: { applicationStart: '', applicationEnd: '2026-09-03', examDates: ['2026-09-06'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-handai-high2-2',
    title: '第2回 高2阪大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '大阪大学',
    schedule: { applicationStart: '', applicationEnd: '2026-09-03', examDates: ['2026-09-06'], resultRelease: '' }
  },
  {
    id: 'toshin-21',
    title: '第3回 大学合格基礎力判定テスト',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2', '高1'],
    schedule: { applicationStart: '', applicationEnd: '2026-09-10', examDates: ['2026-09-13'], resultRelease: '' }
  },
  {
    id: 'toshin-22',
    title: '第3回 早大・慶大レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-09-17', examDates: ['2026-09-20'], resultRelease: '' }
  },
  {
    id: 'toshin-23',
    title: '第3回 全国国公立大 記述模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-09-17', examDates: ['2026-09-20'], resultRelease: '' }
  },
  {
    id: 'toshin-24',
    title: '第3回 上理・明青立法中レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-09-17', examDates: ['2026-09-20'], resultRelease: '' }
  },
  {
    id: 'toshin-25',
    title: '第3回 関関同立レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-09-17', examDates: ['2026-09-20'], resultRelease: '' }
  },

  // --- 10月 ---
  {
    id: 'toshin-kanmuri-kyodai-3',
    title: '第3回 京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-01', examDates: ['2026-10-04'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyodai-high2-3',
    title: '第3回 高2京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-01', examDates: ['2026-10-04'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-tohoku-2',
    title: '第2回 東北大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東北大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-01', examDates: ['2026-10-04'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-tohoku-high2-2',
    title: '第2回 高2東北大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東北大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-01', examDates: ['2026-10-04'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyudai-3',
    title: '第3回 九大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '九州大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-01', examDates: ['2026-10-04'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyudai-high2-3',
    title: '第3回 高2九大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '九州大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-01', examDates: ['2026-10-04'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-todai-3',
    title: '第3回 東大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-08', examDates: ['2026-10-11'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-todai-high2-3',
    title: '第3回 高2東大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-08', examDates: ['2026-10-11'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hokudai-2',
    title: '第2回 北大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '北海道大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-15', examDates: ['2026-10-18'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hokudai-high2-2',
    title: '第2回 高2北大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '北海道大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-15', examDates: ['2026-10-18'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-meidai-3',
    title: '第3回 名大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '名古屋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-15', examDates: ['2026-10-18'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-meidai-high2-3',
    title: '第3回 高2名大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '名古屋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-15', examDates: ['2026-10-18'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-handai-3',
    title: '第3回 阪大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '大阪大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-15', examDates: ['2026-10-18'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-handai-high2-3',
    title: '第3回 高2阪大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '大阪大学',
    schedule: { applicationStart: '', applicationEnd: '2026-10-15', examDates: ['2026-10-18'], resultRelease: '' }
  },
  {
    id: 'toshin-26',
    title: '第2回 医学部82大学判定テスト',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-10-22', examDates: ['2026-10-25'], resultRelease: '' }
  },

  // --- 11月・12月 ---
  {
    id: 'toshin-27',
    title: '全国統一高校生テスト',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2', '高1', '中3'],
    schedule: { applicationStart: '', applicationEnd: '2026-10-29', examDates: ['2026-11-01'], resultRelease: '' }
  },
  {
    id: 'toshin-28',
    title: '第4回 大学合格基礎力判定テスト',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2', '高1'],
    schedule: { applicationStart: '', applicationEnd: '2026-11-12', examDates: ['2026-11-15'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-chiba-2',
    title: '第2回 千葉大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '千葉大学',
    schedule: { applicationStart: '', applicationEnd: '2026-11-12', examDates: ['2026-11-15'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kobe-2',
    title: '第2回 神戸大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '神戸大学',
    schedule: { applicationStart: '', applicationEnd: '2026-11-12', examDates: ['2026-11-15'], resultRelease: '' }
  },
  {
    id: 'toshin-29',
    title: '第4回 早大・慶大レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-11-19', examDates: ['2026-11-22'], resultRelease: '' }
  },
  {
    id: 'toshin-30',
    title: '第4回 全国国公立大 記述模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-11-19', examDates: ['2026-11-22'], resultRelease: '' }
  },
  {
    id: 'toshin-31',
    title: '第4回 上理・明青立法中レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-11-19', examDates: ['2026-11-22'], resultRelease: '' }
  },
  {
    id: 'toshin-32',
    title: '第4回 関関同立レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2026-11-19', examDates: ['2026-11-22'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hiroshima-2',
    title: '第2回 広島大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '広島大学',
    schedule: { applicationStart: '', applicationEnd: '2026-11-26', examDates: ['2026-11-29'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hitotsubashi-3',
    title: '第3回 一橋大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '一橋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-11-26', examDates: ['2026-11-29'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-hitotsubashi-high2-3',
    title: '第3回 高2一橋大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '一橋大学',
    schedule: { applicationStart: '', applicationEnd: '2026-11-26', examDates: ['2026-11-29'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-isct-3',
    title: '第3回 東京科学大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東京科学大学',
    schedule: { applicationStart: '', applicationEnd: '2026-11-26', examDates: ['2026-11-29'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-isct-high2-3',
    title: '第3回 高2東京科学大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京科学大学',
    schedule: { applicationStart: '', applicationEnd: '2026-11-26', examDates: ['2026-11-29'], resultRelease: '' }
  },
  {
    id: 'toshin-33',
    title: '第2回 高校レベル記述模試(高2)(高1)',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    schedule: { applicationStart: '', applicationEnd: '2026-12-10', examDates: ['2026-12-13'], resultRelease: '' }
  },
  {
    id: 'toshin-34',
    title: '第4回 共通テスト本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2'],
    schedule: { applicationStart: '', applicationEnd: '2026-12-17', examDates: ['2026-12-20'], resultRelease: '' }
  },

  // --- 2027年1月・2月 ---
  {
    id: 'toshin-kanmuri-todai-4',
    title: '第4回(最終) 東大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2027-01-20', examDates: ['2027-01-23', '2027-01-24'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-todai-high2-4',
    title: '第4回(最終) 高2東大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '東京大学',
    schedule: { applicationStart: '', applicationEnd: '2027-01-20', examDates: ['2027-01-23', '2027-01-24'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyodai-4',
    title: '第4回(最終) 京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2027-01-20', examDates: ['2027-01-23', '2027-01-24'], resultRelease: '' }
  },
  {
    id: 'toshin-kanmuri-kyodai-high2-4',
    title: '第4回(最終) 高2京大本番レベル模試',
    provider: '東進',
    targetGrades: ['高2', '高1'],
    isKanmuri: true, targetUniversity: '京都大学',
    schedule: { applicationStart: '', applicationEnd: '2027-01-20', examDates: ['2027-01-23', '2027-01-24'], resultRelease: '' }
  },
  {
    id: 'toshin-35',
    title: '第5回(最終) 全国国公立大 記述模試',
    provider: '東進',
    targetGrades: ['高3・高卒'],
    schedule: { applicationStart: '', applicationEnd: '2027-01-21', examDates: ['2027-01-24'], resultRelease: '' }
  },
  {
    id: 'toshin-36',
    title: '第5回 大学合格基礎力判定テスト',
    provider: '東進',
    targetGrades: ['高3・高卒', '高2', '高1'],
    schedule: { applicationStart: '', applicationEnd: '2027-02-04', examDates: ['2027-02-07'], resultRelease: '' }
  }
];