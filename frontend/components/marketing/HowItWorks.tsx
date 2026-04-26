"use client"
import { motion } from "framer-motion"
import { Upload, Database, MessageSquare } from "lucide-react"
import { SectionHeading } from "./SectionHeading"

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload",
    description: "Drag any PDF, DOCX, or text file. Async ingestion via Celery — your dashboard stays responsive.",
    detail: "PyPDF · python-docx · 20MB max",
  },
  {
    num: "02",
    icon: Database,
    title: "Index",
    description: "Documents are chunked semantically, embedded with Gemini, and stored in your isolated ChromaDB namespace.",
    detail: "512-token chunks · cosine similarity",
  },
  {
    num: "03",
    icon: MessageSquare,
    title: "Chat",
    description: "Multi-query expansion + cross-encoder reranking deliver cited answers streamed token-by-token.",
    detail: "Top-5 reranked · SSE streaming",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="The Pipeline"
          title="From upload"
          highlight="to insight."
          description="A three-stage RAG pipeline engineered for grounded, traceable answers. Every step is observable, every chunk is cited."
        />

        <div className="mt-20 grid lg:grid-cols-3 gap-6 relative">
          {/* Connector line for desktop */}
          <div className="hidden lg:block absolute top-24 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative"
            >
              <div className="glass rounded-2xl p-8 h-full hover:border-white/20 transition-colors group relative overflow-hidden">
                {/* Step number watermark */}
                <div className="absolute top-4 right-6 font-headline text-7xl text-white/[0.03] group-hover:text-brand-cyan/10 transition-colors pointer-events-none">
                  {step.num}
                </div>

                {/* Icon */}
                <div className="relative w-14 h-14 rounded-xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center mb-6 group-hover:shadow-glow-soft transition-shadow">
                  <step.icon className="w-6 h-6 text-brand-cyan" />
                </div>

                {/* Step number tag */}
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-cyan mb-3">
                  Step {step.num}
                </div>

                <h3 className="font-headline text-3xl md:text-4xl tracking-tight mb-4 text-gradient-subtle">
                  {step.title}
                </h3>

                <p className="text-sm text-ink-secondary leading-relaxed mb-6">
                  {step.description}
                </p>

                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                    {step.detail}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}