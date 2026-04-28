"use client"
import { useRef, type KeyboardEvent } from "react"
import { motion } from "framer-motion"
import { HiArrowRight } from "react-icons/hi2"
import { ImSpinner8 } from "react-icons/im"
import { cn } from "@/lib/utils"

interface Props {
  onSend: (message: string) => void
  disabled: boolean
  isStreaming: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled,
  isStreaming,
  placeholder = "Ask anything about this document...",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const value = textareaRef.current?.value.trim()
    if (!value || disabled) return
    onSend(value)
    if (textareaRef.current) {
      textareaRef.current.value = ""
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="relative">
      {/* Glow effect behind input when streaming */}
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -inset-px rounded-2xl bg-brand-gradient opacity-20 blur-sm pointer-events-none"
        />
      )}

      <div
        className={cn(
          "relative flex items-end gap-3 glass rounded-2xl px-4 py-3.5 transition-all duration-300",
          !disabled && "hover:border-white/15"
        )}
      >
        <textarea
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={cn(
            "flex-1 bg-transparent text-sm text-ink-primary resize-none focus:outline-none",
            "placeholder:text-ink-muted scrollbar-thin",
            "min-h-[24px] max-h-[160px]",
            "transition-opacity",
            disabled && "opacity-50"
          )}
        />

        <motion.button
          whileHover={disabled ? undefined : { scale: 1.05 }}
          whileTap={disabled ? undefined : { scale: 0.95 }}
          onClick={handleSend}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
            disabled
              ? "bg-white/5 text-ink-muted cursor-not-allowed"
              : "bg-brand-gradient text-white shadow-glow-soft hover:shadow-glow"
          )}
        >
          {isStreaming ? (
            <ImSpinner8 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <HiArrowRight className="w-3.5 h-3.5" />
          )}
        </motion.button>
      </div>

      <p className="text-[10px] font-mono text-ink-muted text-center mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}