export function AnimatedGrid({ className }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 grid-bg pointer-events-none ${className || ""}`}
      aria-hidden
    />
  )
}