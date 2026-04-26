"use client"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean
  glow?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
        className={cn(
          "relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10",
          "transition-colors duration-300",
          hover && "hover:border-white/20 hover:bg-white/[0.05]",
          glow && "shadow-glow-soft",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
GlassCard.displayName = "GlassCard"