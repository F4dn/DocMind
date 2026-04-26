"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi"
import { HiArrowRight, HiCheckCircle } from "react-icons/hi2"
import { ImSpinner8 } from "react-icons/im"

import { AuthShell } from "@/components/auth/AuthShell"
import { AuthInput } from "@/components/auth/AuthInput"
import { GlowButton } from "@/components/shared/GlowButton"
import { authApi } from "@/lib/api"

const passwordChecks = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
]

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters")
    }
    setLoading(true)
    try {
      await authApi.register(email, password)
      toast.success("Account created — please sign in")
      router.push("/login")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-10 bg-brand-cyan" />
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
          Create Account
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-headline text-5xl md:text-6xl tracking-tight leading-[0.9] mb-3">
        <span className="text-gradient-subtle">START</span>{" "}
        <span className="text-gradient">FREE.</span>
      </h1>

      <p className="text-sm text-ink-secondary mb-10">
        No credit card required. Upload your first document in seconds.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Email"
          type="email"
          icon={HiOutlineMail}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <AuthInput
          label="Password"
          type="password"
          icon={HiOutlineLockClosed}
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        {/* Password requirements */}
        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2 px-1"
          >
            {passwordChecks.map((check, i) => {
              const passed = check.test(password)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <HiCheckCircle
                    className={`w-3.5 h-3.5 transition-colors ${
                      passed ? "text-brand-cyan" : "text-ink-muted"
                    }`}
                  />
                  <span
                    className={`font-mono transition-colors ${
                      passed ? "text-ink-secondary" : "text-ink-muted"
                    }`}
                  >
                    {check.label}
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        <GlowButton
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <ImSpinner8 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create account <HiArrowRight className="w-4 h-4" />
            </>
          )}
        </GlowButton>

        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-muted text-center leading-relaxed pt-2">
          By signing up you agree to our{" "}
          <Link href="#" className="text-ink-secondary hover:text-brand-cyan transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-ink-secondary hover:text-brand-cyan transition-colors">
            Privacy Policy
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-ink-muted bg-base">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Login link */}
      <Link href="/login">
        <GlowButton variant="secondary" size="lg" className="w-full">
          Sign in instead
        </GlowButton>
      </Link>
    </AuthShell>
  )
}