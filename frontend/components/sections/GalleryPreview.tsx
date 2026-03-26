'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchMedia } from '@/lib/api'
import { ArrowRight, ImageIcon } from 'lucide-react'

const PLACEHOLDER_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80', alt: 'Happy children', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1560252829-804f1aedf1be?w=600&q=80', alt: 'Community', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', alt: 'Education', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&q=80', alt: 'Youth', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80', alt: 'Seniors', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80', alt: 'Partnership', type: 'image' },
]

export default function GalleryPreview() {
  const { data: media = [] } = useQuery({
    queryKey: ['media', 'gallery', 'featured'],
    queryFn: () => fetchMedia({ featured: 'true' }),
  })

  const displayItems = media.length > 0 ? media.slice(0, 6) : PLACEHOLDER_IMAGES

  return (
    <section className="py-24 bg-[var(--cream)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">Gallery</span>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--navy)] mt-2">
              Moments of Impact
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              A glimpse into the lives we touch and the communities we serve.
            </p>
          </div>
          <Link href="/gallery" className="flex items-center gap-2 text-[var(--gold)] font-bold hover:gap-3 transition-all group shrink-0">
            View Full Gallery
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayItems.slice(0, 6).map((item: { url: string; alt?: string; alt_text?: string; type: string }, i: number) => (
            <div
              key={item.url + i}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer
                ${i === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-[4/3]'}
                ${i === 4 ? 'col-span-2 md:col-span-1' : ''}
              `}
            >
              <Image
                src={item.url}
                alt={item.alt_text || item.alt || 'Gallery image'}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[var(--navy)] opacity-0 group-hover:opacity-40 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                  <ImageIcon size={20} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
