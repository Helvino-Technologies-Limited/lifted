'use client'
import { Heart, Lightbulb, Scale, Shield } from 'lucide-react'

const VALUES = [
  {
    icon: Heart,
    title: 'Compassion',
    description: 'We approach every interaction with empathy and genuine care, seeing the humanity in every individual we serve.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We embrace creative solutions and new approaches to old challenges, constantly evolving to serve our communities better.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: Scale,
    title: 'Transparency & Accountability',
    description: 'We operate with complete openness, holding ourselves accountable to the communities we serve and our partners worldwide.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Shield,
    title: 'Integrity',
    description: 'We uphold the highest ethical standards in all we do, ensuring trust is earned and maintained through consistent, principled action.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
]

export default function ValuesSection() {
  return (
    <section className="py-24 section-navy relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--gold)]/5 -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">Who We Are</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">
            Our Core Values
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            These principles guide every decision we make and every action we take in service of our communities.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((value) => {
            const Icon = value.icon
            return (
              <div
                key={value.title}
                className={`card-hover p-6 rounded-2xl border ${value.border} ${value.bg} text-center group`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon size={26} className={value.color} />
                </div>
                <h3 className="text-[var(--navy)] font-black text-lg mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
