"use client";

import { trackEvent } from "../../lib/analytics";

const AI_TOOLS = [
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
