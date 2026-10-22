"use client";

import { useState } from 'react';
import Link from 'next/link';

interface LearningContent {
  slug: string;
  subject: 'math' | 'chemistry' | 'information' | 'english' | 'physics';
  subjectJp: string;
  field: string;
  title: string;
  description: string;
  difficulty: '基礎' | '標準' | '応用';
  type: 'ビジュアル図解' | '実験シミュレータ' | '製法フロー' | '系統分析' | '無限計算ドリル' | '無限演習';
  link: string;
}

const CONTENTS: LearningContent[] = [

  {
    slug: 'mathbc-mixed-drill', subject: 'math', subjectJp: '数学B・C', field: '数学B・C総合（解法選択）',
    title: '数学B・C 総合・解法選択ランダムドリル',
    description: '数列・数列の和・ベクトル・複素数平面・図形と方程式・統計的な推測を、分野固定または全体ランダムで練習。',
    difficulty: '標準', type: '無限計算ドリル', link: '/learn/math/mathbc-mixed-drill'
  },

  {
    slug: 'matha-mixed-drill', subject: 'math', subjectJp: '数学A', field: '数学A総合（解法選択）',
    title: '数学A 総合・解法選択ランダムドリル',
    description: '場合の数・確率・整数・図形の性質を、分野固定または数学A全体ランダムで練習。',
    difficulty: '標準', type: '無限計算ドリル', link: '/learn/math/matha-mixed-drill'
  },

  {
    slug: 'math2-mixed-drill', subject: 'math', subjectJp: '数学II', field: '数学II総合（解法選択）',
    title: '数学II 総合・解法選択ランダムドリル',
    description: '微分積分・三角関数・指数対数・図形と方程式を、単元固定または全体ランダムで練習。',
    difficulty: '標準', type: '無限計算ドリル', link: '/learn/math/math2-mixed-drill'
  },

  {
    slug: 'calculus3-integral-drill',
    subject: 'math',
    subjectJp: '数学III',
    field: '積分法（解法選択）',
    title: '数学III 積分法・解法選択ドリル',
    description: 'べき関数の定積分・面積、置換積分・部分積分・部分分数分解・三角関数・平方根を含む積分を、個別練習と全パターンランダムで反復します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus3-integral-drill'
  },
  {
    slug: 'calculus3-differentiation-drill',
    subject: 'math',
    subjectJp: '数学III',
    field: '微分法（解法選択）',
    title: '数学III 微分法・解法選択ドリル',
    description: '合成関数・積・対数・媒介変数・陰関数の微分を、個別練習と全パターンランダムで反復します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus3-differentiation-drill'
  },
  {
    slug: 'calculus3-limit-drill',
    subject: 'math',
    subjectJp: '数学III',
    field: '極限（解法選択）',
    title: '数学III 極限・解法選択ドリル',
    description: '因数分解・有理化・最高次比較・はさみうち・数列の極限を、個別練習と全パターンランダムで反復します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus3-limit-drill'
  },
  {
    slug: 'calculus3-area-volume-drill',
    subject: 'math',
    subjectJp: '数学III',
    field: '積分法（面積・体積）',
    title: '数学III 面積・体積・曲線の長さドリル',
    description: '2曲線間の面積、x軸・y軸回転体、曲線の長さを個別練習と全パターンランダムで反復します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus3-area-volume-drill'
  },
  {
    slug: 'calculus3-mixed-drill',
    subject: 'math',
    subjectJp: '数学III',
    field: '数学III総合（解法選択）',
    title: '数学III 総合・解法選択ランダムドリル',
    description: '極限・微分法・積分法・面積体積・微分方程式から、問題の形に合う最初の解法を判断する上位混合演習です。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus3-mixed-drill'
  },
  {
    slug: 'calculus3-differential-equation-drill',
    subject: 'math',
    subjectJp: '数学III',
    field: '微分方程式（初歩）',
    title: '数学III 微分方程式・初歩計算ドリル',
    description: '変数分離・初期条件・指数成長・速度から位置を、個別練習と全パターンランダムで反復します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus3-differential-equation-drill'
  },
  {
    slug: 'calculus3-curve-analysis-drill',
    subject: 'math',
    subjectJp: '数学III',
    field: '微分法（曲線分析）',
    title: '数学III 曲線分析・解法選択ドリル',
    description: '増減・極大極小・凹凸・接線・速度加速度・法線を個別練習し、実戦では全パターンを混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus3-curve-analysis-drill'
  },
  {
    slug: 'mole-calculation-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '物質量・反応計算',
    title: '化学 物質量・反応計算ドリル',
    description: '物質量・モル濃度・希釈・気体・反応量比・制限試薬・pH・収率を個別練習と全パターンランダムで反復します。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/chemistry/mole-calculation-drill'
  },
  {
    slug: 'titration-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '酸と塩基・中和滴定',
    title: '化学 中和滴定・濃度計算ドリル',
    description: '一価・二価の酸塩基や反応係数比を個別練習し、全パターンの混合問題で中和点から濃度を求めます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/chemistry/titration-drill'
  },
  {
    slug: 'indicator-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '酸と塩基・中和指示薬',
    title: '化学 中和指示薬・色判定ドリル',
    description: 'フェノールフタレイン・リトマス液・メチルオレンジを個別練習し、全パターンランダムでpHから色を判断します。',
    difficulty: '基礎',
    type: '無限演習',
    link: '/learn/chemistry/indicator-drill'
  },
  {
    slug: 'phase-diagram-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '物質の状態（状態図）',
    title: '化学 状態図・相変化の判断ドリル',
    description: '水・CO₂の融解曲線、三重点、臨界点、1気圧での挙動を個別練習し、実戦では全8パターンを混ぜて判断します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/chemistry/phase-diagram-drill'
  },
  {
    slug: 'inorganic-colors-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '無機化学（イオン反応・沈殿）',
    title: '化学 無機イオン反応・色の判定ドリル',
    description: '少量・過剰や酸性・塩基性で変わる沈殿・錯イオン・酸化還元を個別練習し、全14パターンを混ぜて判断します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/chemistry/inorganic-colors-drill'
  },
  {
    slug: 'organic-separation-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '有機化学（芳香族の分離）',
    title: '化学 有機化合物の分離・判断ドリル',
    description: 'アニリン・安息香酸・フェノールの抽出を個別練習し、実戦では酸・塩基の強さから水層へ移る物質を判断します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/chemistry/organic-separation-drill'
  },
  {
    slug: 'industrial-process-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '無機工業化学（製法）',
    title: '化学 工業的製法・工程判断ドリル',
    description: '接触法・オストワルト法・ソルベー法を工程別に練習し、実戦では反応・中間体・循環を全11パターンから判断します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/chemistry/industrial-process-drill'
  },
  {
    slug: 'metal-ion-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '無機化学（金属イオン）',
    title: '化学 金属イオン系統分析ドリル',
    description: '塩化物・硫化物・水酸化物・炭酸塩の段階と炎色確認を個別練習し、実戦では全6段階を混ぜて判断します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/chemistry/metal-ion-drill'
  },
  {
    slug: 'flame-reaction-drill',
    subject: 'chemistry',
    subjectJp: '化学基礎',
    field: '無機化学（元素の確認）',
    title: '化学 炎色反応・元素識別ドリル',
    description: 'Li・Na・K・Cu・Ca・Baの炎色を元素ごとに個別練習し、実戦モードでは6元素をバランスよく混ぜて識別します。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/chemistry/flame-reaction-drill'
  },
  {
    slug: 'gas-collection-drill',
    subject: 'chemistry',
    subjectJp: '化学基礎',
    field: '無機化学（気体の性質）',
    title: '化学 気体の捕集法・判断ドリル',
    description: '水上・上方・下方置換法を個別練習し、実戦モードでは水溶性と密度から捕集法を選びます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/chemistry/gas-collection-drill'
  },
  {
    slug: 'crystal-lattice-drill',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '物質の構造（結晶格子）',
    title: '化学 結晶格子・計算ドリル',
    description: 'BCC・FCCの原子数・配位数・充填率・半径と格子定数・密度を個別練習し、実戦では全6パターンから方法を選びます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/chemistry/crystal-lattice-drill'
  },
  {
    slug: 'motion-calculation-drill',
    subject: 'physics',
    subjectJp: '物理',
    field: '力学・計算',
    title: '物理 力学・計算ドリル',
    description: '平均の速さ・加速度・自由落下・仕事・運動量・エネルギー・ばねに加え、投射速度の分解・最高点・飛行時間・到達距離も個別練習と全パターンランダムで反復します。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/physics/motion-calculation-drill'
  },
  {
    slug: 'ac-circuit-drill',
    subject: 'physics',
    subjectJp: '物理',
    field: '電磁気（交流回路）',
    title: '物理 交流回路・計算ドリル',
    description: 'コイル・コンデンサーのリアクタンス、インピーダンス、回路電流、共振周波数を個別練習し、実戦では全5パターンから方法を選びます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/physics/ac-circuit-drill'
  },
  {
    slug: 'number-representation-drill',
    subject: 'information',
    subjectJp: '情報I',
    field: '2進数・デジタル表現',
    title: '情報I 2進数・2の補数ドリル',
    description: '符号なし・2の補数・ビットの重み・10進数からの変換を個別練習し、実戦では全4パターンから見分けます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/information/number-representation-drill'
  },
  {
    slug: 'calculation-drill',
    subject: 'information',
    subjectJp: '情報I',
    field: '計算・処理',
    title: '情報I 計算・処理ドリル',
    description: '2進数・データ量・通信時間・論理演算・標本化・圧縮率・補数表現を個別練習と全パターンランダムで反復します。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/information/calculation-drill'
  },

  {
    slug: 'cross-multiply-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（因数分解）',
    title: 'たすき掛け因数分解ドリル',
    description: '全てプラス・マイナス混入・2変数・共通因数の4パターンを個別練習し、実戦では混合します。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/cross-multiply-drill'
  },
  {
    slug: 'factorization-strategy-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（因数分解）',
    title: '因数分解・解法選択ドリル',
    description: '共通因数・展開公式・たすき掛け・置き換え・高次式を個別練習し、実戦では全パターンをバランスよく混ぜます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/factorization-strategy-drill'
  },
  {
    slug: 'math1-mixed-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数学I総合（解法選択）',
    title: '数学I 総合・解法選択ランダムドリル',
    description: '数と式・二次関数・三角比・確率から、問題の形に合う最初の解法を判断する上位混合演習です。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/math1-mixed-drill'
  },
  {
    slug: 'symmetric-polynomial-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（式の値）',
    title: '対称式の値ドリル',
    description: 'x²＋y²・x³＋y³・x²y＋xy²を個別練習し、実戦では3パターンを偏りなくランダムに混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/symmetric-polynomial-drill'
  },
  {
    slug: 'double-radical-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（実数）',
    title: '二重根号の外し方ドリル',
    description: '基本の和・差・係数付き・割る√2の4パターンを個別練習し、実戦では全形式を混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/double-radical-drill'
  },
  {
    slug: 'absolute-value-eq-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（方程式）',
    title: '絶対値を含む方程式ドリル',
    description: '基本・係数あり・場合分けと無縁根・絶対値2つを個別練習し、実戦では4パターンを混ぜます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/absolute-value-eq-drill'
  },
  {
    slug: 'rationalization-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（実数）',
    title: '有理化の計算ドリル',
    description: '足し算型・引き算型を個別練習し、実戦では両方をランダムに混ぜて有理化の判断を反復します。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/rationalization-drill'
  },
  {
    slug: 'calculus-drill',
    subject: 'math',
    subjectJp: '数学II',
    field: '微積分（面積公式）',
    title: '微積分・面積公式（無限計算ドリル）',
    description: '1/6公式・1/12公式などの型を個別に反復し、実戦では面積問題をランダムに選んで練習します。グラフと詳しい解説付き。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus-drill'
  },
  {
    slug: 'vector-drill',
    subject: 'math',
    subjectJp: '数学C',
    field: 'ベクトル',
    title: 'ベクトル・交点位置ベクトルドリル',
    description: 'メネラウスの定理・係数比較を個別練習し、実戦ではどちらも使える交点問題で自分の解法を選びます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/vector-drill'
  },
  {
    slug: 'complex-drill',
    subject: 'math',
    subjectJp: '数学C',
    field: '複素数平面',
    title: '複素数平面・ド・モアブルの定理ドリル',
    description: '絶対値√2型・絶対値2型・単位円型を個別練習し、実戦では全形式をランダムに混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/complex-drill'
  },
  {
    slug: 'sequence-drill',
    subject: 'math',
    subjectJp: '数学B',
    field: '数列',
    title: '数列・隣接2項間の漸化式ドリル',
    description: '公比が正・負の型を個別練習し、実戦では符号をランダムに混ぜて一般項を求めます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/sequence-drill'
  },
  {
    slug: 'circle-tangent-drill',
    subject: 'math',
    subjectJp: '数学II',
    field: '図形と方程式',
    title: '図形と方程式・円の接線ドリル',
    description: '接点の座標を置く方法と中心からの距離を使う方法を個別練習し、実戦では2解法をランダムに混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/circle-tangent-drill'
  },

  {
    slug: 'completing-square-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数',
    title: '平方完成の特訓ドリル',
    description: '整数・分数係数などの平方完成パターンを個別練習し、実戦では全形式をランダムに混ぜます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/completing-square-drill'
  },
  {
    slug: 'quadratic-inequality-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数',
    title: '2次不等式の解ドリル',
    description: '基本・マイナス係数・分数解・D=0を個別練習し、実戦では4パターンをランダムに混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/quadratic-inequality-drill'
  },
  {
    slug: 'quadratic-equation-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数（2次方程式）',
    title: '二次方程式・解法選択ドリル',
    description: '因数分解・平方根・平方完成・解の公式を個別練習し、実戦では4解法をバランスよくランダムに混ぜます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/quadratic-equation-drill'
  },
  {
    slug: 'discriminant-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数',
    title: '判別式と共有点の個数ドリル',
    description: '判別式とグラフの位置関係を、定数の条件別に練習。スライダーで視覚的に確かめられます。',
    difficulty: '応用',
    type: '無限計算ドリル',
    link: '/learn/math/discriminant-drill'
  },
  {
    slug: 'quadratic-max-min-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数',
    title: '2次関数の最大・最小ドリル',
    description: '軸が定義域の内外にある場合などを個別・ランダムに練習し、グラフから最大値・最小値を判断します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/quadratic-max-min-drill'
  },
  {
    slug: 'trig-identity-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '三角比の相互関係ドリル',
    description: '鋭角・鈍角・平方根を含む値・式の値を個別練習し、実戦では4パターンを混ぜます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/trig-identity-drill'
  },
  {
    slug: 'sine-rule-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '正弦定理と外接円ドリル',
    description: '外接円の半径・辺・角・最大角判定を個別に練習し、実戦では4パターンをランダムに混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/sine-rule-drill'
  },
  {
    slug: 'cosine-rule-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '余弦定理ドリル',
    description: '辺の長さ・角度の逆算・2次方程式を使う型を個別に練習し、実戦では4パターンをランダムに混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/cosine-rule-drill'
  },
  {
    slug: 'triangle-area-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '三角形の面積ドリル',
    description: '正弦を使う面積・ヘロンの公式・面積からの逆算を個別に練習し、実戦では4パターンをランダムに混ぜます。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/triangle-area-drill'
  },
  {
    slug: 'inscribed-circle-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '内接円・傍接円の半径ドリル',
    description: '内接円・外接円・傍接円の4パターンを個別に練習し、実戦では全パターンをランダムに混ぜます。',
    difficulty: '応用',
    type: '無限計算ドリル',
    link: '/learn/math/inscribed-circle-drill'
  },
  {
    slug: 'permutation-combination-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '場合の数',
    title: 'P と C の単純計算',
    description: '順列・組合せ・対称性を使う組合せ・円順列を個別練習し、実戦では4パターンを混ぜます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/permutation-combination-drill'
  },
  {
    slug: 'binomial-probability-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '確率',
    title: '反復試行の確率',
    description: 'コイン・サイコロ・余事象・条件付きの4パターンを個別練習し、実戦では混合します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/binomial-probability-drill'
  },
  {
    slug: 'euclidean-algorithm-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '整数の性質',
    title: 'ユークリッドの互除法',
    description: '2桁の基本・3桁と2桁・互いに素・4桁を含む4パターンを個別練習し、実戦では全パターンをバランスよく混ぜます。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/euclidean-algorithm-drill'
  },
  {
    slug: 'linear-diophantine-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '整数の性質',
    title: '1次不定方程式の特殊解',
    description: '係数や右辺の形を4パターンに分けて個別練習し、実戦では全パターンをランダムに混ぜて ax+by=c の整数解を探します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/linear-diophantine-drill'
  },
  {
    title: 'n進法の変換',
    description: '10進→n進、n進→10進、n進→m進、小数変換を個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/base-n-conversion-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '整数の性質',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'base-n-conversion-drill',
  },
  {
    title: 'メネラウス・チェバの定理',
    description: 'チェバ・メネラウス（内分/外分）・面積比への応用を個別に練習し、実戦では4パターンをランダムに混ぜます。図形ルートのアニメーション付き。',
    link: '/learn/math/menelaus-ceva-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '図形の性質',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'menelaus-ceva-drill',
  },
  {
    title: '解と係数の関係',
    description: '解の2乗和・3乗和・分数対称式・解の差の2乗を個別に練習し、実戦では4パターンをランダムに混ぜます。',
    link: '/learn/math/roots-coefficients-drill',
    subject: 'math',
    subjectJp: '数学Ⅱ',
    field: '方程式・式と証明',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'roots-coefficients-drill',
  },
  {
    title: '点と直線の距離',
    description: '原点・一般の点・直線の式・距離からの逆算を個別に練習し、実戦では4パターンをランダムに混ぜます。',
    link: '/learn/math/point-line-distance-drill',
    subject: 'math',
    subjectJp: '数学Ⅱ',
    field: '図形と方程式',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'point-line-distance-drill',
  },
  {
    title: '三角関数の合成',
    description: '有名角・負の角・大きい係数・発展形を個別に練習し、実戦では4パターンをランダムに混ぜて a sin θ + b cos θ を合成します。',
    link: '/learn/math/trig-synthesis-drill',
    subject: 'math',
    subjectJp: '数学Ⅱ',
    field: '三角関数',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'trig-synthesis-drill',
  },
  {
    title: '三角関数グラフ・解法選択',
    description: '振幅・周期・左右/上下移動・値域・tanの漸近線を個別に練習し、実戦では全パターンを混ぜたランダム問題で性質の選択から練習します。',
    link: '/learn/math/trigonometry-graph-drill',
    subject: 'math',
    subjectJp: '数学Ⅱ',
    field: '三角関数',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'trigonometry-graph-drill',
  },
  {
    title: '対数の底の変換公式と性質',
    description: '底の累乗・対数の積・逆数関係・対数を指数に含む型を個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/logarithm-drill',
    subject: 'math',
    subjectJp: '数学Ⅱ',
    field: '指数関数・対数関数',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'logarithm-drill',
  },
  {
    title: '等差・等比数列の和',
    description: '等差の基本・末項指定・正の公比・負/分数公比を個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/sequence-sum-drill',
    subject: 'math',
    subjectJp: '数学B',
    field: '数列',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'sequence-sum-drill',
  },
  {
    title: 'Σ（シグマ）の計算',
    description: '1次式・2次式・望遠鏡和・等比数列のΣを個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/sigma-calculation-drill',
    subject: 'math',
    subjectJp: '数学B',
    field: '数列',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'sigma-calculation-drill',
  },
  {
    title: 'ベクトルの内積・なす角',
    description: '内積・なす角・垂直条件・大きさの平方を個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/vector-dot-product-drill',
    subject: 'math',
    subjectJp: '数学C',
    field: 'ベクトル',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'vector-dot-product-drill',
  },
  {
    title: '複素数の極形式変換',
    description: '複素数の位置・極形式・積と商などを個別練習し、実戦では4パターンをランダムに混ぜます。',
    link: '/learn/math/complex-polar-drill',
    subject: 'math',
    subjectJp: '数学C',
    field: '複素数平面',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'complex-polar-drill',
  },
  {
    title: '2次曲線の焦点と方程式（楕円）',
    description: '横長・縦長の焦点、平方完成による中心、定義からの逆算を個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/ellipse-drill',
    subject: 'math',
    subjectJp: '数学C',
    field: '2次曲線',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'ellipse-drill',
  },
  {
    title: '2次曲線の焦点と方程式（双曲線・放物線）',
    description: '横開き・縦開き双曲線、放物線の基本形・平行移動を個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/hyperbola-parabola-drill',
    subject: 'math',
    subjectJp: '数学C',
    field: '2次曲線',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'hyperbola-parabola-drill',
  },
  {
    title: 'データの分析（1変量）',
    description: '代表値・分散の定義・分散の別公式・データ変換を個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/data-analysis-1d-drill',
    subject: 'math',
    subjectJp: '数学Ⅰ',
    field: 'データの分析',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'data-analysis-1d-drill',
  },
  {
    title: 'データの分析（2変量）',
    description: '共分散・相関係数・散布図推定・クロス集計表を個別練習し、実戦では4パターンを混ぜます。',
    link: '/learn/math/data-analysis-2d-drill',
    subject: 'math',
    subjectJp: '数学Ⅰ',
    field: 'データの分析',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'data-analysis-2d-drill',
  }
];

export default function DrillPortalPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredContents = CONTENTS.filter(c => {
    const matchSubject = selectedSubject === 'all'
      || (selectedSubject === 'math3' ? c.subject === 'math' && c.subjectJp === '数学III' : c.subject === selectedSubject);
    const matchDifficulty = selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;
    return matchSubject && matchDifficulty;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページタイトル */}
      <div className="border-b border-gray-300 pb-2">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          無限演習ポータル
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          数値計算から知識の判定まで、分野ごとの演習をパターン別に反復できます。苦手な型を個別に練習し、慣れたら全パターンランダムで解法選択を練習しましょう。
        </p>
      </div>

      <section className="retro-box bg-blue-50 border-blue-200 p-4 space-y-2" aria-label="演習の使い分け">
        <h2 className="font-bold text-slate-900">■ 基礎練習と実戦練習を使い分ける</h2>
        <p className="text-slate-700 leading-relaxed">まずは各ドリルの「基礎練習」で苦手な解法・出題パターンだけを反復し、慣れたら「実戦練習：全パターンランダム」で問題の形から解法を選ぶ練習へ進みます。</p>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold"><span className="px-2 py-1 bg-white border border-blue-300 text-blue-800">基礎練習：1パターン固定</span><span className="px-2 py-1 bg-white border border-emerald-300 text-emerald-800">実戦練習：全パターン混合</span><span className="px-2 py-1 bg-white border border-amber-300 text-amber-800">数学III：単元別＋総合ランダム</span></div>
      </section>

      {/* 検索・フィルターエリア */}
      <div className="border border-gray-300 bg-gray-50 p-4 flex flex-col md:flex-row gap-6 text-xs">
        
        {/* 科目フィルター */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-700 block">■ 科目で絞り込む</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="科目で絞り込む">
            {[
              { id: 'all', name: 'すべての科目' },
              { id: 'math', name: '数学' },
              { id: 'math3', name: '数学III' },
              { id: 'chemistry', name: '化学' },
              { id: 'physics', name: '物理' },
              { id: 'information', name: '情報I' }
            ].map(sub => (
              <button
                key={sub.id}
                type="button"
                aria-pressed={selectedSubject === sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`retro-btn-classic ${selectedSubject === sub.id ? 'bg-[#cbd5e1] font-bold' : ''}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>

        {/* 難易度フィルター */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-700 block">■ 難易度で絞り込む</span>
          <div className="flex gap-1.5" role="group" aria-label="難易度で絞り込む">
            {[
              { id: 'all', name: 'すべて' },
              { id: '基礎', name: '基礎' },
              { id: '標準', name: '標準' },
              { id: '応用', name: '応用' }
            ].map(diff => (
              <button
                key={diff.id}
                type="button"
                aria-pressed={selectedDifficulty === diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`retro-btn-classic ${selectedDifficulty === diff.id ? 'bg-[#cbd5e1] font-bold' : ''}`}
              >
                {diff.name}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 教材一覧 (デスクトップ版テーブル) */}
      <div className="hidden md:block border border-gray-300 overflow-x-auto">
        <table className="classic-table text-xs">
          <thead>
            <tr>
              <th className="w-24">科目</th>
              <th className="w-36">分野</th>
              <th className="w-24">タイプ</th>
              <th className="w-16">難易度</th>
              <th>教材タイトル・内容説明</th>
              <th className="w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredContents.map(c => (
              <tr key={c.slug} className="hover:bg-gray-50/50">
                <td className="text-center font-bold text-slate-700">{c.subjectJp}</td>
                <td className="text-slate-600">{c.field}</td>
                <td className="text-center text-gray-500">{c.type}</td>
                <td className="text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${c.difficulty === '基礎' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : c.difficulty === '標準' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    {c.difficulty}
                  </span>
                </td>
                <td className="text-left space-y-1">
                  <div className="font-bold text-slate-800">{c.title}</div>
                  <div className="text-gray-500 text-[11px] leading-relaxed">{c.description}</div>
                </td>
                <td className="text-center">
                  <Link 
                    href={c.link}
                    className="retro-btn-classic font-bold"
                  >
                    開く ➔
                  </Link>
                </td>
              </tr>
            ))}
            {filteredContents.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 italic">
                  該当するドリルがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 教材一覧 (スマホ版カード) */}
      <div className="md:hidden space-y-4">
        {filteredContents.map(c => (
          <div key={c.slug} className="retro-box p-4 bg-white space-y-3 relative">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-bold text-slate-700 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-300">
                {c.subjectJp}
              </span>
              <span className="text-xs text-slate-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {c.field}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.difficulty === '基礎' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : c.difficulty === '標準' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                {c.difficulty}
              </span>
            </div>
            
            <div>
              <div className="font-bold text-slate-900 text-sm mb-1">{c.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{c.description}</div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <Link 
                href={c.link}
                className="retro-btn-classic font-bold text-xs px-4"
              >
                開く ➔
              </Link>
            </div>
          </div>
        ))}
        {filteredContents.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic bg-gray-50 border border-gray-200 rounded">
            該当するドリルがありません。
          </div>
        )}
      </div>

    </div>
  );
}
