'use client'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchPartners } from '@/lib/api'
import { Handshake } from 'lucide-react'

export default function PartnersSection() {
  const { data: partners = [] } = useQuery({ queryKey: ['partners'], queryFn: fetchPartners })

  if (partners.length === 0) return null

  return (
    <section className="py-16 bg-[var(--gold-pale)] border-y border-[var(--gold)]/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-[var(--gold)] mb-2">
            <Handshake size={18} />
            <span className="font-bold text-sm uppercase tracking-widest">Our Partners</span>
          </div>
          <p className="text-gray-500 text-sm">Collaborating with like-minded organisations to maximise our impact</p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {partners.map((partner: { id: number; name: string; logo_url?: string; website_url?: string }) => (
            <div key={partner.id} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
              {partner.website_url ? (
                <a href={partner.website_url} target="_blank" rel="noopener noreferrer" aria-label={partner.name}>
                  {partner.logo_url ? (
                    <Image src={partner.logo_url} alt={partner.name} width={120} height={50} className="object-contain h-10 w-auto" />
                  ) : (
                    <span className="text-[var(--navy)] font-bold text-sm">{partner.name}</span>
                  )}
                </a>
              ) : (
                <span className="text-[var(--navy)] font-bold text-sm">{partner.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
