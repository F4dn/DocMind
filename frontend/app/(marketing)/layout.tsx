import { Navbar } from "@/components/marketing/Navbar"
import { Footer } from "@/components/marketing/Footer"
import { NoiseTexture } from "@/components/shared/NoiseTexture"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <NoiseTexture />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}