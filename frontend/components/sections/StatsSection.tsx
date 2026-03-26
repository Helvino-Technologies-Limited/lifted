'use client'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings } from '@/lib/api'
import { Users, School, Briefcase, Heart } from 'lucide-react'

function useCountUp(target: number, duration = 2000, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setCount(Math.floor(start))
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, active])
  return count
}

function StatCard({ icon: Icon, value, suffix, label, color }: {
  icon: React.ComponentType<{ size: number; className?: string }>
  value: number
  suffix: string
  label: string
  color: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const count = useCountUp(value, 2000, active)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); obs.disconnect() }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center group">
      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon size={28} className="text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-black text-[var(--navy)] stat-number mb-1">
        {active ? count.toLocaleString() : 0}{suffix}
      </div>
      <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">{label}</div>
    </div>
  )
}

export default function StatsSection() {
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  const parseNum = (val: string) => parseInt((val || '0').replace(/\D/g, '')) || 0
  const getSuffix = (val: string) => (val || '').replace(/[0-9,]/g, '').trim()

  const stats = [
    {
      icon: Users,
      value: parseNum(settings.stats_beneficiaries || '500'),
      suffix: getSuffix(settings.stats_beneficiaries || '500+'),
      label: 'Lives Transformed',
      color: 'bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)]',
    },
    {
      icon: School,
      value: parseNum(settings.stats_schools || '12'),
      suffix: getSuffix(settings.stats_schools || '12'),
      label: 'Schools Partnered',
      color: 'bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)]',
    },
    {
      icon: Briefcase,
      value: parseNum(settings.stats_youth_trained || '200'),
      suffix: getSuffix(settings.stats_youth_trained || '200+'),
      label: 'Youth Empowered',
      color: 'bg-gradient-to-br from-[var(--green)] to-emerald-400',
    },
    {
      icon: Heart,
      value: parseNum(settings.stats_seniors_supported || '150'),
      suffix: getSuffix(settings.stats_seniors_supported || '150+'),
      label: 'Seniors Supported',
      color: 'bg-gradient-to-br from-[var(--orange)] to-amber-400',
    },
  ]

  return (
    <section className="py-20 bg-[var(--cream)] relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-[var(--gold)] font-bold text-sm uppercase tracking-widest">Our Impact</span>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--navy)] mt-2">
            Numbers That Tell a Story
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Every number represents a life touched, a future brightened, and a community strengthened.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
