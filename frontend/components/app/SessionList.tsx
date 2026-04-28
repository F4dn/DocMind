"use client"
import { motion, AnimatePresence } from "framer-motion"
import { HiOutlineChatAlt2, HiOutlineDocumentText, HiPlus } from "react-icons/hi"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

interface Session {
  id: string
  title: string | null
  created_at: string
}

interface Props {
  sessions: Session[]
  activeSessionId: string | null
  onNewChat: () => void
  docName: string
}

export function SessionList({ sessions, activeSessionId, onNewChat, docName }: Props) {
  const router = useRouter()

  return (
    <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 border-r border-white/5">
      {/* Document info */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-6 bg-brand-cyan" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-cyan">
            Document
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-gradient-soft border border-white/10 flex items-center justify-center flex-shrink-0">
            <HiOutlineDocumentText className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{docName}</p>
            <p className="text-[10px] font-mono text-ink-muted">Ready to query</p>
          </div>
        </div>
      </div>

      {/* New chat button */}
      <div className="p-3">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-4 h-10 rounded-xl glass hover:border-white/20 transition-all text-sm text-ink-secondary hover:text-ink-primary"
        >
          <HiPlus className="w-4 h-4" />
          New conversation
        </motion.button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4 space-y-1">
        <div className="flex items-center gap-3 px-1 py-3">
          <div className="h-px w-4 bg-brand-cyan/50" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
            Conversations
          </span>
        </div>

        <AnimatePresence>
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <HiOutlineChatAlt2 className="w-8 h-8 text-ink-muted mx-auto mb-3" />
              <p className="text-xs text-ink-muted">No conversations yet</p>
            </motion.div>
          ) : (
            sessions.map((session, i) => {
              const isActive = session.id === activeSessionId
              return (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/chat/${session.id}`)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-xl transition-all relative group",
                    isActive
                      ? "bg-white/[0.06] border border-white/10"
                      : "hover:bg-white/[0.03]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="session-active"
                      className="absolute left-0 top-3 bottom-3 w-0.5 bg-brand-gradient rounded-r"
                    />
                  )}
                  <p className={`text-xs font-medium truncate mb-1 ${isActive ? "text-ink-primary" : "text-ink-secondary group-hover:text-ink-primary"} transition-colors`}>
                    {session.title || "Untitled conversation"}
                  </p>
                  <p className="text-[10px] font-mono text-ink-muted">
                    {formatDate(session.created_at)}
                  </p>
                </motion.button>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}

// need cn import
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}