'use client'
import { useState, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAllTestimonials, api } from '@/lib/api'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Quote, Upload } from 'lucide-react'
import { getInitials } from '@/lib/utils'

type Testimonial = {
  id: number
  name: string
  role?: string
  quote: string
  photo_url?: string
  active: boolean
  display_order: number
}

const BLANK: Partial<Testimonial> = { name: '', role: '', quote: '', photo_url: '', active: true, display_order: 0 }

export default function AdminTestimonials() {
  const qc = useQueryClient()
  const { data: items = [] } = useQuery<Testimonial[]>({ queryKey: ['testimonials-all'], queryFn: fetchAllTestimonials })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<Testimonial>>(BLANK)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleOpenEdit = (item?: Testimonial) => {
    setEditId(item?.id ?? 'new')
    setForm(item ? { ...item } : { ...BLANK })
    setPhotoFile(null)
    setPhotoPreview(item?.photo_url || '')
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required.')
    if (!form.quote) return toast.error('Quote is required.')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name || '')
      fd.append('role', form.role || '')
      fd.append('quote', form.quote || '')
      fd.append('display_order', (form.display_order ?? 0).toString())
      fd.append('active', String(form.active ?? true))
      if (photoFile) fd.append('photo', photoFile)

      if (editId === 'new') {
        await api.post('/api/testimonials', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Testimonial added!')
      } else {
        await api.put(`/api/testimonials/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['testimonials-all'] })
      setEditId(null)
      setPhotoFile(null)
      setPhotoPreview('')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      await api.delete(`/api/testimonials/${id}`)
      qc.invalidateQueries({ queryKey: ['testimonials-all'] })
      toast.success('Deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-[var(--navy)]">Testimonials</h2>
            <p className="text-gray-500 text-sm mt-1">Add quotes from beneficiaries, volunteers, and partners — they appear on the About page.</p>
          </div>
          <button
            onClick={() => handleOpenEdit()}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Testimonial
          </button>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(items as Testimonial[]).map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm group relative ${!item.active ? 'opacity-50' : 'border-gray-100'}`}
            >
              {!item.active && (
                <span className="absolute top-3 left-3 bg-gray-100 text-gray-500 text-[10px] font-black rounded-full px-2 py-0.5">Hidden</span>
              )}
              <Quote size={20} className="text-[var(--gold)] opacity-50 mb-3" />
              <p className="text-gray-600 text-sm italic line-clamp-3 mb-4">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  {item.photo_url ? (
                    <Image src={item.photo_url} alt={item.name} width={40} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center">
                      <span className="text-white font-black text-xs">{getInitials(item.name)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-black text-[var(--navy)] text-sm">{item.name}</p>
                  {item.role && <p className="text-[var(--gold)] text-xs">{item.role}</p>}
                </div>
              </div>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 bg-white shadow-sm">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 bg-white shadow-sm">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Quote size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold">No testimonials yet</p>
            <p className="text-sm mt-1">Add quotes from the people you&apos;ve helped.</p>
          </div>
        )}

        {/* Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                {/* Photo */}
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Photo (optional)</label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:border-[var(--gold)] transition-colors shrink-0"
                      onClick={() => fileRef.current?.click()}
                    >
                      {photoPreview ? (
                        <Image src={photoPreview} alt="Preview" width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <Upload size={18} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-[var(--gold)] font-semibold hover:underline">
                        {photoPreview ? 'Change photo' : 'Upload photo'}
                      </button>
                      {photoPreview && (
                        <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview('') }} className="block text-xs text-red-400 hover:underline mt-0.5">Remove</button>
                      )}
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Jane Mwangi"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Role / Title</label>
                  <input
                    type="text"
                    value={form.role || ''}
                    onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Scholarship Beneficiary, Community Volunteer"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Quote <span className="text-red-400">*</span></label>
                  <textarea
                    rows={4}
                    value={form.quote || ''}
                    onChange={(e) => setForm(f => ({ ...f, quote: e.target.value }))}
                    placeholder="Write the testimonial quote here..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order ?? 0}
                    onChange={(e) => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active ?? true}
                    onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-[var(--navy)]">Visible on About page</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Add Testimonial' : 'Save Changes'}
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
