"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BlobProps {
  className?: string
  color?: "purple" | "blue" | "cyan" | "mixed"
  size?: "sm" | "md" | "lg" | "xl"
}

const sizes = {
  sm: "w-64 h-64",
  md: "w-96 h-96",
  lg: "w-[500px] h-[500px]",
  xl: "w-[800px] h-[800px]",
}

export function GradientBlob({
  className,
  color = "mixed",
  size = "lg",
}: BlobProps) {
  const fill =
    color === "purple" ? "rgba(168,85,247,0.25)" :
    color === "blue"   ? "rgba(59,130,246,0.25)" :
    color === "cyan"   ? "rgba(6,182,212,0.25)"  :
                         "rgba(168,85,247,0.2)"

  return (
    <motion.div
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -50, 20, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "absolute rounded-full blur-3xl pointer-events-none",
        sizes[size],
        className
      )}
      style={{
        background: `radial-gradient(circle, ${fill} 0%, transparent 70%)`,
      }}
    />
  )
}