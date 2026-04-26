"use client"
import { forwardRef, useState, type InputHTMLAttributes } from "react"
import { motion } from "framer-motion"
import { HiEye, HiEyeOff } from "react-icons/hi"
import { cn } from "@/lib/utils"

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  error?: string
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon: Icon, type, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [focused, setFocused] = useState(false)
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type

    return (
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-secondary block">
          {label}
        </label>

        <div
          className={cn(
            "relative flex items-center rounded-xl glass transition-all duration-200",
            focused && "border-brand-cyan/40 shadow-glow-soft",
            error && "border-danger/40"
          )}
        >
          {Icon && (
            <div className="pl-4 pr-2 flex-shrink-0">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  focused ? "text-brand-cyan" : "text-ink-muted"
                )}
              />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "flex-1 bg-transparent py-3.5 text-sm text-ink-primary placeholder:text-ink-muted",
              "focus:outline-none",
              !Icon && "pl-4",
              isPassword ? "pr-12" : "pr-4",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1.5 text-ink-muted hover:text-ink-secondary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <HiEyeOff className="w-4 h-4" />
              ) : (
                <HiEye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-danger font-mono"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
AuthInput.displayName = "AuthInput"