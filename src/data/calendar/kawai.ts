import { MockExamData } from './types';

export const kawaiEvents: MockExamData[] = [
  // --- 高3・高卒生対象 ---
  {
    id: 'kawai-prime-stage',
    title: 'プライムステージ',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-04-01',
      applicationEnd: '',
      examDates: ['2026-04-26'],
      resultRelease: '2026-06-03'
    }
  },
  {
    id: 'kawai-1',
    title: '第1回 全統共通テスト模試 (マーク式)',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-04-01',
      applicationEnd: '',
      examDates: ['2026-05-03'],
      resultRelease: '2026-05-29'
    }
  },
  {
    id: 'kawai-2',
    title: '第1回 全統記述模試 (記述式・論述式)',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-04-01',
      applicationEnd: '',
      examDates: ['2026-05-10'],
      resultRelease: '2026-06-15'
    }
  },
  {
    id: 'kawai-3',
    title: '第2回 全統共通テスト模試 (マーク式)',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-06-17',
      applicationEnd: '',
      examDates: ['2026-07-26'],
      resultRelease: '2026-09-07'
    }
  },
  {
    id: 'kawai-4',
    title: '第2回 全統記述模試 (記述式・論述式)',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-06-17',
      applicationEnd: '',
      examDates: ['2026-08-23'],
      resultRelease: '2026-10-13'
    }
  },
  {
    id: 'kawai-5',
    title: '第3回 全統記述模試 (記述式・論述式)',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-10-04'],
      resultRelease: '2026-11-20'
    }
  },
  {
    id: 'kawai-6',
    title: '第3回 全統共通テスト模試 (マーク式)',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-10-18'],
      resultRelease: '2026-11-16'
    }
  },
  {
    id: 'kawai-7',
    title: '全統プレ共通テスト (マーク式)',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-15'],
      resultRelease: '2026-12-17'
    }
  },

  // --- 冠模試（高3・高卒生対象） ---
  {
    id: 'kawai-kanmuri-todai-1',
    title: '第1回 東大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東京大学',
    schedule: {
      applicationStart: '2026-06-17',
      applicationEnd: '',
      examDates: ['2026-08-02'],
      resultRelease: '2026-09-15'
    }
  },
  {
    id: 'kawai-kanmuri-kyodai-1',
    title: '第1回 京大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '京都大学',
    schedule: {
      applicationStart: '2026-06-17',
      applicationEnd: '',
      examDates: ['2026-08-09'],
      resultRelease: '2026-09-18'
    }
  },
  {
    id: 'kawai-kanmuri-meidai-1',
    title: '第1回 名大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '名古屋大学',
    schedule: {
      applicationStart: '2026-06-17',
      applicationEnd: '',
      examDates: ['2026-08-09'],
      resultRelease: '2026-09-16'
    }
  },
  {
    id: 'kawai-kanmuri-todai-2',
    title: '第2回 東大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東京大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-10-25'],
      resultRelease: '2026-12-02'
    }
  },
  {
    id: 'kawai-kanmuri-kyodai-2',
    title: '第2回 京大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '京都大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-01'],
      resultRelease: '2026-12-11'
    }
  },
  {
    id: 'kawai-kanmuri-hokudai',
    title: '北大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '北海道大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-03'],
      resultRelease: '2026-12-08'
    }
  },
  {
    id: 'kawai-kanmuri-kyudai',
    title: '九大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '九州大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-03'],
      resultRelease: '2026-12-09'
    }
  },
  {
    id: 'kawai-kanmuri-hitotsubashi',
    title: '一橋大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '一橋大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-03'],
      resultRelease: '2026-12-09'
    }
  },
  {
    id: 'kawai-kanmuri-isct',
    title: '東京科学大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東京科学大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-03'],
      resultRelease: '2026-12-09'
    }
  },
  {
    id: 'kawai-kanmuri-kobe',
    title: '神大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '神戸大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-03'],
      resultRelease: '2026-12-11'
    }
  },
  {
    id: 'kawai-kanmuri-tohoku',
    title: '東北大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '東北大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-08'],
      resultRelease: '2026-12-15'
    }
  },
  {
    id: 'kawai-kanmuri-handai',
    title: '阪大入試オープン',
    provider: '河合塾',
    targetGrades: ['高3・高卒'],
    isKanmuri: true,
    targetUniversity: '大阪大学',
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-11-15'],
      resultRelease: '2026-12-17'
    }
  },

  // --- 高1・高2生対象 ---
  {
    id: 'kawai-high12-1',
    title: '第1回 全統高2模試・全統高1模試 (記述式)',
    provider: '河合塾',
    targetGrades: ['高2', '高1'],
    schedule: {
      applicationStart: '2026-04-01',
      applicationEnd: '',
      examDates: ['2026-05-17'],
      resultRelease: '2026-06-24'
    }
  },
  {
    id: 'kawai-high12-2',
    title: '第2回 全統高2模試・全統高1模試 (記述式)',
    provider: '河合塾',
    targetGrades: ['高2', '高1'],
    schedule: {
      applicationStart: '2026-06-17',
      applicationEnd: '',
      examDates: ['2026-08-16'],
      resultRelease: '2026-09-30'
    }
  },
  {
    id: 'kawai-high1-prime',
    title: '高1プライムステージ',
    provider: '河合塾',
    targetGrades: ['高1'],
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-10-11'],
      resultRelease: '2026-11-26'
    }
  },
  {
    id: 'kawai-high12-3',
    title: '第3回 全統高2模試・全統高1模試 (記述式)',
    provider: '河合塾',
    targetGrades: ['高2', '高1'],
    schedule: {
      applicationStart: '2026-09-16',
      applicationEnd: '',
      examDates: ['2026-10-25'],
      resultRelease: '2026-12-01'
    }
  },
  {
    id: 'kawai-high12-4',
    title: '全統記述高2模試・第4回 全統高1模試 (記述式)',
    provider: '河合塾',
    targetGrades: ['高2', '高1'],
    schedule: {
      applicationStart: '2026-12-16',
      applicationEnd: '',
      examDates: ['2027-01-24'],
      resultRelease: '2027-02-26'
    }
  },
  {
    id: 'kawai-high2-common',
    title: '全統共通テスト高2模試 (マーク式)',
    provider: '河合塾',
    targetGrades: ['高2'],
    schedule: {
      applicationStart: '2026-12-16',
      applicationEnd: '',
      examDates: ['2027-01-31'],
      resultRelease: '2027-02-25'
    }
  }
];