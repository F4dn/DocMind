"use client"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { HiOutlineUpload, HiOutlineDocumentText } from "react-icons/hi"
import { ImSpinner8 } from "react-icons/im"
import { documentsApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Props {
  onUploadComplete: () => void
}

export function UploadZone({ onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [filename, setFilename] = useState("")

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return

      setUploading(true)
      setFilename(file.name)
      setProgress(0)

      try {
        await documentsApi.upload(file, setProgress)
        toast.success(`${file.name} — processing started`)
        onUploadComplete()
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Upload failed")
      } finally {
        setUploading(false)
        setFilename("")
        setProgress(0)
      }
    },
    [onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <motion.div
      {...getRootProps()}
      whileHover={uploading ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 p-12",
        "border-2 border-dashed",
        isDragActive
          ? "border-brand-cyan/60 bg-brand-cyan/5 shadow-glow-soft"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
        uploading && "cursor-not-allowed pointer-events-none"
      )}
    >
      <input {...getInputProps()} />

      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative flex flex-col items-center gap-5"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center">
                <ImSpinner8 className="w-6 h-6 text-brand-cyan animate-spin" />
              </div>
            </div>

            <div className="text-center space-y-3 max-w-md">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-cyan">
                Uploading
              </div>
              <p className="text-sm font-medium truncate">{filename}</p>

              <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-brand-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs font-mono text-ink-muted">{progress}%</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center gap-5 text-center"
          >
            <motion.div
              animate={{ y: isDragActive ? -8 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-16 h-16 rounded-2xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center group-hover:shadow-glow-soft transition-shadow"
            >
              {isDragActive ? (
                <HiOutlineDocumentText className="w-7 h-7 text-brand-cyan" />
              ) : (
                <HiOutlineUpload className="w-7 h-7 text-brand-cyan" />
              )}
            </motion.div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-cyan">
                Drop to upload
              </div>
              <p className="font-headline text-3xl tracking-tight text-gradient-subtle">
                {isDragActive ? "RELEASE TO UPLOAD" : "DRAG ANY DOCUMENT"}
              </p>
              <p className="text-sm text-ink-secondary">
                or{" "}
                <span className="text-brand-cyan underline-offset-4 group-hover:underline">
                  click to browse
                </span>
              </p>
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted pt-2">
                PDF · DOCX · TXT — max 20MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}