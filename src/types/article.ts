// 記事のメタデータ（一覧表示などに使う情報）の型
export interface ArticleMeta {
  slug: string;
  category: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  thumbnail: string | null;
  description: string;
}

// 記事の本文を含む完全なデータ（個別記事ページで使う情報）の型
export interface Article extends ArticleMeta {
  contentHtml: string;
}