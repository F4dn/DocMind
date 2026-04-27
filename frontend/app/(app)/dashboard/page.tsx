"use client"
import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  HiOutlineDocumentText,
  HiOutlineLightningBolt,
  HiOutlineDatabase,
} from "react-icons/hi"
import { GradientBlob } from "@/components/shared/GradientBlob"
import { UploadZone } from "@/components/app/UploadZone"
import { DocumentCard } from "@/components/app/DocumentCard"
import { StatCard } from "@/components/app/StatCard"
import { EmptyState } from "@/components/app/EmptyState"
import { documentsApi, type DocumentItem } from "@/lib/api"

export default function DashboardPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadDocs = useCallback(async () => {
    try {
      const { data } = await documentsApi.list()
      setDocs(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocs()
  }, [loadDocs])

  // Poll for status updates while any document is processing
  useEffect(() => {
    const stillProcessing = docs.some(
      (d) => d.status === "pending" || d.status === "processing"
    )
    if (!stillProcessing) return

    const interval = setInterval(loadDocs, 3000)
    return () => clearInterval(interval)
  }, [docs, loadDocs])

  // Compute stats
  const totalDocs = docs.length
  const totalChunks = docs.reduce((sum, d) => sum + (d.chunk_count || 0), 0)
  const readyCount = docs.filter((d) => d.status === "ready").length

  return (
    <div className="relative min-h-full">
      <GradientBlob className="-top-40 -left-40" color="purple" size="lg" />
      <GradientBlob className="top-1/2 -right-40" color="cyan" size="md" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-brand-cyan" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
              Welcome Back
            </span>
          </div>
          <h1 className="font-headline text-5xl md:text-6xl tracking-tight leading-[0.9]">
            <span className="text-gradient-subtle">YOUR</span>{" "}
            <span className="text-gradient">DOCUMENTS.</span>
          </h1>
          <p className="text-sm text-ink-secondary mt-4 max-w-xl">
            Upload, index, and chat with your documents. Every answer cited, every chunk traceable.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total documents"
            value={totalDocs}
            icon={HiOutlineDocumentText}
            delay={0.1}
          />
          <StatCard
            label="Ready to query"
            value={readyCount}
            icon={HiOutlineLightningBolt}
            delay={0.15}
          />
          <StatCard
            label="Indexed chunks"
            value={totalChunks.toLocaleString()}
            icon={HiOutlineDatabase}
            delay={0.2}
          />
        </div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <UploadZone onUploadComplete={loadDocs} />
        </motion.div>

        {/* Documents grid */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="h-px w-10 bg-brand-cyan" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
              Library
            </span>
            {!loading && (
              <span className="text-xs font-mono text-ink-muted">
                ({totalDocs})
              </span>
            )}
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-2xl glass animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {docs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onDeleted={loadDocs}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}