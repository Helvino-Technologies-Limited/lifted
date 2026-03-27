'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchNewsBySlug } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowLeft, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['news', slug],
    queryFn: () => fetchNewsBySlug(slug),
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[var(--cream)]">
          <div className="w-8 h-8 border-3 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    )
  }

  if (isError || !article) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--cream)] gap-4">
          <p className="text-2xl font-black text-[var(--navy)]">Story not found</p>
          <Link href="/news" className="btn-primary px-6 py-2.5 rounded-full font-bold text-sm">Back to News</Link>
        </div>
        <Footer />
      </>
    )
  }

  const youtubeEmbed = article.video_url ? getYouTubeEmbedUrl(article.video_url) : null
  const isUploadedVideo = article.video_url && !youtubeEmbed

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[var(--cream)] min-h-screen">
        <article className="max-w-3xl mx-auto px-4 py-16">
          {/* Back */}
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:underline mb-8">
            <ArrowLeft size={15} /> Back to News
          </Link>

          {/* Cover image */}
          {article.image_url && (
            <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-xl">
              <Image src={article.image_url} alt={article.title} fill className="object-cover" priority />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-4 flex-wrap">
            <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(article.created_at)}</span>
            {article.author && <span className="flex items-center gap-1.5"><User size={13} />{article.author}</span>}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-[var(--navy)] leading-tight mb-6">{article.title}</h1>

          {article.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-8 border-l-4 border-[var(--gold)] pl-4">{article.excerpt}</p>
          )}

          {/* Video */}
          {(youtubeEmbed || isUploadedVideo) && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              {youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={article.title}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={article.video_url} controls className="w-full aspect-video bg-black" />
              )}
            </div>
          )}

          {/* Body */}
          {article.body && (
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {article.body}
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
