"use client";

import { trackEvent } from "../../lib/analytics";

const AI_TOOLS = [
  {
    id: "ai_chat",
    name: "AI質問チャット",
    description: "勉強でも、日常の疑問でも。なんでもAIに質問できます。画像での質問にも対応。",
    url: "https://share.gemini.google/ibz2WXmUyA6J",
  },
  {
    id: "eiyaku",
    name: "英訳添削",
    description: "大学受験の和文英訳をAIが採点・添削。修正点の解説、模範解答、再提出比較、AIへの質問に対応します。",
    url: "https://share.gemini.google/OnbHDoe5kLLU",
  },
  {
    id: "wayaku",
    name: "英文和訳添削",
    description: "大学受験の英文和訳をAIが採点・添削。修正点の解説、模範解答、再提出比較、AIへの質問に対応します。",
    url: "https://share.gemini.google/RSCIT3J0wx5m",
  },
  {
    id: "free_writing",
    name: "自由英作文添削",
    description: "大学受験の自由英作文をAIが添削。内容・構成・文法・語彙を確認できます。",
    url: "https://share.gemini.google/nni9DMibrNAq",
  },
  {
    id: "math_description",
    name: "数学記述添削システム",
    description: "大学受験の数学記述答案をAIが添削します。",
    url: "https://share.gemini.google/STCkRJvft5qO",
  },
  {
    id: "math_variations",
    name: "数学類題作成システム",
    description: "大学受験の数学問題から類題をAIが作成します。",
    url: "https://share.gemini.google/mwNjLZg0CNAH",
  },
  {
    id: "english_summary",
    name: "英文要約添削システム",
    description: "大学受験の英文要約をAIが添削します。",
    url: "https://share.gemini.google/VKE6pB5Cv8Rb",
  },
  {
    id: "geography",
    name: "地理添削システム",
    description: "大学受験の地理答案をAIが添削します。",
    url: "https://share.gemini.google/DXlzL5KXmlqh",
  },
  {
    id: "world_history",
    name: "世界史添削システム",
    description: "大学受験の世界史答案をAIが添削します。",
    url: "https://share.gemini.google/ru4PEKjluMly",
  },
  {
    id: "japanese_history",
    name: "日本史添削システム",
    description: "大学受験の日本史答案をAIが添削します。",
    url: "https://share.gemini.google/wBVkauKj6Kfq",
  },
  {
    id: "biology",
    name: "生物添削システム",
    description: "大学受験の生物答案をAIが添削します。",
    url: "https://share.gemini.google/DAAkqLzCH2tk",
  },
  {
    id: "physics",
    name: "物理添削システム",
    description: "大学受験の物理答案をAIが添削します。",
    url: "https://share.gemini.google/jHc8XLwzcHBG",
  },
  {
    id: "chemistry",
    name: "化学添削システム",
    description: "大学受験の化学答案をAIが添削します。",
    url: "https://share.gemini.google/xqOKP6EIXyIM",
  },
  {
    id: "japanese_language",
    name: "国語添削システム",
    description: "大学受験の国語答案をAIが添削します。",
    url: "https://share.gemini.google/pLgKq6VseXn7",
  },
  {
    id: "essay",
    name: "小論文添削システム",
    description: "大学受験の小論文をAIが添削します。",
    url: "https://share.gemini.google/xQ2zSnINqBHj",
  },
] as const;

export default function AiToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      <div className="border-b border-gray-300 pb-2">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">AI学習ツール</h1>
        <p className="text-xs text-gray-500 mt-1">大学受験の学習を支援するAIツールへの入口です。</p>
      </div>

      {AI_TOOLS.map((tool) => (
        <section key={tool.id} className="border border-gray-300 bg-gray-50 p-4 md:p-5 space-y-3" aria-labelledby={`${tool.id}-title`}>
          <h2 id={`${tool.id}-title`} className="text-base font-bold text-slate-900">{tool.name}</h2>
          <p className="text-xs leading-relaxed text-slate-600">{tool.description}</p>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="retro-btn-classic inline-block font-bold"
            onClick={() => trackEvent("ai_tool_launch", {
              app_id: tool.id,
              tool_id: tool.id,
              tool_name: tool.name,
            })}
          >
            {tool.name}を使う ➔
          </a>
        </section>
      ))}
    </div>
  );
}
