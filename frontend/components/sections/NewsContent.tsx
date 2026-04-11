'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchNews, fetchNewsletters } from '@/lib/api'
import { Calendar, ArrowRight, PlayCircle, FileText, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import PageHero from '@/components/ui/PageHero'

type NewsItem = { id: number; title: string; excerpt?: string; image_url?: string; video_url?: string; created_at: string; slug: string }
type Newsletter = { id: number; title: string; description?: string; file_url?: string; cover_image_url?: string; created_at: string }

export default function NewsContent() {
  const [activeTab, setActiveTab] = useState<'stories' | 'newsletters'>('stories')

  const { data: news = [] } = useQuery({
    queryKey: ['news', 'published'],
    queryFn: () => fetchNews({ published: 'true' }),
  })

  const { data: newsletters = [] } = useQuery({
    queryKey: ['newsletters', 'published'],
    queryFn: () => fetchNewsletters({ published: 'true' }),
  })

  const items: NewsItem[] = news

  return (
    <>
      <PageHero
        title="News & Stories"
        subtitle="Stories of transformation, hope, and community impact from the heart of our work."
        breadcrumb="News"
      />

      <section className="py-24 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4">

          {/* Tabs */}
          <div className="flex gap-2 mb-12 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('stories')}
              className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 -mb-px ${activeTab === 'stories' ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent text-gray-400 hover:text-[var(--navy)]'}`}
            >
              Stories & Updates
            </button>
            <button
              onClick={() => setActiveTab('newsletters')}
              className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${activeTab === 'newsletters' ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent text-gray-400 hover:text-[var(--navy)]'}`}
            >
              <FileText size={13} /> Newsletters
              {newsletters.length > 0 && (
                <span className="ml-1 bg-[var(--gold)] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{newsletters.length}</span>
              )}
            </button>
          </div>

          {/* Stories Tab */}
          {activeTab === 'stories' && (
            <>
              {items.length === 0 && (
                <div className="text-center py-24 text-gray-400">
                  <Calendar size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-lg">No stories yet</p>
                  <p className="text-sm mt-1">Check back soon for updates from our community.</p>
                </div>
              )}
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
                      {items[0].video_url && (
                        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <PlayCircle size={12} /> Video
                        </div>
                      )}
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
                {items.slice(1).map((item) => (
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
                      {item.video_url && (
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <PlayCircle size={10} /> Video
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
            </>
          )}

          {/* Newsletters Tab */}
          {activeTab === 'newsletters' && (
            <div>
              {newsletters.length === 0 ? (
                <div className="text-center py-24 text-gray-400">
                  <FileText size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-lg">No newsletters yet</p>
                  <p className="text-sm mt-1">Check back soon for community newsletters.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {newsletters.map((item: Newsletter) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
                      {item.cover_image_url ? (
                        <div className="relative h-48">
                          <Image src={item.cover_image_url} alt={item.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-[var(--gold-pale)] to-[var(--cream)] flex items-center justify-center">
                          <FileText size={48} className="text-[var(--gold)] opacity-50" />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                          <Calendar size={12} />
                          {formatDate(item.created_at)}
                        </div>
                        <h3 className="font-black text-[var(--navy)] text-base leading-tight mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">{item.description}</p>
                        )}
                        {item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white bg-[var(--gold)] hover:bg-[var(--gold-light)] px-4 py-2 rounded-full transition-colors w-fit"
                          >
                            <Download size={14} /> Read Newsletter
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  )
}
