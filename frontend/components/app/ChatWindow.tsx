"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HiOutlineSparkles } from "react-icons/hi"
import type { Message } from "@/lib/types"
import type { SourceChunk } from "@/lib/api"
import { MessageBubble } from "./MessageBubble"
import { StreamingMessage } from "./StreamingMessage"
import { CitationPanel } from "./CitationPanel"
import { ChatInput } from "./ChatInput"
import { useStream } from "@/lib/useStream"

interface Props {
  documentId: string
  documentName: string
  initialSessionId?: string | null
  onSessionCreated?: (sessionId: string) => void
}

export function ChatWindow({
  documentId,
  documentName,
  initialSessionId,
  onSessionCreated,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(
    initialSessionId || null
  )
  const [activeSources, setActiveSources] = useState<SourceChunk[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const { text, sources, isStreaming, isWaiting, send } = useStream()

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, text, isWaiting])

  // Show latest sources in panel when streaming
  useEffect(() => {
    if (sources.length > 0) setActiveSources(sources)
  }, [sources])

  const handleSend = useCallback(
    async (question: string) => {
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: question,
        createdAt: new Date(),
      }
      setMessages((m) => [...m, userMsg])

      await send(
        documentId,
        question,
        sessionId,
        (fullText, finalSources, newSessionId) => {
          const assistantMsg: Message = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: fullText,
            sources: finalSources,
            createdAt: new Date(),
          }
          setMessages((m) => [...m, assistantMsg])
          setActiveSources(finalSources)

          if (!sessionId && newSessionId) {
            setSessionId(newSessionId)
            onSessionCreated?.(newSessionId)
          }
        }
      )
    },
    [documentId, sessionId, send, onSessionCreated]
  )

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* CENTER — Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-14 px-6 border-b border-white/5 flex items-center gap-3 flex-shrink-0 bg-base/40 backdrop-blur-xl">
          <div className="h-px w-6 bg-brand-cyan" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-cyan">
            Chat
          </span>
          <span className="text-ink-muted text-[10px] font-mono">·</span>
          <span className="text-xs text-ink-secondary truncate">{documentName}</span>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin px-6 py-8"
        >
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Empty state */}
            <AnimatePresence>
              {messages.length === 0 && !isStreaming && !isWaiting && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center pt-16 pb-8"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-6 shadow-glow"
                  >
                    <HiOutlineSparkles className="w-9 h-9 text-white" />
                  </motion.div>

                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-10 bg-brand-cyan" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-cyan">
                      Ready
                    </span>
                    <div className="h-px w-10 bg-brand-cyan" />
                  </div>

                  <h3 className="font-headline text-4xl tracking-tight text-gradient-subtle mb-3">
                    ASK ANYTHING.
                  </h3>
                  <p className="text-sm text-ink-secondary max-w-sm mx-auto">
                    Ask any question about{" "}
                    <span className="text-ink-primary font-medium">
                      {documentName}
                    </span>
                    . Answers are grounded in your source, every chunk cited.
                  </p>

                  {/* Suggested prompts */}
                  <div className="flex flex-wrap justify-center gap-2 mt-8">
                    {[
                      "Summarize this document",
                      "What are the key findings?",
                      "What are the main conclusions?",
                    ].map((prompt) => (
                      <motion.button
                        key={prompt}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSend(prompt)}
                        className="text-xs px-4 py-2 rounded-lg glass hover:border-brand-cyan/30 hover:text-brand-cyan transition-all text-ink-secondary"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message history */}
            <div className="space-y-8">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onShowSources={setActiveSources}
                />
              ))}
            </div>

            {/* Streaming message */}
            {(isStreaming || isWaiting) && (
              <StreamingMessage text={text} isWaiting={isWaiting} />
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-6 py-5 border-t border-white/5 bg-base/40 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming || isWaiting}
              isStreaming={isStreaming || isWaiting}
            />
          </div>
        </div>
      </div>

      {/* RIGHT — Citation panel */}
      <CitationPanel sources={activeSources} isStreaming={isStreaming} />
    </div>
  )
}