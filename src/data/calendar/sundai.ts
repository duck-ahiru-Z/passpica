import { MockExamData } from './types';

export const sundaiEvents: MockExamData[] = [
  // --- 駿台全国模試 ---
  {
    id: 'sundai-zenkoku-3-1',
    title: '第1回 駿台全国模試', // 
    provider: '駿台',
    targetGrades: ['高3・高卒'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-05-31'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-zenkoku-3-2',
    title: '第2回 駿台全国模試', // 
    provider: '駿台',
    targetGrades: ['高3・高卒'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-09-27'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-zenkoku-2-1',
    title: '第1回 高2駿台全国模試', // 
    provider: '駿台',
    targetGrades: ['高2'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-06-07'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-zenkoku-2-2',
    title: '第2回 高2駿台全国模試', // 
    provider: '駿台',
    targetGrades: ['高2'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-10-04'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-zenkoku-2-3',
    title: '第3回 高2駿台全国模試', // 
    provider: '駿台',
    targetGrades: ['高2'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2027-02-07'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-zenkoku-1-1',
    title: '第1回 高1駿台全国模試', // 
    provider: '駿台',
    targetGrades: ['高1'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-06-14'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-zenkoku-1-2',
    title: '第2回 高1駿台全国模試', // 
    provider: '駿台',
    targetGrades: ['高1'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-10-18'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-zenkoku-1-3',
    title: '第3回 高1駿台全国模試', // 
    provider: '駿台',
    targetGrades: ['高1'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2027-02-14'], // 
      resultRelease: ''
    }
  },

  // --- 駿台atama+共通テスト型模試 ---
  {
    id: 'sundai-atama-common-1',
    title: '第1回 駿台atama+共通テスト模試', // 
    provider: '駿台',
    targetGrades: ['高3・高卒'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-05-07'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-atama-common-2',
    title: '第2回 駿台atama+共通テスト模試', // 
    provider: '駿台',
    targetGrades: ['高3・高卒'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-07-19'], // 
      resultRelease: ''
    }
  },
  {
    id: 'sundai-atama-pre-common',
    title: '駿台atama+プレ共通テスト', // 
    provider: '駿台',
    targetGrades: ['高3・高卒'], // 
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-12-06'], // 
      resultRelease: ''
    }
  },

  // --- 駿台・ベネッセ模試 ---
  {
    id: 'sundai-benesse-common-1',
    title: '第1回 駿台・ベネッセ大学入学共通テスト模試', // [cite: 26]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 26]
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-09-13'], // [cite: 26]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-benesse-desc-2',
    title: '第2回 駿台・ベネッセ記述模試', // [cite: 26]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 26]
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-10-11'], // [cite: 26]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-benesse-common-3',
    title: '第3回 駿台・ベネッセ大学入学共通テスト模試', // [cite: 26]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 26]
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-01'], // [cite: 26]
      resultRelease: ''
    }
  },

  // --- 高校アドバンスト ---
  {
    id: 'sundai-advanced-2',
    title: '高2アドバンスト(Z会・駿台共催)', // [cite: 27]
    provider: '駿台',
    targetGrades: ['高2'], // [cite: 27]
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-01'], // [cite: 27]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-advanced-1',
    title: '高1アドバンスト(Z会・駿台共催)', // [cite: 27]
    provider: '駿台',
    targetGrades: ['高1'], // [cite: 27]
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2027-01-24'], // [cite: 27]
      resultRelease: ''
    }
  },

  // --- 冠模試（大学別入試実戦模試・大学別入試プレ） ---
  {
    id: 'sundai-kanmuri-todai-1',
    title: '第1回 東大入試実戦模試(駿台・Z会共催)', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '東京大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-08-09'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-todai-2',
    title: '第2回 東大入試実戦模試(駿台・Z会共催)', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '東京大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-15'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-kyodai-1',
    title: '第1回 京大入試実戦模試(駿台・Z会共催)', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '京都大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-08-23'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-kyodai-2',
    title: '第2回 京大入試実戦模試(駿台・Z会共催)', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '京都大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-22'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-hokudai',
    title: '北大入試実戦模試', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '北海道大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-08'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-tohoku',
    title: '東北大入試実戦模試', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '東北大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-22'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-meidai',
    title: '名大入試実戦模試', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '名古屋大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-10-25'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-handai',
    title: '阪大入試実戦模試', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '大阪大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-03'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-kobedai',
    title: '神戸大入試実戦模試', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '神戸大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-15'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-kyudai',
    title: '九大入試実戦模試', // [cite: 29]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 29]
    isKanmuri: true,
    targetUniversity: '九州大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-10-18'], // [cite: 29]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-waseda',
    title: '早大入試プレ(代ゼミ・駿台共催)', // [cite: 30]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 30]
    isKanmuri: true,
    targetUniversity: '早稲田大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-10-18'], // [cite: 30]
      resultRelease: ''
    }
  },
  {
    id: 'sundai-kanmuri-keio',
    title: '慶大入試プレ(代ゼミ・駿台共催)', // [cite: 30]
    provider: '駿台',
    targetGrades: ['高3・高卒'], // [cite: 30]
    isKanmuri: true,
    targetUniversity: '慶應義塾大学',
    schedule: {
      applicationStart: '',
      applicationEnd: '',
      examDates: ['2026-11-03'], // [cite: 30]
      resultRelease: ''
    }
  }
];