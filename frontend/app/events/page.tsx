import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query'
import PublicLayout from '@/components/layout/PublicLayout'
import EventsContent from '@/components/sections/EventsContent'
import { fetchEvents } from '@/lib/api'

export const metadata = { title: 'Upcoming Events — LIFTED TO LIFT' }
export const revalidate = 300

export default async function EventsPage() {
  const queryClient = new QueryClient()
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['events', 'published'],
      queryFn: () => fetchEvents({ published: 'true' }),
    }),
  ])
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicLayout>
        <EventsContent />
      </PublicLayout>
    </HydrationBoundary>
  )
}
