'use client'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchPageContent, fetchInstitutions } from '@/lib/api'
import { GraduationCap, Zap, Heart, Building2, Handshake } from 'lucide-react'
import PageHero from '@/components/ui/PageHero'

const PILLAR_DATA = [
  {
    key: 'pillar1',
    id: 'pillar1',
    icon: GraduationCap,
    number: '01',
    gradient: 'from-[var(--navy)] to-[var(--navy-light)]',
    accentBg: 'bg-[var(--navy)]',
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=80',
      'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=700&q=80',
    ],
    defaultTitle: 'Educational Equity & Scholarships',
    defaultBody: 'Partnering with public primary and junior schools to provide mentorship, essential academic resources, and comprehensive scholarships to ensure equal learning opportunities for all students.',
  },
  {
    key: 'pillar2',
    id: 'pillar2',
    icon: Zap,
    number: '02',
    gradient: 'from-[var(--gold)] to-[var(--gold-light)]',
    accentBg: 'bg-[var(--gold)]',
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80',
    ],
    defaultTitle: 'Youth Empowerment',
    defaultBody: 'Equipping unemployed youth who faced educational barriers with practical, technical skills to foster self-reliance and employability.',
  },
  {
    key: 'pillar3',
    id: 'pillar3',
    icon: Heart,
    number: '03',
    gradient: 'from-[var(--green)] to-emerald-400',
    accentBg: 'bg-[var(--green)]',
    images: [
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=700&q=80',
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=700&q=80',
    ],
    defaultTitle: "Senior Citizens' Welfare & Support",
    defaultBody: 'Upholding the dignity of the elderly by providing critical assistance with healthcare, nutrition, and clothing.',
  },
  {
    key: 'pillar4',
    id: 'pillar4',
    icon: Building2,
    number: '04',
    gradient: 'from-[#6b3fa0] to-[#8a5cbf]',
    accentBg: 'bg-[#6b3fa0]',
    images: [
      'https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=700&q=80',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&q=80',
    ],
    defaultTitle: 'Institutional Stewardship & Reinvestment',
    defaultBody: 'Giving back to the institutions that shaped our foundation, ensuring their continued growth and preserving their legacy for future generations.',
    hasTree: true,
  },
  {
    key: 'pillar5',
    id: 'pillar5',
    icon: Handshake,
    number: '05',
    gradient: 'from-[var(--orange)] to-amber-400',
    accentBg: 'bg-[var(--orange)]',
    images: [
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=80',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=700&q=80',
    ],
    defaultTitle: 'Partnerships & Networking',
    defaultBody: 'Collaborating with local and international partners in order to maximize our impact.',
  },
]

function InstitutionTree({ institutions }: { institutions: Array<{ id: number; name: string; description?: string; photo_url?: string; category?: string; location?: string }> }) {
  const PLACEHOLDER_INSTITUTIONS = [
    {
      id: 0,
      name: 'School / Institution Name',
      description: 'Add institution via admin panel',
      photo_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80',
      category: 'Education',
    },
    {
      id: 1,
      name: 'School / Institution Name',
      description: 'Add institution via admin panel',
      photo_url: 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=400&q=80',
      category: 'Community',
    },
    {
      id: 2,
      name: 'School / Institution Name',
      description: 'Add institution via admin panel',
      photo_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
      category: 'Education',
    },
  ]

  const items = institutions.length > 0 ? institutions : PLACEHOLDER_INSTITUTIONS

  return (
    <div className="mt-16">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-black text-[var(--navy)] mb-2">Institutions We Support</h3>
        <p className="text-gray-500 text-sm">The foundations that shaped us — we give back to grow them further.</p>
      </div>

      {/* Tree structure */}
      <div className="relative">
        {/* Root node */}
        <div className="flex justify-center mb-2">
          <div className="bg-gradient-to-br from-[#6b3fa0] to-[#8a5cbf] text-white px-8 py-3 rounded-full font-black text-sm shadow-lg">
            LIFTED TO LIFT
          </div>
        </div>

        {/* Connector line down */}
        <div className="flex justify-center mb-2">
          <div className="w-0.5 h-10 bg-[var(--gold)]" />
        </div>

        {/* Horizontal line */}
        <div className="flex justify-center mb-2">
          <div
            className="h-0.5 bg-[var(--gold)]"
            style={{ width: `${Math.min(items.length, 4) * 200}px`, maxWidth: '90%' }}
          />
        </div>

        {/* Institution nodes */}
        <div className="flex justify-center gap-4 flex-wrap">
          {items.map((inst) => (
            <div key={inst.id} className="flex flex-col items-center" style={{ width: '180px' }}>
              {/* Connector up */}
              <div className="w-0.5 h-8 bg-[var(--gold)] mb-4" />
              {/* Card */}
              <div className="w-full rounded-2xl overflow-hidden shadow-md border border-gray-100 card-hover bg-white text-center">
                <div className="relative h-28 overflow-hidden">
                  {inst.photo_url ? (
                    <Image
                      src={inst.photo_url}
                      alt={inst.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#6b3fa0] to-[#8a5cbf] flex items-center justify-center">
                      <Building2 size={36} className="text-white opacity-60" />
                    </div>
                  )}
                  {inst.category && (
                    <div className="absolute top-2 left-2 bg-[var(--gold)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {inst.category}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-black text-[var(--navy)] text-xs leading-tight">{inst.name}</h4>
                  {inst.description && (
                    <p className="text-gray-400 text-[10px] mt-1 line-clamp-2">{inst.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProgramsContent() {
  const { data: content = {} } = useQuery({
    queryKey: ['content', 'programs'],
    queryFn: () => fetchPageContent('programs'),
  })
  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: fetchInstitutions,
  })

  return (
    <>
      <PageHero
        title={content?.header?.title || 'Our Five Strategic Pillars'}
        subtitle={content?.header?.subtitle || 'Five comprehensive pillars of action guiding our mission to lift communities and transform lives.'}
        breadcrumb="Our Pillars"
      />

      <div className="py-6 bg-[var(--gold-pale)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-3">
          {PILLAR_DATA.map((p) => (
            <a
              key={p.key}
              href={`#${p.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white hover:border-[var(--navy)] transition-all shadow-sm"
            >
              <span className="text-[var(--gold)] font-black text-xs">{p.number}</span>
              <p.icon size={14} />
              {p.defaultTitle.split(':')[0]}
            </a>
          ))}
        </div>
      </div>

      {PILLAR_DATA.map((pillar, idx) => {
        const Icon = pillar.icon
        const title = content?.[pillar.key]?.title || pillar.defaultTitle
        const body = content?.[pillar.key]?.body || pillar.defaultBody
        const isEven = idx % 2 === 0

        return (
          <section
            key={pillar.key}
            id={pillar.id}
            className={`py-24 scroll-mt-20 ${isEven ? 'bg-white' : 'bg-[var(--cream)]'}`}
          >
            <div className="max-w-7xl mx-auto px-4">
              <div className={`grid lg:grid-cols-2 gap-16 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                {/* Images */}
                <div className={`relative ${!isEven ? 'lg:order-2' : ''}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative h-72 rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={pillar.images[0]}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="relative h-72 rounded-2xl overflow-hidden shadow-xl mt-10">
                      <Image
                        src={pillar.images[1]}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                  {/* Pillar number badge */}
                  <div className={`absolute -top-4 -left-4 w-20 h-20 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shadow-xl`}>
                    <span className="text-white font-black text-2xl">{pillar.number}</span>
                  </div>
                </div>

                {/* Text */}
                <div className={!isEven ? 'lg:order-1' : ''}>
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${pillar.gradient} mb-6`}>
                    <Icon size={18} className="text-white" />
                    <span className="text-white font-bold text-sm uppercase tracking-wider">Pillar {pillar.number}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[var(--navy)] mb-6 leading-tight">{title}</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{body}</p>
                </div>
              </div>

              {/* Institution Tree for Pillar 4 */}
              {pillar.hasTree && <InstitutionTree institutions={institutions} />}
            </div>
          </section>
        )
      })}
    </>
  )
}
