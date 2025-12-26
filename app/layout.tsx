import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JSON Vibe - Editor',
  description: 'A modern, ultra-minimalist dark mode JSON Editor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen flex flex-col overflow-hidden selection:bg-primary/30 selection:text-white">
        {children}
      </body>
    </html>
  )
}

