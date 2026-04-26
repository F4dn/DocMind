import Link from "next/link"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showWordmark?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, showWordmark = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-base", inner: "w-3.5 h-3.5" },
    md: { icon: "w-9 h-9", text: "text-lg", inner: "w-4 h-4" },
    lg: { icon: "w-12 h-12", text: "text-xl", inner: "w-5 h-5" },
  }
  const s = sizes[size]

  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <div
        className={cn(
          "rounded-xl bg-brand-gradient flex items-center justify-center relative overflow-hidden",
          "shadow-glow-soft group-hover:shadow-glow transition-shadow duration-300",
          s.icon
        )}
      >
        <Sparkles className={cn("text-white relative z-10", s.inner)} />
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {showWordmark && (
        <span className={cn("font-semibold tracking-tight", s.text)}>
          DocMind
        </span>
      )}
    </Link>
  )
}