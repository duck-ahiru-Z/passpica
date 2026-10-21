// The official booklet shows the first and last category values, but abbreviates
// the 193-item list. The intervening values are explicitly sample data.
const categories = [2, 0, 2, 2, 1, 2, 0];
const categoryCycle = [0, 1, 2, 3, 4, 5, 2, 0, 1, 4, 3, 5];
while (categories.length < 192) {
  categories.push(categoryCycle[(categories.length - 7) % categoryCycle.length]);
}
categories.push(5);

export const exam2026Tsuishi = `# 2026年度 追試験 第3問をもとにした学習用プログラム
# 全193問・6分野から、各分野の上限を5問として30問ずつ4セットを作ります。
# 公式問題で省略された中間の分野データは、動作確認用の例データです。
# 配列の0始まり添字 i は、問題番号 i + 1 に対応します。
# 分野番号: 0=情報、1=国語、2=歴史、3=音楽、4=地理、5=日常
Bunya = [${categories.join(', ')}]
saidai = 5
Saiyou = [${Array(193).fill(0).join(', ')}]

c を 1 から 4 まで 1 ずつ増やしながら繰り返す:
｜  Mondaisu = [0, 0, 0, 0, 0, 0]
｜  i を 0 から 要素数(Bunya) - 1 まで 1 ずつ増やしながら繰り返す:
｜  ｜  b = Bunya[i]
｜  ｜  もし (Mondaisu[b] < saidai) and (Saiyou[i] == 0) ならば:
｜  ｜  ｜  Saiyou[i] = c
｜  ｜  ｜  Mondaisu[b] = Mondaisu[b] + 1
｜  i を 0 から 要素数(Bunya) - 1 まで 1 ずつ増やしながら繰り返す:
｜  ｜  もし Saiyou[i] == c ならば:
｜  ｜  ｜  表示する("セット", c, "に問題", i + 1, "を採用")`;
