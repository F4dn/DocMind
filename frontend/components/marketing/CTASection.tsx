"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { FaGithub } from "react-icons/fa"
import { FiArrowRight } from "react-icons/fi"
// import { ArrowRight, Github } from "lucide-react"
import { GradientBlob } from "@/components/shared/GradientBlob"
import { GlowButton } from "@/components/shared/GlowButton"

export function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <GradientBlob className="-top-20 left-1/4" color="purple" size="lg" />
      <GradientBlob className="-bottom-20 right-1/4" color="cyan" size="lg" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-strong rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
        >
          {/* Inner gradient accent */}
          <div className="absolute inset-0 bg-brand-gradient-soft opacity-50 pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-10 bg-brand-cyan" />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
                Ready when you are
              </span>
              <div className="h-px w-10 bg-brand-cyan" />
            </div>

            <h2 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] mb-6">
              <span className="text-gradient-subtle">START BUILDING</span>
              <br />
              <span className="text-gradient">IN 60 SECONDS.</span>
            </h2>

            <p className="text-base md:text-lg text-ink-secondary max-w-xl mx-auto mb-10 leading-relaxed">
              No credit card. Just clone, compose, and chat. Your first cited answer is one upload away.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <GlowButton size="lg" className="w-full sm:w-auto">
                  Get started free <FiArrowRight className="w-4 h-4" />
                </GlowButton>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener">
                <GlowButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  <FaGithub className="w-4 h-4" /> Star on GitHub
                </GlowButton>
              </a>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              <span>✓ Open source</span>
              <span>✓ Self-hostable</span>
              <span>✓ Production-ready</span>
              <span>✓ MIT licensed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}