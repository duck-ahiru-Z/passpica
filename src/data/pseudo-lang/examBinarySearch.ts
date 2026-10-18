export const examBinarySearch = `# 共通テスト試作問題風 二分探索プログラム
Data = [3,18,29,33,48,52,62,77,89,97]
kazu = 要素数(Data)
表示する("探したい数字(例:52)の添字を検索します")
atai = 52

hidari = 0
migi = kazu - 1
owari = 0

hidari <= migi and owari == 0 の間繰り返す:
｜  aida = (hidari + migi) ÷ 2 
｜  もし Data[aida] == atai ならば:
｜  ｜  表示する(atai, "は添字", aida, "にありました")
｜  ｜  owari = 1
｜  そうでなくもし Data[aida] < atai ならば:
｜  ｜  hidari = aida + 1
｜  そうでなければ:
⎿  ⎿  migi = aida - 1

もし owari == 0 ならば:
⎿  表示する(atai, "は見つかりませんでした")`;
