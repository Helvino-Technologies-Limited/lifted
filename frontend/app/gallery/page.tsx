import PublicLayout from '@/components/layout/PublicLayout'
import GalleryContent from '@/components/sections/GalleryContent'

export const metadata = { title: 'Gallery' }

export default function Gallery() {
  return (
    <PublicLayout>
      <GalleryContent />
    </PublicLayout>
  )
}
