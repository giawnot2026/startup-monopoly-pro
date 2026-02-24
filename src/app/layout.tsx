// src/app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'Startup Race',
  description: 'The Ultimate Founder Simulator',
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
