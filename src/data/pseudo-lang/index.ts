import { sampleBasic } from './sampleBasic';
import { sampleIf } from './sampleIf';
import { sampleLoop } from './sampleLoop';
import { examBinarySearch } from './examBinarySearch';
import { exam2025HonshiFig4 } from './exam2025HonshiFig4';
import { exam2025HonshiFig5 } from './exam2025HonshiFig5';
import { exam2025TsuishiFig2 } from './exam2025TsuishiFig2';
import { exam2025TsuishiFig4 } from './exam2025TsuishiFig4';
import { exam2025TsuishiFig5 } from './exam2025TsuishiFig5';
import { exam2025TsuishiFig6 } from './exam2025TsuishiFig6';
import { exam2026Honshi } from './exam2026Honshi';
import { exam2026Tsuishi } from './exam2026Tsuishi';

export const TEMPLATES: Record<string, any> = {
  "blank": { code: "", isOneBased: false },
  "sample_basic": { code: sampleBasic, isOneBased: false },
  "sample_if": { code: sampleIf, isOneBased: false },
  "sample_loop": { code: sampleLoop, isOneBased: false },
  "exam_binary_search": { code: examBinarySearch, isOneBased: false },
  "exam_2025_honshi_fig4": exam2025HonshiFig4,
  "exam_2025_honshi_fig5": exam2025HonshiFig5,
  "exam_2025_tsuishi_fig2": exam2025TsuishiFig2,
  "exam_2025_tsuishi_fig4": exam2025TsuishiFig4,
  "exam_2025_tsuishi_fig5": exam2025TsuishiFig5,
  "exam_2025_tsuishi_fig6": exam2025TsuishiFig6,
  "exam_2026_honshi": { code: exam2026Honshi, isOneBased: true },
  "exam_2026_tsuishi": { code: exam2026Tsuishi, isOneBased: true },
};

export const TEMPLATE_OPTIONS = [
  { value: "exam_binary_search", label: "試作問題（二分探索）" },
  { value: "exam_2025_honshi_fig4", label: "2025年 本試験（図4）" },
  { value: "exam_2025_honshi_fig5", label: "2025年 本試験（図5）" },
  { value: "exam_2025_tsuishi_fig2", label: "2025年 追試験（図2）" },
  { value: "exam_2025_tsuishi_fig4", label: "2025年 追試験（図4）" },
  { value: "exam_2025_tsuishi_fig5", label: "2025年 追試験（図5）" },
  { value: "exam_2025_tsuishi_fig6", label: "2025年 追試験（図6）" },
  { value: "exam_2026_honshi", label: "2026年 本試験" },
  { value: "exam_2026_tsuishi", label: "2026年 追試験" },
  { value: "sample_basic", label: "基本構文と代入" },
  { value: "sample_if", label: "条件分岐（if文）" },
  { value: "sample_loop", label: "配列と繰り返し（for文）" },
  { value: "blank", label: "新規作成（空白）" }
];
