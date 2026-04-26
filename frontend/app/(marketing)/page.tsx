import { Hero } from "@/components/marketing/Hero"
import { LogoCloud } from "@/components/marketing/LogoCloud"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { FeatureGrid } from "@/components/marketing/FeatureGrid"
import { DemoSection } from "@/components/marketing/DemoSection"
import { Pricing } from "@/components/marketing/Pricing"
import { CTASection } from "@/components/marketing/CTASection"

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LogoCloud />
      <HowItWorks />
      <FeatureGrid />
      <DemoSection />
      <Pricing />
      <CTASection />
    </>
  )
}