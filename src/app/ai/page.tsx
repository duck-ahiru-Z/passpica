"use client";

import { trackEvent } from "../../lib/analytics";

const AI_TOOLS = [
  {
    id: "eiyaku",
    name: "英訳添削",
    description: "大学受験の和文英訳をAIが採点・添削。修正点の解説、模範解答、再提出比較、AIへの質問に対応します。",
    url: "https://share.gemini.google/OnbHDoe5kLLU",
  },
] as const;

export default function AiToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      <div className="border-b border-gray-300 pb-2">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">AI学習ツール</h1>
        <p className="text-xs text-gray-500 mt-1">大学受験の学習を支援するAIツールへの入口です。</p>
      </div>

      <section className="border border-gray-300 bg-gray-50 p-4 md:p-5 space-y-3" aria-labelledby="eiyaku-title">
        <h2 id="eiyaku-title" className="text-base font-bold text-slate-900">英訳添削</h2>
        <p className="text-xs leading-relaxed text-slate-600">{AI_TOOLS[0].description}</p>
        <a
          href={AI_TOOLS[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="retro-btn-classic inline-block font-bold"
          onClick={() => trackEvent("ai_tool_launch", { tool_id: AI_TOOLS[0].id, tool_name: AI_TOOLS[0].name })}
        >
          英訳添削を使う ➔
        </a>
      </section>
    </div>
  );
}
