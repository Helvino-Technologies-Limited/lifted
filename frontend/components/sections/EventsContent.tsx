'use client'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchEvents } from '@/lib/api'
import { Calendar, MapPin, Clock } from 'lucide-react'
import PageHero from '@/components/ui/PageHero'

type Event = {
  id: number
  title: string
  description?: string
  event_date: string
  location?: string
  image_url?: string
  published: boolean
}

const formatEventDate = (iso: string) => {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString('en-KE', { day: 'numeric' }),
    month: d.toLocaleDateString('en-KE', { month: 'short' }),
    year: d.toLocaleDateString('en-KE', { year: 'numeric' }),
    time: d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
    full: d.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

export default function EventsContent() {
  const { data: events = [] } = useQuery({
    queryKey: ['events', 'published'],
    queryFn: () => fetchEvents({ published: 'true' }),
  })

  const now = new Date()
  const upcoming = (events as Event[]).filter(e => new Date(e.event_date) >= now)
  const past = (events as Event[]).filter(e => new Date(e.event_date) < now)

  return (
    <>
      <PageHero
        title="Upcoming Events"
        subtitle="Join us at our upcoming events and be part of the movement lifting lives across Kenya."
        breadcrumb="Events"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Upcoming */}
          {upcoming.length > 0 ? (
            <>
              <div className="mb-10">
                <h2 className="text-2xl font-black text-[var(--navy)] mb-1">Upcoming Events</h2>
                <p className="text-gray-500 text-sm">Don&apos;t miss out — mark your calendar.</p>
              </div>
              <div className="space-y-6 mb-16">
                {upcoming.map((event) => {
                  const dt = formatEventDate(event.event_date)
                  return (
                    <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-lg transition-shadow">
                      {/* Date block */}
                      <div className="sm:w-24 shrink-0 bg-[var(--navy)] text-white flex flex-row sm:flex-col items-center justify-center p-4 sm:p-0 gap-3 sm:gap-0">
                        <div className="text-center">
                          <div className="text-3xl font-black leading-none">{dt.day}</div>
                          <div className="text-[var(--gold)] text-xs font-black uppercase tracking-wider mt-1">{dt.month}</div>
                          <div className="text-white/60 text-xs">{dt.year}</div>
                        </div>
                      </div>
                      {/* Image */}
                      {event.image_url && (
                        <div className="relative sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden">
                          <Image src={event.image_url} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      {/* Content */}
                      <div className="p-6 flex-1">
                        <h3 className="font-black text-[var(--navy)] text-lg mb-2">{event.title}</h3>
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock size={12} className="text-[var(--gold)]" /> {dt.time}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin size={12} className="text-[var(--gold)]" /> {event.location}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{event.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl mb-16">
              <Calendar size={40} className="text-[var(--gold)] mx-auto mb-3" />
              <p className="text-[var(--navy)] font-black text-xl">No upcoming events at the moment</p>
              <p className="text-gray-500 mt-2 text-sm">Check back soon — events will be listed here as they are announced.</p>
            </div>
          )}

          {/* Past events */}
          {past.length > 0 && (
            <div className="border-t border-gray-100 pt-12">
              <h3 className="text-xl font-black text-[var(--navy)] mb-6">Past Events</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {past.map((event) => {
                  const dt = formatEventDate(event.event_date)
                  return (
                    <div key={event.id} className="bg-gray-50 rounded-xl p-4 flex gap-4 items-center opacity-70">
                      <div className="w-12 h-12 rounded-xl bg-gray-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-black text-gray-600">{dt.day}</span>
                        <span className="text-[10px] text-gray-400 uppercase">{dt.month}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--navy)] text-sm truncate">{event.title}</p>
                        {event.location && (
                          <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
