export type ExamCategory = 'national' | 'mock' | 'custom';
export type TargetGrade = '高1' | '高2' | '高3・高卒';

export interface ExamEvent {
  id: string;
  date: string;
  title: string;
  type: ExamCategory;
  isFixed?: boolean; // 共通テストなど、デフォルトで表示するもの
  provider?: string; // 河合塾、駿台など
  targetGrades?: TargetGrade[]; // 対象学年
}
