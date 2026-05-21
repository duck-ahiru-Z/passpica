import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
// ★ さっき作った型をインポート
import { Article, ArticleMeta } from '../types/article';

const contentDirectory = path.join(process.cwd(), 'content');

// 個別記事の取得（戻り値の型を Promise<Article> に指定）
export async function getArticleData(category: string, slug: string): Promise<Article> {
  const fullPath = path.join(contentDirectory, category, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // 型に合わせてデータを返す
  return {
    slug,
    category,
    contentHtml,
    title: matterResult.data.title || 'タイトルなし',
    date: matterResult.data.date || '日付未定',
    author: matterResult.data.author || '名無し',
    tags: matterResult.data.tags || [],
    thumbnail: matterResult.data.thumbnail || null,
    description: matterResult.data.description || '',
  };
}

// 記事一覧の取得（戻り値の型を ArticleMeta[] に指定）
export function getAllArticlesMeta(): ArticleMeta[] {
  const categories = fs.readdirSync(contentDirectory);
  let allArticles: ArticleMeta[] = [];

  categories.forEach((category) => {
    const categoryPath = path.join(contentDirectory, category);
    
    if (!fs.statSync(categoryPath).isDirectory()) return;

    const fileNames = fs.readdirSync(categoryPath);
    const categoryArticles: ArticleMeta[] = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(categoryPath, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        return {
          slug,
          category,
          title: matterResult.data.title || 'タイトルなし',
          date: matterResult.data.date || '日付未定',
          author: matterResult.data.author || '名無し',
          tags: matterResult.data.tags || [],
          thumbnail: matterResult.data.thumbnail || null,
          description: matterResult.data.description || '',
        };
      });

    allArticles = allArticles.concat(categoryArticles);
  });

  return allArticles.sort((a, b) => (a.date < b.date ? 1 : -1));
}