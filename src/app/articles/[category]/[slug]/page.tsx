import { getArticleData } from '../../../../lib/markdown';

// params の型を Promise に変更します
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>; // ← ここが変更点
}) {
  // ① まず await で params の箱を開けて、中身を取り出す（最新Next.jsのルール！）
  const resolvedParams = await params;

  // ② 取り出したデータを使って記事を読み込む
  const articleData = await getArticleData(resolvedParams.category, resolvedParams.slug);

  return (
    <article className="max-w-3xl mx-auto p-8 font-sans">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">{articleData.title}</h1>
        <div className="text-gray-500 text-sm">
          <span>{articleData.date}</span> | <span>執筆: {articleData.author}</span>
        </div>
      </header>

      {/* 変換されたHTMLを表示する */}
      <div
        className="mt-8 prose prose-blue max-w-none"
        dangerouslySetInnerHTML={{ __html: articleData.contentHtml }}
      />
    </article>
  );
}