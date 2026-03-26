import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  breadcrumb?: string
  image?: string
}

export default function PageHero({ title, subtitle, breadcrumb, image }: Props) {
  return (
    <div
      className="relative pt-32 pb-20 flex items-center justify-center text-white overflow-hidden"
      style={{
        background: image
          ? undefined
          : 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 60%, var(--navy-light) 100%)',
      }}
    >
      {image && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
      )}

      {/* Decorative dots */}
      <div className="absolute top-20 right-20 w-32 h-32 opacity-10">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[var(--gold)]"
            style={{ top: `${Math.floor(i / 3) * 16}px`, left: `${(i % 3) * 16}px` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {breadcrumb && (
          <div className="flex items-center justify-center gap-2 text-gray-300 text-sm mb-5">
            <Link href="/" className="hover:text-[var(--gold)] transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[var(--gold)]">{breadcrumb}</span>
          </div>
        )}
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">{title}</h1>
        {subtitle && (
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        )}
        <div className="w-20 h-1 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] mx-auto mt-6 rounded-full" />
      </div>
    </div>
  )
}
