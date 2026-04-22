import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query'
import PublicLayout from '@/components/layout/PublicLayout'
import NeedsContent from '@/components/sections/NeedsContent'
import { fetchNeeds } from '@/lib/api'

export const metadata = { title: 'Our Needs — LIFTED TO LIFT' }
export const revalidate = 300

export default async function NeedsPage() {
  const queryClient = new QueryClient()
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['needs', 'active'],
      queryFn: () => fetchNeeds({ active: 'true' }),
    }),
  ])
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicLayout>
        <NeedsContent />
      </PublicLayout>
    </HydrationBoundary>
  )
}
