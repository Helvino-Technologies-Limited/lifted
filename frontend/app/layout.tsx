import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'LIFTED TO LIFT | Blessed to be a Blessing',
    template: '%s | LIFTED TO LIFT',
  },
  description:
    'LIFTED TO LIFT is a community-driven organisation committed to transforming lives through education, youth empowerment, senior welfare, and community stewardship in Kenya.',
  keywords: ['NGO Kenya', 'LIFTED TO LIFT', 'education', 'youth empowerment', 'community development'],
  openGraph: {
    title: 'LIFTED TO LIFT — Blessed to be a Blessing',
    description: 'A legacy of transformed individuals lifting others.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '10px', background: '#87ceeb', color: '#fff' },
              success: { style: { background: '#2d7a4e' } },
              error: { style: { background: '#c0392b' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
