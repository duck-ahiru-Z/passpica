import type { MetadataRoute } from "next";
import { getAllArticlesMeta } from "../lib/markdown";

const baseUrl = "https://passpica.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/learn",
    "/drill",
    "/articles",
  ];

  const articleRoutes = getAllArticlesMeta().map((article) => ({
    url: `${baseUrl}/articles/${article.category}/${article.slug}`,
    lastModified: article.date === "日付未定" ? undefined : new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...articleRoutes,
  ];
}
