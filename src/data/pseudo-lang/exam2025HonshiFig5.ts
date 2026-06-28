export const exam2025HonshiFig5 = {
  isOneBased: true,
  code: `# 2025年度 大学入学共通テスト 情報I 本試験 【図5】
Nissu = [4, 1, 3, 1, 3, 4, 2, 4, 3]
kougeihinsu = 9
Akibi = [1, 1, 1]
buinsu = 3

kougeihin を 1 から kougeihinsu まで 1 ずつ増やしながら繰り返す:
｜  tantou = 1
｜  buin を 2 から buinsu まで 1 ずつ増やしながら繰り返す:
｜  ｜  もし Akibi[buin] < Akibi[tantou] ならば:
｜  ｜  ｜  tantou = buin
｜  表示する("工芸品", kougeihin, "……部員", tantou, ":", Akibi[tantou], "日目～", Akibi[tantou] + Nissu[kougeihin] - 1, "日目")
｜  Akibi[tantou] = Akibi[tantou] + Nissu[kougeihin]`
};
