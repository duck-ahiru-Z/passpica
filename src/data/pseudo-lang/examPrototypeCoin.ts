export const examPrototypeCoin = `# 大学入試センター試作問題「情報I」をもとにした硬貨交換
# 46円の商品に対し、支払いと釣り銭の合計枚数が最小になる方法を調べます。
# 使う硬貨は1円、5円、10円、50円、100円です。
Kouka = [1, 5, 10, 50, 100]
kakaku = 46
min_maisu = 100

tsuri を 0 から 99 まで 1 ずつ増やしながら繰り返す:
｜  shiharai = kakaku + tsuri
｜  shiharai_maisu = 0
｜  shiharai_nokori = shiharai
｜  i を 4 から 0 まで 1 ずつ減らしながら繰り返す:
｜  ｜  shiharai_maisu = shiharai_maisu + shiharai_nokori ÷ Kouka[i]
｜  ｜  shiharai_nokori = shiharai_nokori % Kouka[i]
｜  tsuri_maisu = 0
｜  tsuri_nokori = tsuri
｜  i を 4 から 0 まで 1 ずつ減らしながら繰り返す:
｜  ｜  tsuri_maisu = tsuri_maisu + tsuri_nokori ÷ Kouka[i]
｜  ｜  tsuri_nokori = tsuri_nokori % Kouka[i]
｜  sou_maisu = shiharai_maisu + tsuri_maisu
｜  もし sou_maisu < min_maisu ならば:
｜  ｜  min_maisu = sou_maisu

表示する("46円の最小交換硬貨枚数：", min_maisu, "枚")`;
