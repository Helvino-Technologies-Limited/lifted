'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchEvents, api } from '@/lib/api'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Upload, Calendar, MapPin } from 'lucide-react'

type Event = {
  id: number
  title: string
  description?: string
  event_date: string
  location?: string
  image_url?: string
  published: boolean
}

const toDatetimeLocal = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const BLANK: Partial<Event> = { title: '', description: '', event_date: '', location: '', published: true }

export default function AdminEvents() {
  const qc = useQueryClient()
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => fetchEvents() })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<Event>>(BLANK)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleOpenEdit = (event?: Event) => {
    setEditId(event?.id ?? 'new')
    setForm(event ? { ...event } : { ...BLANK })
    setImageFile(null)
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required.')
    if (!form.event_date) return toast.error('Event date is required.')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      if (form.description) fd.append('description', form.description)
      fd.append('event_date', form.event_date)
      if (form.location) fd.append('location', form.location)
      fd.append('published', String(form.published ?? true))
      if (imageFile) fd.append('image', imageFile)

      if (editId === 'new') {
        await api.post('/api/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Event added!')
      } else {
        await api.put(`/api/events/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['events'] })
      setEditId(null)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return
    try {
      await api.delete(`/api/events/${id}`)
      qc.invalidateQueries({ queryKey: ['events'] })
      toast.success('Deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const formatDate = (iso: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const isPast = (iso: string) => new Date(iso) < new Date()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-[var(--navy)]">Upcoming Events</h2>
            <p className="text-gray-500 text-sm mt-1">Manage events displayed on the website.</p>
          </div>
          <button
            onClick={() => handleOpenEdit()}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {(events as Event[]).map((event) => (
            <div key={event.id} className={`bg-white rounded-2xl p-5 border shadow-sm flex gap-4 items-start group ${isPast(event.event_date) ? 'opacity-60' : ''} ${event.published ? 'border-gray-100' : 'border-dashed border-gray-300'}`}>
              {event.image_url && (
                <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden">
                  <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                </div>
              )}
              {!event.image_url && (
                <div className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center">
                  <Calendar size={24} className="text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-[var(--navy)] text-sm">{event.title}</p>
                  {!event.published && <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-bold">Draft</span>}
                  {isPast(event.event_date) && <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-bold">Past</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-[var(--gold)] font-semibold flex items-center gap-1">
                    <Calendar size={11} /> {formatDate(event.event_date)}
                  </span>
                  {event.location && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={11} /> {event.location}
                    </span>
                  )}
                </div>
                {event.description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{event.description}</p>}
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(event)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(event.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="text-lg font-semibold">No events yet</p>
            <p className="text-sm mt-1">Add your first event using the button above.</p>
          </div>
        )}

        {/* Edit/Add Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'Add Event' : 'Edit Event'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Image upload */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                  {(imageFile ? URL.createObjectURL(imageFile) : form.image_url) ? (
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--navy)] flex items-center justify-center">
                      <Calendar size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--gold)] transition-colors text-sm text-gray-500">
                  <Upload size={14} />
                  {imageFile ? imageFile.name.slice(0, 20) : 'Upload image'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Event Title *</label>
                  <input
                    type="text"
                    value={form.title || ''}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.event_date ? toDatetimeLocal(form.event_date) : ''}
                    onChange={(e) => setForm(f => ({ ...f, event_date: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Location</label>
                  <input
                    type="text"
                    value={form.location || ''}
                    onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Nairobi, Kenya"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    value={form.description || ''}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published ?? true}
                    onChange={(e) => setForm(f => ({ ...f, published: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-[var(--navy)]">Published (visible on website)</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Add Event' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditId(null)} className="border-2 border-gray-200 px-4 rounded-xl font-bold text-sm text-gray-600">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
