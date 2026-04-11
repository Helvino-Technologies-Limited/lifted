'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchNews } from '@/lib/api'
import { ArrowRight, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function NewsSection() {
  const { data: news = [] } = useQuery({
    queryKey: ['news', 'published', 'featured'],
    queryFn: () => fetchNews({ published: 'true' }),
  })

  const displayNews = news.slice(0, 3)

  if (displayNews.length === 0) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">Latest Updates</span>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--navy)] mt-2">
              News & Stories
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Stories of transformation, impact, and hope from our community.
            </p>
          </div>
          <Link href="/news" className="flex items-center gap-2 text-[var(--gold)] font-bold hover:gap-3 transition-all group shrink-0">
            All Stories <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayNews.map((item: { id: number; title: string; excerpt?: string; image_url?: string; created_at: string; slug: string }, i: number) => (
            <Link
              key={item.id}
              href={item.slug === '#' ? '#' : `/news/${item.slug}`}
              className="group card-hover rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col"
            >
              <div className="relative h-52 overflow-hidden">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--gold-pale)] flex items-center justify-center">
                    <span className="text-[var(--gold)] text-4xl font-black">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                  <Calendar size={12} />
                  {formatDate(item.created_at)}
                </div>
                <h3 className="font-black text-[var(--navy)] text-base leading-tight mb-2 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">{item.excerpt}</p>
                <div className="mt-4 flex items-center gap-1 text-[var(--gold)] text-sm font-semibold group-hover:gap-2 transition-all">
                  Read more <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
