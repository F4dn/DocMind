"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi"
import { HiArrowRight } from "react-icons/hi2"
import { ImSpinner8 } from "react-icons/im"

import { AuthShell } from "@/components/auth/AuthShell"
import { AuthInput } from "@/components/auth/AuthInput"
import { GlowButton } from "@/components/shared/GlowButton"
import { authApi } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      Cookies.set("access_token", data.access_token, { expires: 1 })
      Cookies.set("refresh_token", data.refresh_token, { expires: 7 })
      toast.success("Welcome back")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed")
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
          Sign in
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-headline text-5xl md:text-6xl tracking-tight leading-[0.9] mb-3">
        <span className="text-gradient-subtle">WELCOME</span>{" "}
        <span className="text-gradient">BACK.</span>
      </h1>

      <p className="text-sm text-ink-secondary mb-10">
        Sign in to continue chatting with your documents.
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <div className="flex items-center justify-end">
          <Link
            href="#"
            className="text-xs font-mono uppercase tracking-wider text-ink-secondary hover:text-brand-cyan transition-colors"
          >
            Forgot password?
          </Link>
        </div>

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
              Sign in <HiArrowRight className="w-4 h-4" />
            </>
          )}
        </GlowButton>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-ink-muted bg-base">
            New to DocMind?
          </span>
        </div>
      </div>

      {/* Register link */}
      <Link href="/register">
        <GlowButton variant="secondary" size="lg" className="w-full">
          Create an account
        </GlowButton>
      </Link>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[10px] font-mono uppercase tracking-wider text-ink-muted text-center mt-10"
      >
        Protected by encryption · GDPR compliant
      </motion.p>
    </AuthShell>
  )
}