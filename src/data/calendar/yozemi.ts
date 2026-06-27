import { MockExamData } from './types';

export const yozemiEvents: MockExamData[] = [
  // --- 大学入学共通テスト入試プレ（高3・高卒生対象） ---
  {
    id: 'yozemi-common-1',
    title: '第1回 大学入学共通テスト入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-06-02',
      applicationEnd: '',
      examDates: ['2026-08-02'],
      resultRelease: '2026-09-24'
    }
  },
  {
    id: 'yozemi-common-2',
    title: '第2回 大学入学共通テスト入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-09-22',
      applicationEnd: '',
      examDates: ['2026-11-22'],
      resultRelease: '2026-12-22'
    }
  },

  // --- 冠模試（高3・高卒生対象） ---
  {
    id: 'yozemi-kanmuri-todai-1',
    title: '第1回 東大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東京大学',
    schedule: {
      applicationStart: '2026-05-18',
      applicationEnd: '',
      examDates: ['2026-07-18', '2026-07-19'],
      resultRelease: '2026-09-02'
    }
  },
  {
    id: 'yozemi-kanmuri-kyodai-1',
    title: '第1回 京大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '京都大学',
    schedule: {
      applicationStart: '2026-05-26',
      applicationEnd: '',
      examDates: ['2026-07-26'],
      resultRelease: '2026-09-14'
    }
  },
  {
    id: 'yozemi-kanmuri-kyudai',
    title: '九大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '九州大学',
    schedule: {
      applicationStart: '2026-06-09',
      applicationEnd: '',
      examDates: ['2026-08-09'],
      resultRelease: '2026-09-29'
    }
  },
  {
    id: 'yozemi-kanmuri-tohoku',
    title: '東北大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東北大学',
    schedule: {
      applicationStart: '2026-06-16',
      applicationEnd: '',
      examDates: ['2026-08-16'],
      resultRelease: '2026-09-25'
    }
  },
  {
    id: 'yozemi-kanmuri-handai',
    title: '阪大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '大阪大学',
    schedule: {
      applicationStart: '2026-06-23',
      applicationEnd: '',
      examDates: ['2026-08-23'],
      resultRelease: '2026-10-19'
    }
  },
  {
    id: 'yozemi-kanmuri-meidai',
    title: '名大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '名古屋大学',
    schedule: {
      applicationStart: '2026-06-15',
      applicationEnd: '',
      examDates: ['2026-09-27'],
      resultRelease: '2026-11-16'
    }
  },
  {
    id: 'yozemi-kanmuri-waseda',
    title: '早大入試プレ【代ゼミ・駿台共催】',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '早稲田大学',
    schedule: {
      applicationStart: '2026-08-18',
      applicationEnd: '',
      examDates: ['2026-10-18'],
      resultRelease: '2026-12-07'
    }
  },
  {
    id: 'yozemi-kanmuri-keio',
    title: '慶大入試プレ【代ゼミ・駿台共催】',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '慶應義塾大学',
    schedule: {
      applicationStart: '2026-09-03',
      applicationEnd: '',
      examDates: ['2026-11-03'],
      resultRelease: '2026-12-14'
    }
  },
  {
    id: 'yozemi-kanmuri-hokudai',
    title: '北大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '北海道大学',
    schedule: {
      applicationStart: '2026-09-08',
      applicationEnd: '',
      examDates: ['2026-11-08'],
      resultRelease: '2026-12-21'
    }
  },
  {
    id: 'yozemi-kanmuri-kyodai-2',
    title: '第2回 京大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '京都大学',
    schedule: {
      applicationStart: '2026-09-08',
      applicationEnd: '',
      examDates: ['2026-11-08'],
      resultRelease: '2026-12-23'
    }
  },
  {
    id: 'yozemi-kanmuri-todai-2',
    title: '第2回 東大入試プレ',
    provider: '代ゼミ',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東京大学',
    schedule: {
      applicationStart: '2026-09-14',
      applicationEnd: '',
      examDates: ['2026-11-14', '2026-11-15'],
      resultRelease: '2026-12-22'
    }
  },

  // --- 高1・高2生対象 ---
  {
    id: 'yozemi-high12-1',
    title: '第1回 全国高2模試・全国高1模試（マーク式）',
    provider: '代ゼミ',
    targetGrades: ['高2', '高1'],
    schedule: {
      applicationStart: '2026-07-20',
      applicationEnd: '',
      examDates: ['2026-09-20'],
      resultRelease: '2026-10-27'
    }
  },
  {
    id: 'yozemi-high12-2',
    title: '第2回 全国高2模試・全国高1模試（マーク式・共通テスト対応）',
    provider: '代ゼミ',
    targetGrades: ['高2', '高1'],
    schedule: {
      applicationStart: '2027-01-07',
      applicationEnd: '',
      examDates: ['2027-03-07'],
      resultRelease: '2027-04-20'
    }
  }
];