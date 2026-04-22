'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchNeeds } from '@/lib/api'
import { AlertTriangle, Package, Mail } from 'lucide-react'
import PageHero from '@/components/ui/PageHero'

type Need = {
  id: number
  title: string
  description?: string
  category?: string
  quantity_needed?: number
  quantity_fulfilled: number
  urgent: boolean
  active: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Clothing: 'bg-purple-100 text-purple-700',
  'School Supplies': 'bg-blue-100 text-blue-700',
  Medical: 'bg-red-100 text-red-700',
  Financial: 'bg-green-100 text-green-700',
  Furniture: 'bg-yellow-100 text-yellow-700',
  Electronics: 'bg-indigo-100 text-indigo-700',
  Other: 'bg-gray-100 text-gray-600',
}

export default function NeedsContent() {
  const { data: needs = [] } = useQuery({
    queryKey: ['needs', 'active'],
    queryFn: () => fetchNeeds({ active: 'true' }),
  })

  const urgent = (needs as Need[]).filter(n => n.urgent)
  const regular = (needs as Need[]).filter(n => !n.urgent)

  const fulfillmentPct = (need: Need) => {
    if (!need.quantity_needed) return null
    return Math.min(100, Math.round((need.quantity_fulfilled / need.quantity_needed) * 100))
  }

  const NeedCard = ({ need }: { need: Need }) => {
    const pct = fulfillmentPct(need)
    const colorClass = CATEGORY_COLORS[need.category || ''] || CATEGORY_COLORS.Other
    return (
      <div className={`bg-white rounded-2xl border shadow-sm p-5 ${need.urgent ? 'border-red-200' : 'border-gray-100'}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${need.urgent ? 'bg-red-100' : 'bg-[var(--navy)]/10'}`}>
              {need.urgent ? <AlertTriangle size={18} className="text-red-500" /> : <Package size={18} className="text-[var(--navy)]" />}
            </div>
            <div>
              <h3 className="font-black text-[var(--navy)] text-sm leading-tight">{need.title}</h3>
              {need.category && (
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${colorClass}`}>
                  {need.category}
                </span>
              )}
            </div>
          </div>
          {need.urgent && (
            <span className="shrink-0 bg-red-100 text-red-700 text-[10px] font-black rounded-full px-2 py-0.5 whitespace-nowrap">Urgent</span>
          )}
        </div>
        {need.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{need.description}</p>
        )}
        {pct !== null && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{need.quantity_fulfilled} of {need.quantity_needed} {need.category === 'Financial' ? 'units' : 'items'}</span>
              <span className="font-bold text-[var(--navy)]">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-400' : need.urgent ? 'bg-red-400' : 'bg-[var(--gold)]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <PageHero
        title="Our Current Needs"
        subtitle="See what our organisation needs right now and how you can make a direct impact."
        breadcrumb="Our Needs"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">

          {needs.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <Package size={40} className="text-[var(--gold)] mx-auto mb-3" />
              <p className="text-[var(--navy)] font-black text-xl">No needs listed at the moment</p>
              <p className="text-gray-500 mt-2 text-sm">Thank you to all our supporters! Check back soon.</p>
            </div>
          ) : (
            <>
              {/* Urgent */}
              {urgent.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle size={18} className="text-red-500" />
                    <h2 className="text-xl font-black text-[var(--navy)]">Urgent Needs</h2>
                    <span className="bg-red-100 text-red-700 text-xs font-black rounded-full px-2 py-0.5">{urgent.length}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {urgent.map(need => <NeedCard key={need.id} need={need} />)}
                  </div>
                </div>
              )}

              {/* Regular */}
              {regular.length > 0 && (
                <div className={urgent.length > 0 ? 'border-t border-gray-100 pt-10' : ''}>
                  {urgent.length > 0 && (
                    <h2 className="text-xl font-black text-[var(--navy)] mb-6">Other Needs</h2>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regular.map(need => <NeedCard key={need.id} need={need} />)}
                  </div>
                </div>
              )}
            </>
          )}

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] rounded-3xl p-10 text-center text-white">
            <h3 className="text-2xl font-black mb-3">Can You Help?</h3>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Whether you can donate items, funds, or your time — every contribution matters. Contact us to coordinate a donation.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 btn-primary px-8 py-3 rounded-xl font-bold">
              <Mail size={16} /> Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
