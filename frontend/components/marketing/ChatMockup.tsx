"use client"
import { motion } from "framer-motion"
import { Sparkles, FileText } from "lucide-react"

export function ChatMockup() {
  return (
    <div className="glass-strong rounded-2xl p-5 md:p-6 shadow-elevated relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-success" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-secondary">
            DocMind / Live Session
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan">
          Streaming
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-5">
        {/* User */}
        <div className="flex justify-end">
          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
            <p className="text-sm text-ink-primary">
              What attention mechanism does the Transformer use and how many heads?
            </p>
          </div>
        </div>

        {/* AI */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex-shrink-0 flex items-center justify-center shadow-glow-soft">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-ink-primary leading-relaxed">
              The Transformer uses{" "}
              <span className="text-brand-cyan font-medium">
                Multi-Head Attention
              </span>{" "}
              with{" "}
              <span className="text-brand-cyan font-medium">8 parallel heads</span>
              <CitationBadge num={1} />. Each head operates on a d_k dimension
              of{" "}
              <span className="text-brand-cyan font-medium">64</span>, with a
              model dimension d_model of{" "}
              <span className="text-brand-cyan font-medium">512</span>
              <CitationBadge num={2} />
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-[2px] h-4 bg-brand-purple ml-1 align-middle"
              />
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <CitationCard
                num={1}
                title="attention_paper.pdf"
                page="p. 5"
              />
              <CitationCard
                num={2}
                title="attention_paper.pdf"
                page="p. 7"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-ink-muted">
        <span>1 source · 5 chunks scanned</span>
        <span className="text-brand-cyan">RAGAS 0.91</span>
      </div>
    </div>
  )
}

function CitationBadge({ num }: { num: number }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 ml-1 -mt-1 align-middle rounded-md bg-brand-cyan/15 border border-brand-cyan/30 text-[10px] font-mono font-medium text-brand-cyan">
      {num}
    </span>
  )
}

function CitationCard({
  num,
  title,
  page,
}: {
  num: number
  title: string
  page: string
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
      <div className="w-7 h-7 rounded-md bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center flex-shrink-0">
        <FileText className="w-3.5 h-3.5 text-brand-cyan" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-ink-primary truncate">
          {title}
        </div>
        <div className="text-[10px] font-mono text-ink-muted">{page}</div>
      </div>
      <div className="text-[10px] font-mono text-brand-cyan">[{num}]</div>
    </div>
  )
}