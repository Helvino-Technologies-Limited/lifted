'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchPageContent } from '@/lib/api'
import { GraduationCap, Zap, Heart, Building2, Handshake, ArrowRight } from 'lucide-react'

const PILLARS = [
  {
    key: 'pillar1',
    icon: GraduationCap,
    gradient: 'from-[#87ceeb] to-[#b0e0f5]',
    accentColor: '#c8932a',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    defaultTitle: 'Educational Equity & Scholarships',
    defaultBody: 'Partnering with public primary and junior schools to provide mentorship, essential academic resources, and comprehensive scholarships to ensure equal learning opportunities for all students.',
    number: '01',
  },
  {
    key: 'pillar2',
    icon: Zap,
    gradient: 'from-[#c8932a] to-[#e8b84b]',
    accentColor: '#87ceeb',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    defaultTitle: 'Youth Empowerment',
    defaultBody: 'Equipping unemployed youth who faced educational barriers with practical, technical skills to foster self-reliance and employability.',
    number: '02',
  },
  {
    key: 'pillar3',
    icon: Heart,
    gradient: 'from-[#2d7a4e] to-[#3d9a60]',
    accentColor: '#ffffff',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80',
    defaultTitle: "Senior Citizens' Welfare & Support",
    defaultBody: 'Upholding the dignity of the elderly by providing critical assistance with healthcare, nutrition, and clothing.',
    number: '03',
  },
  {
    key: 'pillar4',
    icon: Building2,
    gradient: 'from-[#6b3fa0] to-[#8a5cbf]',
    accentColor: '#ffffff',
    image: 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=600&q=80',
    defaultTitle: 'Institutional Stewardship & Reinvestment',
    defaultBody: 'Giving back to the institutions that shaped our foundation, ensuring their continued growth and preserving their legacy for future generations.',
    number: '04',
  },
  {
    key: 'pillar5',
    icon: Handshake,
    gradient: 'from-[#e0621e] to-[#f08030]',
    accentColor: '#ffffff',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
    defaultTitle: 'Partnerships & Networking',
    defaultBody: 'Collaborating with local and international partners in order to maximize our impact across all communities.',
    number: '05',
  },
]

export default function PillarsOverview() {
  const { data: content = {} } = useQuery({
    queryKey: ['content', 'programs'],
    queryFn: () => fetchPageContent('programs'),
  })

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--navy)] mt-2 mb-4">
            {content?.header?.title || 'Our Five Strategic Pillars'}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            {content?.header?.subtitle || 'Five comprehensive pillars of action that guide our mission to lift communities and transform lives.'}
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            const title = content?.[pillar.key]?.title || pillar.defaultTitle
            const body = content?.[pillar.key]?.body || pillar.defaultBody

            return (
              <div
                key={pillar.key}
                className={`card-hover group rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col ${idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={pillar.image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${pillar.gradient} opacity-60`} />
                  {/* Number badge */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                    <span className="text-white font-black text-sm">{pillar.number}</span>
                  </div>
                  {/* Icon */}
                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} shadow-lg flex items-center justify-center border-2 border-white/30`}>
                    <Icon size={22} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 bg-white">
                  <h3 className="text-lg font-black text-[var(--navy)] mb-3 leading-tight">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">{body}</p>
                  <Link
                    href={`/programs#${pillar.key}`}
                    className="mt-5 inline-flex items-center gap-2 text-[var(--gold)] font-semibold text-sm hover:gap-3 transition-all group/link"
                  >
                    Learn More
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/programs" className="btn-primary px-8 py-4 rounded-full inline-flex items-center gap-2 font-bold">
            View All Programs <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
