'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchNews } from '@/lib/api'
import { Calendar, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import PageHero from '@/components/ui/PageHero'

const PLACEHOLDER = [
  { id: 1, title: 'New Scholarship Programme Launches for Rural Students', excerpt: 'LIFTED TO LIFT announces a groundbreaking scholarship initiative supporting 50 students from public primary schools.', image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', created_at: new Date().toISOString(), slug: '#' },
  { id: 2, title: 'Youth Skills Training Cohort Graduates 30 Young People', excerpt: 'Our latest youth empowerment cohort completed hands-on technical training, ready to enter the workforce.', image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), slug: '#' },
  { id: 3, title: 'Partnership to Provide Essential Resources to 12 Schools', excerpt: 'A new partnership ensures that 12 local schools receive books, stationery, and learning materials this year.', image_url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&q=80', created_at: new Date(Date.now() - 14 * 86400000).toISOString(), slug: '#' },
  { id: 4, title: 'Senior Welfare Drive: Clothing and Food Distribution', excerpt: 'Our team distributed essential clothing and food packages to over 80 senior citizens in the community.', image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80', created_at: new Date(Date.now() - 21 * 86400000).toISOString(), slug: '#' },
]

export default function NewsContent() {
  const { data: news = [] } = useQuery({
    queryKey: ['news', 'published'],
    queryFn: () => fetchNews({ published: 'true' }),
  })

  const items = news.length > 0 ? news : PLACEHOLDER

  return (
    <>
      <PageHero
        title="News & Stories"
        subtitle="Stories of transformation, hope, and community impact from the heart of our work."
        breadcrumb="News"
      />

      <section className="py-24 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Featured */}
          {items.length > 0 && (
            <div className="mb-16">
              <Link
                href={items[0].slug === '#' ? '#' : `/news/${items[0].slug}`}
                className="group grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white card-hover"
              >
                <div className="relative h-72 lg:h-auto">
                  {items[0].image_url ? (
                    <Image
                      src={items[0].image_url}
                      alt={items[0].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--navy)]" />
                  )}
                  <div className="absolute top-4 left-4 bg-[var(--gold)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    Featured Story
                  </div>
                </div>
                <div className="p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                    <Calendar size={12} />
                    {formatDate(items[0].created_at)}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-[var(--navy)] leading-tight mb-4 group-hover:text-[var(--gold)] transition-colors">
                    {items[0].title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed mb-6">{items[0].excerpt}</p>
                  <div className="flex items-center gap-2 text-[var(--gold)] font-bold">
                    Read Story <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.slice(1).map((item: { id: number; title: string; excerpt?: string; image_url?: string; created_at: string; slug: string }) => (
              <Link
                key={item.id}
                href={item.slug === '#' ? '#' : `/news/${item.slug}`}
                className="group card-hover rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--gold-pale)] flex items-center justify-center">
                      <span className="text-[var(--gold)] text-4xl font-black">{item.id}</span>
                    </div>
                  )}
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
                  <div className="mt-4 flex items-center gap-1 text-[var(--gold)] text-sm font-semibold">
                    Read more <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
