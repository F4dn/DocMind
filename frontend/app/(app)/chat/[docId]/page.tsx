"use client"
import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HiArrowLeft } from "react-icons/hi2"
import { documentsApi, chatApi } from "@/lib/api"
import { ChatWindow } from "@/components/app/ChatWindow"
import { SessionList } from "@/components/app/SessionList"

interface Session {
  id: string
  title: string | null
  created_at: string
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ docId: string }>
}) {
  const { docId } = use(params)
  const router = useRouter()
  const [docName, setDocName] = useState("Loading...")
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [chatKey, setChatKey] = useState(0) // remounts ChatWindow for new chat

  // Load document name + sessions
  const loadData = useCallback(async () => {
    try {
      const [docsRes, sessionsRes] = await Promise.all([
        documentsApi.list(),
        chatApi.listSessions(docId),
      ])
      const doc = docsRes.data.find((d: any) => d.id === docId)
      if (doc) setDocName(doc.original_name)
      setSessions(sessionsRes.data)
    } catch {
      setDocName("Unknown document")
    }
  }, [docId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleNewChat = () => {
    setActiveSessionId(null)
    setChatKey((k) => k + 1)
  }

  const handleSessionCreated = (newSessionId: string) => {
    setActiveSessionId(newSessionId)
    loadData() // refresh session list in sidebar
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* LEFT — Session list sidebar */}
      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        docName={docName}
      />

      {/* Main chat area (full width on mobile) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Back button topbar override */}
        <div className="h-14 px-4 border-b border-white/5 flex items-center gap-3 flex-shrink-0 lg:hidden bg-base/40 backdrop-blur-xl">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </div>

        {/* Chat window — remounts on new chat */}
        <ChatWindow
          key={chatKey}
          documentId={docId}
          documentName={docName}
          initialSessionId={activeSessionId}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  )
}