"use client"
import { motion } from "framer-motion"
import { HiOutlineSparkles, HiOutlineUser } from "react-icons/hi"
import type { Message } from "@/lib/types"
import type { SourceChunk } from "@/lib/api"

interface Props {
  message: Message
  onShowSources?: (sources: SourceChunk[]) => void
}

export function MessageBubble({ message, onShowSources }: Props) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end gap-3"
      >
        <div className="max-w-[75%]">
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-tr-sm px-5 py-3.5">
            <p className="text-sm text-ink-primary leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
          <HiOutlineUser className="w-4 h-4 text-ink-secondary" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-brand-gradient flex-shrink-0 flex items-center justify-center mt-1 shadow-glow-soft">
        <HiOutlineSparkles className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0 space-y-3 max-w-[75%]">
        <div className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan mb-2">
          DocMind
        </div>

        <div className="text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => onShowSources?.(message.sources!)}
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-brand-cyan hover:text-brand-purple transition-colors mt-2"
          >
            <div className="h-px w-4 bg-brand-cyan" />
            View {message.sources.length} sources →
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}