import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query'
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
import { fetchSettings, fetchPageContent, fetchMedia, fetchNews, fetchPartners } from '@/lib/api'

// Revalidate every 5 minutes — users always get cached data instantly;
// Render backend is only woken up during background ISR revalidation.
export const revalidate = 300

export default async function HomePage() {
  const queryClient = new QueryClient()

  // Prefetch all data needed by the homepage sections.
  // prefetchQuery never throws — if the backend is sleeping the cache stays
  // empty and components fall back to client-side fetching as before.
  await Promise.allSettled([
    queryClient.prefetchQuery({ queryKey: ['settings'], queryFn: fetchSettings }),
    queryClient.prefetchQuery({ queryKey: ['content', 'home'], queryFn: () => fetchPageContent('home') }),
    queryClient.prefetchQuery({ queryKey: ['media', 'gallery', 'featured'], queryFn: () => fetchMedia({ featured: 'true' }) }),
    queryClient.prefetchQuery({ queryKey: ['news', 'published', 'featured'], queryFn: () => fetchNews({ published: 'true' }) }),
    queryClient.prefetchQuery({ queryKey: ['partners'], queryFn: fetchPartners }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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
    </HydrationBoundary>
  )
}
