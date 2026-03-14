import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DM_Sans, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google'

import { ThemeProvider } from '@/components/theme/theme-provider'

import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin']
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin']
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500']
})

export const metadata: Metadata = {
  title: 'AniKrewe',
  description: 'Anime community operations hub powered by ADK, MCP, and A2A'
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
