import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Startup Monopoly',
  description: 'The grid is your market',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
