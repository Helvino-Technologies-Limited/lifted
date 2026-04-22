'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchChildren } from '@/lib/api'
import { Heart, Mail } from 'lucide-react'
import PageHero from '@/components/ui/PageHero'

type Child = {
  id: number
  name: string
  age?: number
  grade?: string
  story?: string
  photo_url?: string
  sponsored: boolean
}

export default function SponsorContent() {
  const { data: children = [] } = useQuery({
    queryKey: ['children', 'active'],
    queryFn: () => fetchChildren({ active: 'true' }),
  })

  const available = (children as Child[]).filter(c => !c.sponsored)
  const sponsored = (children as Child[]).filter(c => c.sponsored)

  return (
    <>
      <PageHero
        title="Sponsor a Child"
        subtitle="Your sponsorship provides a child with education, meals, and hope for a brighter future."
        breadcrumb="Sponsor a Child"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Intro */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-[var(--gold)]/10 text-[var(--gold)] text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full mb-4">
              <Heart size={13} /> Make a Difference
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--navy)] mb-4">Children Waiting for a Sponsor</h2>
            <p className="text-gray-600 leading-relaxed">
              Each child below has a unique story. Your monthly sponsorship covers school fees, meals, and essential supplies — giving them the foundation to thrive.
            </p>
          </div>

          {/* Available children */}
          {available.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {available.map((child) => (
                  <div key={child.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative h-56 bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)]">
                      {child.photo_url ? (
                        <Image src={child.photo_url} alt={child.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart size={48} className="text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="font-black text-lg">{child.name}</p>
                        {(child.age || child.grade) && (
                          <p className="text-white/80 text-sm">
                            {child.age ? `Age ${child.age}` : ''}{child.age && child.grade ? ' · ' : ''}{child.grade || ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      {child.story && <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{child.story}</p>}
                      <Link
                        href="/contact"
                        className="mt-4 w-full flex items-center justify-center gap-2 btn-primary py-2.5 px-4 rounded-xl font-bold text-sm"
                      >
                        <Heart size={14} /> Sponsor {child.name.split(' ')[0]}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl mb-16">
              <Heart size={40} className="text-[var(--gold)] mx-auto mb-3" />
              <p className="text-[var(--navy)] font-black text-xl">All children are currently sponsored!</p>
              <p className="text-gray-500 mt-2 text-sm">Check back soon or contact us to learn about other ways to help.</p>
            </div>
          )}

          {/* Sponsored section */}
          {sponsored.length > 0 && (
            <div className="border-t border-gray-100 pt-12">
              <h3 className="text-xl font-black text-[var(--navy)] mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Heart size={12} className="text-green-600" />
                </span>
                Already Sponsored ({sponsored.length})
              </h3>
              <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sponsored.map((child) => (
                  <div key={child.id} className="bg-green-50 rounded-xl p-4 flex items-center gap-3 border border-green-100">
                    <div className="relative w-10 h-10 shrink-0">
                      {child.photo_url ? (
                        <Image src={child.photo_url} alt={child.name} fill className="rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-green-200 flex items-center justify-center">
                          <Heart size={14} className="text-green-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[var(--navy)] text-xs truncate">{child.name}</p>
                      {child.age && <p className="text-green-600 text-xs">Age {child.age}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] rounded-3xl p-10 text-center text-white">
            <h3 className="text-2xl font-black mb-3">Ready to Change a Life?</h3>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">Reach out to us to begin your sponsorship journey. We will connect you with a child and guide you through the process.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 btn-primary px-8 py-3 rounded-xl font-bold">
              <Mail size={16} /> Contact Us to Sponsor
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
