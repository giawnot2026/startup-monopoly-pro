import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Startup Race | Pro',
  description: 'The grid is your market',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="antialiased bg-[#020617] text-white">
        {children}
      </body>
    </html>
  )
}
