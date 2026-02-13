import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mind Map Maker - Create Interactive Mind Maps",
  description:
    "Create beautiful, interactive mind maps for learning, brainstorming, and organizing ideas. Free online mind mapping tool.",
  keywords: "mind map, mindmap, brainstorming, learning, organization, visual thinking",
  authors: [{ name: "Mind Map Maker" }],
  creator: "Mind Map Maker",
  publisher: "Mind Map Maker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.mind-map-maker.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mind Map Maker - Create Interactive Mind Maps",
    description:
      "Create beautiful, interactive mind maps for learning, brainstorming, and organizing ideas. Free online mind mapping tool.",
    url: "https://www.mind-map-maker.com",
    siteName: "Mind Map Maker",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Mind Map Maker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mind Map Maker - Create Interactive Mind Maps",
    description:
      "Create beautiful, interactive mind maps for learning, brainstorming, and organizing ideas. Free online mind mapping tool.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ICO fallback for older browsers */}
        <link rel="icon" href="/favicon.png" sizes="any" />
        {/* Plausible analytics */}
        <script defer data-domain="mind-map-maker.com" src="https://plausible.io/js/script.js"></script>

        {/* Modern PNG favicons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        {/* Android/Chrome/PWA */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
