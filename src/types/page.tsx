// 記事のメタデータ（一覧表示などで使う情報）の型
export type ArticleMeta = {
  slug: string;
  category: string;
  title: string;
  date: string;
  author: string;
  // 以下は「脱・しょぼい」のために今後追加する予定の項目（? は「なくてもOK」の意味）
  tags?: string[];
  thumbnail?: string; 
  description?: string;
};

// 個別記事ページで使う、本文(HTML)を含んだ完全な型
export type Article = ArticleMeta & {
  contentHtml: string;
};