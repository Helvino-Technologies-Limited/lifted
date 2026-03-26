'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings, fetchPageContent } from '@/lib/api'
import { ChevronDown, Play, Pause } from 'lucide-react'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80',
  'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1600&q=80',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&q=80',
]

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [bgIndex, setBgIndex] = useState(0)

  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: content = {} } = useQuery({ queryKey: ['content', 'home'], queryFn: () => fetchPageContent('home') })

  const videoUrl = settings.hero_video_url || ''
  const logoUrl = settings.hero_logo_url || ''

  // Cycle background images when no video
  useEffect(() => {
    if (videoUrl) return
    const timer = setInterval(() => setBgIndex((i) => (i + 1) % FALLBACK_IMAGES.length), 6000)
    return () => clearInterval(timer)
  }, [videoUrl])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) videoRef.current.pause()
    else videoRef.current.play()
    setPlaying(!playing)
  }

  const heroTitle = content?.hero?.title || 'Lifting Lives, Building Futures'
  const heroSubtitle = content?.hero?.subtitle || 'Together, we create a legacy of transformed individuals lifting others in our communities.'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          {FALLBACK_IMAGES.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-2000"
              style={{ opacity: i === bgIndex ? 1 : 0 }}
            >
              <Image
                src={src}
                alt="Hero background"
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          ))}
        </>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--gold)] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--navy-light)] opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white pt-20">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="LIFTED TO LIFT"
              width={110}
              height={110}
              className="rounded-full object-cover shadow-2xl border-4 border-[var(--gold)] animate-float"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-2xl border-4 border-white/30 animate-float">
              <span className="text-[var(--navy-dark)] font-black text-2xl">L2L</span>
            </div>
          )}
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold-light)] text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--gold-light)] animate-pulse" />
          Blessed to be a Blessing
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 drop-shadow-2xl">
          {heroTitle.split(' ').map((word: string, i: number, arr: string[]) =>
            i >= arr.length - 2 ? (
              <span key={i} className="text-gradient"> {word}</span>
            ) : (
              <span key={i}> {word}</span>
            )
          )}
        </h1>

        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow">
          {heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/programs"
            className="btn-primary px-8 py-4 rounded-full text-base font-bold inline-flex items-center gap-2 group"
          >
            Explore Our Pillars
            <span className="w-6 h-6 rounded-full bg-[var(--navy-dark)]/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link href="/contact" className="btn-outline-white px-8 py-4 rounded-full text-base">
            Get Involved
          </Link>
        </div>

        {/* Vision tagline */}
        <div className="mt-16 text-sm text-gray-300 italic tracking-wide opacity-80">
          &ldquo;A legacy of transformed individuals lifting others&rdquo;
        </div>
      </div>

      {/* Video controls */}
      {videoUrl && (
        <button
          onClick={togglePlay}
          className="absolute bottom-24 right-8 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center hover:bg-white/30 transition-all text-white"
          aria-label={playing ? 'Pause video' : 'Play video'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/60">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={18} className="animate-bounce" />
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fdfaf4" />
        </svg>
      </div>
    </section>
  )
}
