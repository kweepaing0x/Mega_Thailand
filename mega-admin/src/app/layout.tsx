import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mega Thailand — Admin',
  description: 'Admin panel for Mega Thailand dropshipping platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
