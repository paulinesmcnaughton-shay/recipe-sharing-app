import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "GatherBites — share and discover recipes",
  description: "A recipe sharing platform — browse, save, and upload recipes.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main
          className="flex-1 w-full"
          id="main-content"
          role="main"
          tabIndex={-1}
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
