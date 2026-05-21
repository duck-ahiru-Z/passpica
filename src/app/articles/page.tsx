import Link from 'next/link';
// 前回と同じく相対パスで指定します（階層が違うので ../../ です）
import { getAllArticlesMeta } from '../../lib/markdown';

export default async function ArticlesIndexPage() {
  // 裏側の関数を呼び出して、全記事のデータを取得
  const articles = getAllArticlesMeta();

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8">しろねこ受験記事一覧</h1>
      
      <div className="space-y-6">
        {articles.map((article) => (
          // Tailwind CSSでカード風のデザインにしています
          <article 
            key={`${article.category}-${article.slug}`} 
            className="border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Linkコンポーネントを使うと、画面の再読み込みなしで爆速でページ遷移します */}
            <Link href={`/articles/${article.category}/${article.slug}`}>
              <h2 className="text-2xl font-semibold text-blue-600 hover:underline mb-2">
                {article.title}
              </h2>
            </Link>
            <div className="text-gray-500 text-sm">
              <span>{article.date}</span> | <span>カテゴリ: {article.category}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}