"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HiOutlineSearch } from "react-icons/hi"
import { GradientBlob } from "@/components/shared/GradientBlob"
import { DocumentCard } from "@/components/app/DocumentCard"
import { EmptyState } from "@/components/app/EmptyState"
import { documentsApi, type DocumentItem } from "@/lib/api"

const filters = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
] as const

type FilterValue = (typeof filters)[number]["value"]

export default function LibraryPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterValue>("all")

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

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const matchSearch = d.original_name
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchFilter =
        filter === "all" ||
        (filter === "processing"
          ? d.status === "processing" || d.status === "pending"
          : d.status === filter)
      return matchSearch && matchFilter
    })
  }, [docs, search, filter])

  return (
    <div className="relative min-h-full">
      <GradientBlob className="-top-40 -right-40" color="cyan" size="lg" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-brand-cyan" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
              Library
            </span>
          </div>
          <h1 className="font-headline text-5xl md:text-6xl tracking-tight leading-[0.9]">
            <span className="text-gradient-subtle">ALL</span>{" "}
            <span className="text-gradient">DOCUMENTS.</span>
          </h1>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-4 h-11 rounded-xl glass">
            <HiOutlineSearch className="w-4 h-4 text-ink-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-ink-muted"
            />
          </div>

          <div className="flex gap-1.5 p-1 rounded-xl glass">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3.5 h-9 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                  filter === f.value
                    ? "bg-white/10 text-ink-primary"
                    : "text-ink-muted hover:text-ink-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl glass animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onDeleted={loadDocs} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}