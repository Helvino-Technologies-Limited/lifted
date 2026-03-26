import PublicLayout from '@/components/layout/PublicLayout'
import NewsContent from '@/components/sections/NewsContent'

export const metadata = { title: 'News & Stories' }

export default function News() {
  return (
    <PublicLayout>
      <NewsContent />
    </PublicLayout>
  )
}
