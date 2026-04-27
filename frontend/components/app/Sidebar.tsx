"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  HiOutlineHome,
  HiOutlineFolder,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiPlus,
} from "react-icons/hi"
import { Logo } from "@/components/shared/Logo"
import { logout } from "@/lib/useAuth"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { href: "/library", label: "Library", icon: HiOutlineFolder },
  { href: "/settings", label: "Settings", icon: HiOutlineCog },
]

interface Props {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside
      className={cn(
        "relative flex-shrink-0 border-r border-white/5 bg-base-elevated/50 backdrop-blur-xl",
        "transition-all duration-300 ease-out hidden lg:flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between p-5 border-b border-white/5 h-16">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Logo size="sm" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto"
            >
              <Logo size="sm" showWordmark={false} />
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-white/5 transition-colors"
            aria-label="Collapse sidebar"
          >
            <HiOutlineMenuAlt2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New chat CTA */}
      <div className="p-4">
        <Link
          href="/dashboard"
          className={cn(
            "group flex items-center gap-2.5 rounded-xl bg-brand-gradient text-white shadow-glow-soft hover:shadow-glow transition-all",
            collapsed ? "justify-center w-12 h-12 mx-auto" : "px-4 h-11"
          )}
        >
          <HiPlus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium">New upload</span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative group flex items-center gap-3 rounded-xl text-sm transition-all duration-200",
                collapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 h-11",
                active
                  ? "text-ink-primary bg-white/[0.04]"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-white/[0.02]"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-2 bottom-2 w-0.5 bg-brand-gradient rounded-r"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <Icon className={cn("w-4 h-4 flex-shrink-0", active && "text-brand-cyan")} />
              {!collapsed && <span>{item.label}</span>}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 rounded-md glass text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer: collapse toggle (when collapsed) + logout */}
      <div className="p-3 border-t border-white/5 space-y-1">
        {collapsed && (
          <button
            onClick={onToggle}
            className="w-11 h-11 mx-auto flex items-center justify-center rounded-xl text-ink-muted hover:text-ink-primary hover:bg-white/[0.02] transition-colors"
            aria-label="Expand sidebar"
          >
            <HiOutlineMenuAlt2 className="w-4 h-4 rotate-180" />
          </button>
        )}

        <button
          onClick={() => logout(router)}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl text-sm text-ink-secondary hover:text-danger hover:bg-danger/5 transition-all duration-200 w-full",
            collapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 h-11"
          )}
        >
          <HiOutlineLogout className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}

          {collapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 rounded-md glass text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              Sign out
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}