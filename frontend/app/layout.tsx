import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Bebas_Neue } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
})

export const metadata: Metadata = {
  title: "DocMind — Chat with any document",
  description:
    "Premium RAG platform. Upload documents, ask questions, get cited answers in real time.",
  metadataBase: new URL("https://docmind.app"),
  openGraph: {
    title: "DocMind",
    description: "Chat with any document. Cited. Streamed. Yours.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${bebas.variable} dark`}
    >
      <body className="bg-base text-ink-primary antialiased min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(12px)",
              color: "#F8FAFC",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  )
}