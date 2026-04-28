"use client"
import { AnimatePresence, motion } from "framer-motion"
import { HiOutlineBookOpen } from "react-icons/hi"
import type { SourceChunk } from "@/lib/api"
import { CitationCard } from "./CitationCard"

interface Props {
  sources: SourceChunk[]
  isStreaming: boolean
}

export function CitationPanel({ sources, isStreaming }: Props) {
  return (
    <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 border-l border-white/5">
      {/* Header */}
      <div className="h-14 px-5 border-b border-white/5 flex items-center gap-3 flex-shrink-0">
        <div className="h-px w-6 bg-brand-cyan" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-cyan">
          Sources
        </span>
        {sources.length > 0 && (
          <span className="ml-auto text-[10px] font-mono text-ink-muted">
            {sources.length} chunks
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {sources.length === 0 && !isStreaming ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlineBookOpen className="w-5 h-5 text-brand-cyan" />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan mb-2">
                No sources yet
              </p>
              <p className="text-xs text-ink-muted leading-relaxed max-w-[180px]">
                Ask a question and sources will appear here
              </p>
            </motion.div>
          ) : isStreaming && sources.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl glass animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </motion.div>
          ) : (
            sources.map((source, i) => (
              <CitationCard key={i} source={source} index={i} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {sources.length > 0 && (
        <div className="px-5 py-3 border-t border-white/5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
            Avg score:{" "}
            <span className="text-brand-cyan">
              {(
                (sources.reduce((s, c) => s + c.score, 0) / sources.length) *
                100
              ).toFixed(0)}
              %
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}