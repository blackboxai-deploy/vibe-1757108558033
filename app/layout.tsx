import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3D Car Racing Game',
  description: 'Professional 3D car racing game with obstacle navigation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900">
        {children}
      </body>
    </html>
  )
}