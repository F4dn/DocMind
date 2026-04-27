"use client"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  HiOutlineDocumentText,
  HiOutlineDotsVertical,
  HiOutlineChat,
  HiOutlineTrash,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi"
import { ImSpinner8 } from "react-icons/im"
import toast from "react-hot-toast"
import { documentsApi, type DocumentItem } from "@/lib/api"
import { formatFileSize, formatDate } from "@/lib/utils"
import { useState } from "react"

interface Props {
  doc: DocumentItem
  onDeleted: () => void
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: ImSpinner8,
    color: "text-warning",
    bg: "bg-warning/5",
    border: "border-warning/20",
    spin: true,
  },
  processing: {
    label: "Processing",
    icon: ImSpinner8,
    color: "text-brand-cyan",
    bg: "bg-brand-cyan/5",
    border: "border-brand-cyan/20",
    spin: true,
  },
  ready: {
    label: "Ready",
    icon: HiCheckCircle,
    color: "text-success",
    bg: "bg-success/5",
    border: "border-success/20",
    spin: false,
  },
  failed: {
    label: "Failed",
    icon: HiExclamationCircle,
    color: "text-danger",
    bg: "bg-danger/5",
    border: "border-danger/20",
    spin: false,
  },
}

export function DocumentCard({ doc, onDeleted }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const config = statusConfig[doc.status]
  const StatusIcon = config.icon

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${doc.original_name}"?`)) return
    try {
      await documentsApi.delete(doc.id)
      toast.success("Document deleted")
      onDeleted()
    } catch {
      toast.error("Delete failed")
    }
  }

  const handleChat = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (doc.status !== "ready") {
      toast.error("Document is still processing")
      return
    }
    router.push(`/chat/${doc.id}`)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleChat}
      className="group relative glass rounded-2xl p-6 cursor-pointer hover:border-white/20 hover:shadow-glow-soft transition-all overflow-hidden"
    >
      {/* Status accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-px ${config.color === "text-success" ? "bg-success" : config.color === "text-brand-cyan" ? "bg-brand-cyan" : config.color === "text-warning" ? "bg-warning" : "bg-danger"} opacity-50`}
      />

      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center flex-shrink-0">
          <HiOutlineDocumentText className="w-5 h-5 text-brand-cyan" />
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-white/5 transition-colors"
          >
            <HiOutlineDotsVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-10 z-20 min-w-[140px] glass-strong rounded-xl p-1 shadow-elevated"
              >
                <button
                  onClick={handleChat}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:text-ink-primary hover:bg-white/5 transition-colors"
                >
                  <HiOutlineChat className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:text-danger hover:bg-danger/5 transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <h3 className="font-medium truncate mb-1.5 group-hover:text-brand-cyan transition-colors">
        {doc.original_name}
      </h3>

      <div className="flex items-center gap-2 text-[11px] font-mono text-ink-muted mb-5">
        <span>{formatFileSize(doc.file_size)}</span>
        <span>·</span>
        <span>{doc.chunk_count} chunks</span>
        <span>·</span>
        <span>{formatDate(doc.created_at)}</span>
      </div>

      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md ${config.bg} border ${config.border}`}
      >
        <StatusIcon
          className={`w-3 h-3 ${config.color} ${config.spin ? "animate-spin" : ""}`}
        />
        <span
          className={`text-[10px] font-mono uppercase tracking-wider ${config.color}`}
        >
          {config.label}
        </span>
      </div>

      {/* Failed error message */}
      {doc.status === "failed" && doc.error_message && (
        <p className="text-xs text-danger/80 mt-3 line-clamp-2">
          {doc.error_message}
        </p>
      )}
    </motion.div>
  )
}