import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { AchievementTracker } from "@/components/achievement-tracker"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dreamweaver Oracle Engine - AI Roleplay Platform",
  description:
    "Advanced AI-powered roleplay engine with multi-character adventures, world building, and intelligent character memory systems. Powered by xAI Grok.",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.jpg",
    apple: "/icons/apple-touch-icon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Oracle Engine",
  },
  applicationName: "Dreamweaver Oracle Engine",
  keywords: ["AI roleplay", "character AI", "interactive stories", "AI chat", "creative writing", "world building"],
}

export const viewport: Viewport = {
  themeColor: "#8B0000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Oracle Engine" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Dreamweaver Oracle Engine" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[SW] Registration successful:', registration.scope);
                    },
                    function(err) {
                      console.log('[SW] Registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            <AchievementTracker />
            <PWAInstallPrompt />
            {children}
            <Toaster />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
