"use client"
import { motion } from "framer-motion"
import { HiOutlineFolder } from "react-icons/hi"

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-20"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center mx-auto mb-5">
        <HiOutlineFolder className="w-7 h-7 text-brand-cyan" />
      </div>
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-cyan mb-3">
        Empty Library
      </div>
      <h3 className="font-headline text-3xl tracking-tight text-gradient-subtle mb-3">
        NO DOCUMENTS YET
      </h3>
      <p className="text-sm text-ink-secondary max-w-sm mx-auto">
        Upload your first document above to start asking questions and getting cited answers.
      </p>
    </motion.div>
  )
}