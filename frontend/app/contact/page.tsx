import PublicLayout from '@/components/layout/PublicLayout'
import ContactContent from '@/components/sections/ContactContent'

export const metadata = { title: 'Contact Us' }

export default function Contact() {
  return (
    <PublicLayout>
      <ContactContent />
    </PublicLayout>
  )
}
