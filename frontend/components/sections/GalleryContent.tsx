'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchMedia } from '@/lib/api'
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHero from '@/components/ui/PageHero'

type MediaItem = { id: number; url: string; type: string; alt_text?: string; caption?: string }

function LightboxModal({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: MediaItem[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const item = items[index]
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-5xl w-full mx-4 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors p-2 z-10">
          <X size={24} />
        </button>
        <button onClick={onPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/70 hover:text-white transition-colors p-2 z-10 hidden md:block">
          <ChevronLeft size={32} />
        </button>
        <button onClick={onNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/70 hover:text-white transition-colors p-2 z-10 hidden md:block">
          <ChevronRight size={32} />
        </button>

        {item.type === 'video' ? (
          <video src={item.url} controls autoPlay className="w-full max-h-[80vh] rounded-xl" />
        ) : (
          <div className="relative max-h-[80vh] flex items-center justify-center">
            <Image
              src={item.url}
              alt={item.alt_text || ''}
              width={1200}
              height={800}
              className="object-contain max-h-[80vh] rounded-xl w-auto mx-auto"
            />
          </div>
        )}
        {item.caption && (
          <div className="text-center mt-4 text-white/80 text-sm">{item.caption}</div>
        )}
        <div className="text-center mt-2 text-white/40 text-xs">{index + 1} / {items.length}</div>
      </div>
    </div>
  )
}

const FILTERS = ['All', 'Education', 'Youth', 'Seniors', 'Community', 'Videos']

export default function GalleryContent() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const { data: media = [] } = useQuery({
    queryKey: ['media', 'all'],
    queryFn: () => fetchMedia(),
  })

  const items: MediaItem[] = media

  const filtered = activeFilter === 'All'
    ? items
    : activeFilter === 'Videos'
      ? items.filter((i: MediaItem) => i.type === 'video')
      : items.filter((i: MediaItem) => (i.caption || '').toLowerCase().includes(activeFilter.toLowerCase()))

  return (
    <>
      <PageHero
        title="Gallery"
        subtitle="Moments captured from our journey of lifting lives and transforming communities."
        breadcrumb="Gallery"
      />

      {/* Filters */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === f
                  ? 'bg-[var(--navy)] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-[var(--gold-pale)] hover:text-[var(--gold)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="py-16 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((item: MediaItem, i: number) => (
              <div
                key={item.id}
                className="break-inside-avoid relative overflow-hidden rounded-2xl cursor-pointer group shadow-md"
                onClick={() => setLightboxIndex(i)}
              >
                {item.type === 'video' ? (
                  <div className="relative bg-black aspect-video">
                    <video src={item.url} className="w-full opacity-70" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play size={24} className="text-[var(--navy)] ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt={item.alt_text || ''}
                    width={400}
                    height={300}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[var(--navy)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  {item.caption && (
                    <span className="text-white text-xs font-semibold bg-black/40 px-2 py-1 rounded-full">{item.caption}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && items.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">No gallery items yet</p>
              <p className="text-sm mt-1">Check back soon for photos and videos from our community.</p>
            </div>
          )}
          {filtered.length === 0 && items.length > 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No items found for &ldquo;{activeFilter}&rdquo;</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <LightboxModal
          items={filtered}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : filtered.length - 1))}
          onNext={() => setLightboxIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : 0))}
        />
      )}
    </>
  )
}
