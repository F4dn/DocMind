"use client";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiOutlineBookOpen } from "react-icons/hi";
import type { SourceChunk } from "@/lib/api";
import { CitationCard } from "./CitationCard";

interface Props {
  sources: SourceChunk[];
  open: boolean;
  onClose: () => void;
}

export function SourcesDrawer({ sources, open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col border-l border-white/10"
            style={{
              background: "rgba(11, 18, 34, 0.98)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <div className="h-14 px-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-brand-cyan" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-cyan">
                  Sources
                </span>
                <span className="text-[10px] font-mono text-ink-muted">
                  {sources.length} chunks
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-white/5 transition-colors"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>

            {/* Sources list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
              {sources.length === 0 ? (
                <div className="text-center py-20">
                  <HiOutlineBookOpen className="w-8 h-8 text-ink-muted mx-auto mb-3" />
                  <p className="text-xs text-ink-muted">No sources</p>
                </div>
              ) : (
                sources.map((source, i) => (
                  <CitationCard key={i} source={source} index={i} />
                ))
              )}
            </div>

            {/* Footer avg score */}
            {sources.length > 0 && (
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                Avg relevance:{" "}
                <span className="text-brand-cyan">
                  {Math.round(
                    (sources.reduce((s, c) => s + c.score, 0) /
                      sources.length) *
                      100,
                  )}
                  %
                </span>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
