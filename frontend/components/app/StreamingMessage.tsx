"use client"
import { motion } from "framer-motion"
import { HiOutlineSparkles } from "react-icons/hi"

interface Props {
  text: string
  isWaiting: boolean
}

export function StreamingMessage({ text, isWaiting }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-brand-gradient flex-shrink-0 flex items-center justify-center mt-1 shadow-glow">
        <motion.div
          animate={{ rotate: isWaiting ? 360 : 0 }}
          transition={{ duration: 2, repeat: isWaiting ? Infinity : 0, ease: "linear" }}
        >
          <HiOutlineSparkles className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0 max-w-[75%]">
        <div className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan mb-2">
          DocMind
        </div>

        {isWaiting && !text ? (
          /* Three-dot waiting indicator */
          <div className="flex items-center gap-1.5 py-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                className="w-1.5 h-1.5 rounded-full bg-brand-cyan"
              />
            ))}
            <span className="text-xs font-mono text-ink-muted ml-2">
              Retrieving chunks...
            </span>
          </div>
        ) : (
          <div className="text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
            {text}
            {/* Blinking cursor */}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-[2px] h-4 bg-brand-purple ml-0.5 align-middle"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}