"use client"
import { usePathname } from "next/navigation"
import { HiOutlineSearch, HiOutlineBell } from "react-icons/hi"

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/library": "Library",
  "/settings": "Settings",
}

export function Topbar() {
  const pathname = usePathname()

  let title = "Dashboard"
  if (pathname.startsWith("/chat")) title = "Chat"
  else if (titleMap[pathname]) title = titleMap[pathname]

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-base/60 backdrop-blur-xl">
      <div className="h-full px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Page title with eyebrow */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-px w-6 bg-brand-cyan flex-shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-cyan flex-shrink-0">
            {title}
          </span>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3.5 h-9 rounded-lg glass max-w-md flex-1 mx-8 hover:border-white/15 transition-colors cursor-text">
          <HiOutlineSearch className="w-4 h-4 text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search documents..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-ink-muted"
          />
          <kbd className="hidden md:flex text-[10px] font-mono text-ink-muted px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            ⌘K
          </kbd>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-white/5 transition-colors">
            <HiOutlineBell className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-medium text-white shadow-glow-soft">
            U
          </div>
        </div>
      </div>
    </header>
  )
}