import { NoiseTexture } from "@/components/shared/NoiseTexture"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <NoiseTexture />
      {children}
    </div>
  )
}