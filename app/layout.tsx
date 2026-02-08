import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Intention - Your Social Universe',
  description: 'Manage your relationships and stay connected with the people who matter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-bg-primary min-h-screen">
        {children}
      </body>
    </html>
  )
}
