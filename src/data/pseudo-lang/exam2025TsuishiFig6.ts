export const exam2025TsuishiFig6 = {
  isOneBased: true,
  code: `# 2025年度 大学入学共通テスト 情報I 追試験 【図6】
# ※テスト用にダミーデータを用意しています
Iremono = [1, 2, 1, 1, 2]
Keiryou = [400, 500, 300, 600, 450]
Shurui = [1, 2, 1, 2, 1]
ninzu = 5 # ※元は40

Namae = ["可燃ごみ", "不燃ごみ", "ペットボトル", "かん", "びん", "金属", "落ち葉"]
shuruisu = 7
Goukei = [0, 0, 0, 0, 0, 0, 0]
iを1から ninzu まで1ずつ増やしながら繰り返す:
｜  もし Iremono[i] == 1 ならば:
｜  ｜  gomi = Keiryou[i] - 350
｜  そうでなければ:
｜  ｜  gomi = Keiryou[i]
｜  s = Shurui[i]
｜  Goukei[s] = Goukei[s] + gomi
jを1から shuruisu まで1ずつ増やしながら繰り返す:
｜  表示する( Namae[j] , "の総重量は", Goukei[j] , "g")`
};
