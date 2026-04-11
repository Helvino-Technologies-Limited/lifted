'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings, fetchPageContent } from '@/lib/api'
import { CheckCircle } from 'lucide-react'

const highlights = [
  'Partnering directly with public primary and junior schools',
  'Providing scholarships that change the trajectory of young lives',
  'Equipping youth with hands-on technical and vocational skills',
  'Ensuring elderly citizens live in dignity and comfort',
  'Building lasting institutional legacies for future generations',
]

export default function ImpactSection() {
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: homeContent = {} } = useQuery({
    queryKey: ['content', 'home'],
    queryFn: () => fetchPageContent('home'),
  })

  const storyImages = [1, 2, 3, 4].map((i) => ({
    src: (homeContent as Record<string, Record<string, string>>)?.story_images?.[`image${i}`] || null,
  }))

  return (
    <section className="py-24 bg-[var(--gold-pale)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images collage */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {storyImages.map((img, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl shadow-lg ${i === 0 ? 'row-span-1 h-56' : i === 1 ? 'h-40' : i === 2 ? 'h-40' : 'h-56'}`}
                  style={{ transform: i % 2 === 1 ? 'translateY(20px)' : 'translateY(0)' }}
                >
                  {img.src ? (
                    <Image
                      src={img.src}
                      alt="Our story"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--gold-pale)]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Text content */}
          <div>
            <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--navy)] mt-2 mb-6 leading-tight">
              Transforming Communities,<br />
              <span className="text-gradient">One Life at a Time</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              {settings.about_story || 'LIFTED TO LIFT was founded on the belief that every individual who has been blessed with opportunities has a responsibility to lift others. Our journey began in the heart of Kenya, driven by a vision of transformed communities.'}
            </p>
            <ul className="space-y-3 mb-8">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-[var(--gold)] mt-0.5 shrink-0" />
                  <span className="text-gray-600 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 flex-wrap">
              <Link href="/about" className="btn-primary px-6 py-3 rounded-full font-bold">
                Our Full Story
              </Link>
              <Link href="/programs" className="border-2 border-[var(--navy)] text-[var(--navy)] px-6 py-3 rounded-full font-bold hover:bg-[var(--navy)] hover:text-white transition-all">
                Our Programs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
