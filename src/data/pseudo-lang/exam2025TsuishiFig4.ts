export const exam2025TsuishiFig4 = {
  isOneBased: true,
  code: `# 2025年度 大学入学共通テスト 情報I 追試験 【図4】
# ※実行用にダミーデータを追加しています
Iremono = [1, 2, 1, 1, 2]
Keiryou = [400, 500, 300, 600, 450]
Shurui = [1, 2, 1, 2, 1]
ninzu = 5 # ※元は40ですがテスト用に5に変更

kanen = 0, funen = 0
iを1から ninzu まで1ずつ増やしながら繰り返す:
｜  もし Iremono[i] == 1 ならば:
｜  ｜  gomi = Keiryou[i] - 350
｜  そうでなければ:
｜  ｜  gomi = Keiryou[i]
｜  もし Shurui[i] == 1 ならば:
｜  ｜  kanen = kanen + gomi
｜  そうでなければ:
｜  ｜  funen = funen + gomi
表示する ("可燃ごみの総重量は", kanen, "g")
表示する ("不燃ごみの総重量は", funen, "g")`
};
