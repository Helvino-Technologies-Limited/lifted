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
  metadataBase: new URL('https://liftedtolift.org'),
  title: {
    default: 'LIFTED TO LIFT | Blessed to be a Blessing',
    template: '%s | LIFTED TO LIFT',
  },
  description:
    'LIFTED TO LIFT is a community-driven NGO in Kenya committed to transforming lives through education, youth empowerment, senior citizen welfare, and community stewardship. Blessed to be a Blessing.',
  keywords: [
    'NGO Kenya', 'LIFTED TO LIFT', 'charity Kenya', 'education Kenya',
    'youth empowerment Kenya', 'community development Kenya', 'senior citizen welfare',
    'sponsor a child Kenya', 'donate Kenya NGO', 'nonprofit Kenya',
    'community outreach Kenya', 'institutional stewardship', 'blessed to be a blessing',
  ],
  authors: [{ name: 'LIFTED TO LIFT', url: 'https://liftedtolift.org' }],
  creator: 'LIFTED TO LIFT',
  publisher: 'LIFTED TO LIFT',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'LIFTED TO LIFT — Blessed to be a Blessing',
    description: 'A legacy of transformed individuals lifting others through education, youth empowerment, and community stewardship in Kenya.',
    type: 'website',
    url: 'https://liftedtolift.org',
    siteName: 'LIFTED TO LIFT',
    locale: 'en_KE',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LIFTED TO LIFT — Blessed to be a Blessing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LIFTED TO LIFT — Blessed to be a Blessing',
    description: 'A legacy of transformed individuals lifting others through education, youth empowerment, and community stewardship in Kenya.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: 'https://liftedtolift.org',
  },
  category: 'nonprofit',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'LIFTED TO LIFT',
  alternateName: 'L2L',
  url: 'https://liftedtolift.org',
  logo: 'https://liftedtolift.org/icon',
  description:
    'LIFTED TO LIFT is a community-driven NGO in Kenya committed to transforming lives through education, youth empowerment, senior citizen welfare, and community stewardship.',
  slogan: 'Blessed to be a Blessing',
  foundingLocation: { '@type': 'Country', name: 'Kenya' },
  areaServed: { '@type': 'Country', name: 'Kenya' },
  knowsAbout: ['Education', 'Youth Empowerment', 'Senior Citizen Welfare', 'Community Development'],
  sameAs: ['https://liftedtolift.org'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
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
