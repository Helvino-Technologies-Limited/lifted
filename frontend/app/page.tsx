import PublicLayout from '@/components/layout/PublicLayout'
import HeroSection from '@/components/sections/HeroSection'
import StatsSection from '@/components/sections/StatsSection'
import PillarsOverview from '@/components/sections/PillarsOverview'
import ImpactSection from '@/components/sections/ImpactSection'
import GalleryPreview from '@/components/sections/GalleryPreview'
import ValuesSection from '@/components/sections/ValuesSection'
import NewsSection from '@/components/sections/NewsSection'
import PartnersSection from '@/components/sections/PartnersSection'
import CTASection from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <StatsSection />
      <PillarsOverview />
      <ImpactSection />
      <ValuesSection />
      <GalleryPreview />
      <NewsSection />
      <PartnersSection />
      <CTASection />
    </PublicLayout>
  )
}
