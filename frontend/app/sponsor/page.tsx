import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query'
import PublicLayout from '@/components/layout/PublicLayout'
import SponsorContent from '@/components/sections/SponsorContent'
import { fetchChildren } from '@/lib/api'

export const metadata = { title: 'Sponsor a Child — LIFTED TO LIFT' }
export const revalidate = 300

export default async function SponsorPage() {
  const queryClient = new QueryClient()
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['children', 'active'],
      queryFn: () => fetchChildren({ active: 'true' }),
    }),
  ])
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicLayout>
        <SponsorContent />
      </PublicLayout>
    </HydrationBoundary>
  )
}
