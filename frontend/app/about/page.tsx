import PublicLayout from '@/components/layout/PublicLayout'
import AboutPage from '@/components/sections/AboutContent'

export const metadata = { title: 'About Us' }

export default function About() {
  return (
    <PublicLayout>
      <AboutPage />
    </PublicLayout>
  )
}
