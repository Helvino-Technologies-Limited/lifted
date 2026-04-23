'use client'
import Image from 'next/image'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings, fetchTeam, fetchPageContent, fetchTestimonials } from '@/lib/api'
import { Heart, Lightbulb, Scale, Shield, Quote, ShieldCheck } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import PageHero from '@/components/ui/PageHero'

const VALUES = [
  { icon: Heart, title: 'Compassion', color: 'bg-rose-100 text-rose-600' },
  { icon: Lightbulb, title: 'Innovation', color: 'bg-amber-100 text-amber-600' },
  { icon: Scale, title: 'Transparency & Accountability', color: 'bg-blue-100 text-blue-600' },
  { icon: Shield, title: 'Integrity', color: 'bg-emerald-100 text-emerald-600' },
]

type Testimonial = { id: number; name: string; role?: string; quote: string; photo_url?: string }

export default function AboutContent() {
  const [expandedBios, setExpandedBios] = useState<Set<number>>(new Set())

  const toggleBio = (id: number) =>
    setExpandedBios((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: team = [] } = useQuery({ queryKey: ['team'], queryFn: fetchTeam })
  const { data: content = {} } = useQuery({ queryKey: ['content', 'about'], queryFn: () => fetchPageContent('about') })
  const { data: testimonials = [] } = useQuery<Testimonial[]>({ queryKey: ['testimonials'], queryFn: fetchTestimonials })

  const s = settings as Record<string, string>
  const c = content as Record<string, Record<string, string>>
  const aboutImgContent = c?.about_images || {}
  const aboutImages = [1, 2, 3, 4].map((i) => aboutImgContent[`image${i}`] || null)

  const additionalInfo = c?.additional_info?.body || ''
  const trustGovernanceTitle = c?.trust_governance?.title || 'Trust & Governance'
  const trustGovernanceBody = c?.trust_governance?.body || ''

  return (
    <>
      <PageHero
        title={c?.mission?.title || 'Who We Are'}
        subtitle="Driven by compassion, guided by integrity — transforming communities one life at a time."
        breadcrumb="About Us"
      />

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">Our Mission</span>
              <h2 className="text-4xl font-black text-[var(--navy)] mt-2 mb-6">
                Building a Legacy of Lifted Lives
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {c?.mission?.body || s.about_story || 'LIFTED TO LIFT was founded on the belief that every individual who has been blessed with opportunities has a responsibility to lift others.'}
              </p>
              <div className="border-l-4 border-[var(--gold)] pl-6 py-2 bg-[var(--gold-pale)] rounded-r-xl">
                <Quote size={20} className="text-[var(--gold)] mb-2" />
                <p className="text-[var(--navy)] font-semibold italic text-lg">
                  &ldquo;{s.vision || 'A legacy of transformed individuals lifting others.'}&rdquo;
                </p>
                <p className="text-[var(--gold)] text-sm font-bold mt-2 uppercase tracking-widest">— Vision Statement</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-xl">
                {aboutImages[0] ? <Image src={aboutImages[0]} alt="Mission image 1" fill className="object-cover" /> : <div className="w-full h-full bg-[var(--gold-pale)]" />}
              </div>
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-xl mt-8">
                {aboutImages[1] ? <Image src={aboutImages[1]} alt="Mission image 2" fill className="object-cover" /> : <div className="w-full h-full bg-[var(--gold-pale)]" />}
              </div>
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
                {aboutImages[2] ? <Image src={aboutImages[2]} alt="Mission image 3" fill className="object-cover" /> : <div className="w-full h-full bg-[var(--gold-pale)]" />}
              </div>
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl -mt-8">
                {aboutImages[3] ? <Image src={aboutImages[3]} alt="Mission image 4" fill className="object-cover" /> : <div className="w-full h-full bg-[var(--gold-pale)]" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info from Admin */}
      {additionalInfo && (
        <section className="py-20 bg-[var(--cream)]">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">More About Us</span>
              <h2 className="text-3xl font-black text-[var(--navy)] mt-2">
                {c?.additional_info?.title || 'About LIFTED TO LIFT'}
              </h2>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{additionalInfo}</p>
            </div>
          </div>
        </section>
      )}

      {/* Vision & Tagline */}
      <section className="py-20 bg-[var(--navy)] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black leading-none select-none">L2L</div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="w-20 h-1 bg-[var(--gold)] mx-auto mb-8 rounded-full" />
          <h2 className="text-5xl md:text-7xl font-black mb-4">
            &ldquo;<span className="text-gradient">Blessed to be<br />a Blessing</span>&rdquo;
          </h2>
          <p className="text-gray-300 text-lg mt-6">
            Our tagline is not just words — it is the heartbeat of everything we do and every life we touch.
          </p>
          <div className="w-20 h-1 bg-[var(--gold)] mx-auto mt-8 rounded-full" />
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-[var(--gold-pale)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">What Guides Us</span>
            <h2 className="text-4xl font-black text-[var(--navy)] mt-2">Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, color }) => (
              <div key={title} className="bg-white p-8 rounded-2xl text-center shadow-sm card-hover border border-gray-100">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5`}>
                  <Icon size={26} />
                </div>
                <h3 className="font-black text-[var(--navy)] text-base">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Governance */}
      {trustGovernanceBody && (
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-blue-600" />
              </div>
              <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">Accountability</span>
              <h2 className="text-4xl font-black text-[var(--navy)] mt-2">{trustGovernanceTitle}</h2>
            </div>
            <div className="bg-[var(--navy)] rounded-2xl p-8 md:p-12 text-white">
              <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-line">{trustGovernanceBody}</p>
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {team.length > 0 && (
        <section className="py-24 bg-[var(--gold-pale)]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">The People</span>
              <h2 className="text-4xl font-black text-[var(--navy)] mt-2">Meet Our Team</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                Dedicated individuals united by a shared passion for community transformation.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member: { id: number; name: string; title?: string; bio?: string; photo_url?: string; email?: string; linkedin_url?: string }) => (
                <div key={member.id} className="text-center card-hover group">
                  <div className="relative w-36 h-36 mx-auto mb-5">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        className="rounded-full object-cover border-4 border-[var(--gold)]/30 group-hover:border-[var(--gold)] transition-all shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] border-4 border-[var(--gold)]/30 flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-2xl">{getInitials(member.name)}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-black text-[var(--navy)] text-lg">{member.name}</h3>
                  {member.title && <p className="text-[var(--gold)] text-sm font-semibold mt-1">{member.title}</p>}
                  {member.bio && (
                    <div className="mt-3 text-left">
                      <p className={`text-gray-500 text-sm leading-relaxed ${expandedBios.has(member.id) ? '' : 'line-clamp-3'}`}>
                        {member.bio}
                      </p>
                      <button
                        onClick={() => toggleBio(member.id)}
                        className="mt-1.5 text-[var(--gold)] text-xs font-semibold hover:underline focus:outline-none"
                      >
                        {expandedBios.has(member.id) ? 'Show less' : 'Read more'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">What People Say</span>
              <h2 className="text-4xl font-black text-[var(--navy)] mt-2">Testimonials</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                Stories from the lives we have been privileged to touch.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-[var(--gold-pale)] rounded-2xl p-6 border border-[var(--gold)]/10 card-hover">
                  <Quote size={24} className="text-[var(--gold)] opacity-60 mb-3" />
                  <p className="text-gray-700 italic leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                      {t.photo_url ? (
                        <Image src={t.photo_url} alt={t.name} width={44} height={44} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center">
                          <span className="text-white font-black text-xs">{getInitials(t.name)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-[var(--navy)] text-sm">{t.name}</p>
                      {t.role && <p className="text-[var(--gold)] text-xs font-semibold">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
