export type TargetGrade = '高1' | '高2' | '高3・高卒';
export type ExamCategory = 'national' | 'mock' | 'custom';
export type ProviderType = '河合塾' | '駿台' | '東進' | '代ゼミ' | '進研模試' | 'その他';

// 冠模試の対象大学（固定・統一用）
export type TargetUniversity = 
  | '東京大学' | '京都大学' | '北海道大学' | '東北大学' 
  | '名古屋大学' | '大阪大学' | '九州大学' 
  | '東京工業大学' | '一橋大学' | '神戸大学' 
  | '早稲田大学' | '慶應義塾大学' | 'その他';

export type EventBadge = '申込開始' | '申込締切' | '試験日' | '成績返却' | '公式' | '自分';

// UIでカレンダーの1行として表示するためのデータ
export interface CalendarDisplayEvent {
  id: string;          // 一意なID (例: "kawai-1-app-start", "c_12345")
  date: string;
  title: string;       // イベント名 (例: "第1回 全統共通テスト模試")
  type: ExamCategory;
  provider?: string;
  badge?: EventBadge;
  parentMockId?: string; // どの模試から生成されたか (削除や連携用)
}

// データファイルで定義する模試のマスターデータ
export interface MockExamData {
  id: string;
  title: string;
  provider: ProviderType;
  targetGrades: TargetGrade[];
  isKanmuri?: boolean;          // 冠模試かどうか
  targetUniversity?: TargetUniversity; // 冠模試の場合の対象大学
  schedule: {
    applicationStart?: string;
    applicationEnd?: string;
    examDates: string[];        // 複数日ある場合は複数
    resultRelease?: string;
  };
}

// 共通テスト等の固定イベントデータ
export interface NationalExamData {
  id: string;
  title: string;
  date: string;
  badge?: EventBadge;
}
