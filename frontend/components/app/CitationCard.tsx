"use client"
import { motion } from "framer-motion"
import { HiOutlineDocumentText } from "react-icons/hi"
import type { SourceChunk } from "@/lib/api"

interface Props {
  source: SourceChunk
  index: number
}

export function CitationCard({ source, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="group p-4 rounded-xl glass hover:border-white/20 transition-all cursor-default"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <HiOutlineDocumentText className="w-3.5 h-3.5 text-brand-cyan" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[10px] font-mono text-brand-cyan">
              [chunk_{source.chunk_index}]
            </span>
            <span className="text-[10px] font-mono text-ink-muted">
              {(source.score * 100).toFixed(0)}% match
            </span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted truncate">
            {source.source} · p.{source.page}
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed line-clamp-4">
        {source.content}
      </p>

      {/* Score bar */}
      <div className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${source.score * 100}%` }}
          transition={{ duration: 0.5, delay: index * 0.06 + 0.2 }}
          className="h-full bg-brand-gradient"
        />
      </div>
    </motion.div>
  )
}