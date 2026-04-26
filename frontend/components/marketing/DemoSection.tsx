"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, FileText } from "lucide-react"
import { SectionHeading } from "./SectionHeading"

const sampleAnswers: Record<string, { answer: string; sources: { num: number; page: string }[] }> = {
  "What is multi-head attention?": {
    answer: "Multi-head attention runs multiple attention mechanisms in parallel, each focusing on different aspects of the input. The Transformer uses 8 heads with d_k=64.",
    sources: [
      { num: 1, page: "p. 5" },
      { num: 2, page: "p. 7" },
    ],
  },
  "How is the model trained?": {
    answer: "The model is trained on the WMT 2014 English-German dataset using Adam optimizer with a custom learning rate schedule. Training takes 12 hours on 8 P100 GPUs for the base model.",
    sources: [
      { num: 1, page: "p. 7" },
      { num: 2, page: "p. 8" },
    ],
  },
  "What are positional encodings?": {
    answer: "Positional encodings inject sequence order into the model using sine and cosine functions of different frequencies. Since attention has no inherent order, this is critical.",
    sources: [
      { num: 1, page: "p. 6" },
    ],
  },
}

const presetQuestions = Object.keys(sampleAnswers)

export function DemoSection() {
  const [activeQ, setActiveQ] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState("")

  const handleAsk = (question: string) => {
    if (streaming) return
    setActiveQ(question)
    setStreaming(true)
    setStreamedText("")

    const fullText = sampleAnswers[question].answer
    let i = 0
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setStreamedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setStreaming(false)
      }
    }, 18)
  }

  return (
    <section id="demo" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Try it now"
          title="See it"
          highlight="in action."
          description="Sample document: 'Attention Is All You Need' — the original Transformer paper. Pick a question to watch the streaming response."
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="glass-strong rounded-2xl overflow-hidden shadow-elevated">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-brand-cyan" />
                </div>
                <div>
                  <div className="text-sm font-medium">attention_paper.pdf</div>
                  <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">
                    1 doc · 47 chunks · ready
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan">
                Demo Mode
              </span>
            </div>

            {/* Chat area */}
            <div className="min-h-[280px] p-6">
              <AnimatePresence mode="wait">
                {!activeQ ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center text-center py-12"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-5 h-5 text-brand-cyan" />
                      </div>
                      <p className="text-sm text-ink-secondary">
                        Pick a sample question below to start
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeQ}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    {/* User question */}
                    <div className="flex justify-end">
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                        <p className="text-sm">{activeQ}</p>
                      </div>
                    </div>

                    {/* AI answer */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-gradient flex-shrink-0 flex items-center justify-center shadow-glow-soft">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm leading-relaxed">
                          {streamedText}
                          {streaming && (
                            <motion.span
                              animate={{ opacity: [1, 0.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="inline-block w-[2px] h-4 bg-brand-purple ml-1 align-middle"
                            />
                          )}
                        </p>

                        {!streaming && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 gap-2 pt-2"
                          >
                            {sampleAnswers[activeQ].sources.map((src) => (
                              <div
                                key={src.num}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/10"
                              >
                                <div className="w-7 h-7 rounded-md bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                                  <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[11px] font-medium truncate">
                                    attention_paper.pdf
                                  </div>
                                  <div className="text-[10px] font-mono text-ink-muted">
                                    {src.page}
                                  </div>
                                </div>
                                <div className="text-[10px] font-mono text-brand-cyan">
                                  [{src.num}]
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Preset questions */}
            <div className="border-t border-white/10 p-5 bg-white/[0.02]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-3">
                Try these questions
              </div>
              <div className="flex flex-wrap gap-2">
                {presetQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    disabled={streaming}
                    className="text-xs px-3 py-2 rounded-lg glass hover:border-brand-cyan/40 hover:text-brand-cyan transition-all disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}