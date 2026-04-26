"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { SectionHeading } from "./SectionHeading"
import { GlowButton } from "@/components/shared/GlowButton"

const tiers = [
  {
    name: "Free",
    tagline: "For exploring",
    price: "$0",
    period: "forever",
    cta: "Start free",
    href: "/register",
    featured: false,
    features: [
      "5 documents",
      "100 queries/month",
      "Gemini Flash model",
      "Public deploy",
      "Community support",
    ],
  },
  {
    name: "Pro",
    tagline: "For builders",
    price: "$19",
    period: "per month",
    cta: "Upgrade to Pro",
    href: "/register",
    featured: true,
    features: [
      "Unlimited documents",
      "10K queries/month",
      "Gemini Pro + GPT-4o",
      "Private deployments",
      "RAGAS eval reports",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For teams",
    price: "Custom",
    period: "annual",
    cta: "Talk to us",
    href: "#",
    featured: false,
    features: [
      "Everything in Pro",
      "Self-hosted option",
      "SSO + audit logs",
      "SLA + dedicated support",
      "Custom integrations",
      "Volume pricing",
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans."
          highlight="No surprises."
          description="Start free. Upgrade when you ship. Cancel any time."
          align="center"
        />

        <div className="mt-20 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                tier.featured
                  ? "glass-strong border-2 border-brand-purple/40 shadow-glow"
                  : "glass hover:border-white/20"
              } transition-all`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-gradient text-[10px] font-mono uppercase tracking-wider text-white shadow-glow-soft">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-cyan mb-3">
                  {tier.tagline}
                </div>
                <h3 className="font-headline text-4xl tracking-tight text-gradient-subtle mb-3">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline text-5xl text-gradient-subtle">
                    {tier.price}
                  </span>
                  <span className="text-xs font-mono text-ink-muted">/{tier.period}</span>
                </div>
              </div>

              <Link href={tier.href} className="block mb-6">
                <GlowButton
                  variant={tier.featured ? "primary" : "secondary"}
                  className="w-full"
                >
                  {tier.cta}
                </GlowButton>
              </Link>

              <div className="border-t border-white/5 pt-6">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.featured ? "text-brand-cyan" : "text-ink-muted"}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}