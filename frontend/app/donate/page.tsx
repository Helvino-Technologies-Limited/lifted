import PublicLayout from '@/components/layout/PublicLayout'
import DonateContent from '@/components/sections/DonateContent'

export const metadata = { title: 'Donate — Support Our Mission' }

export default function DonatePage() {
  return (
    <PublicLayout>
      <DonateContent />
    </PublicLayout>
  )
}
