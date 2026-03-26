'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchInstitutions, api } from '@/lib/api'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Upload, Building2 } from 'lucide-react'

type Institution = {
  id: number
  name: string
  description?: string
  photo_url?: string
  category?: string
  location?: string
  display_order?: number
}

const BLANK: Partial<Institution> = { name: '', description: '', category: '', location: '', display_order: 0 }

export default function AdminInstitutions() {
  const qc = useQueryClient()
  const { data: institutions = [] } = useQuery({ queryKey: ['institutions'], queryFn: fetchInstitutions })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<Institution>>(BLANK)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required.')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)) })
      if (photoFile) fd.append('photo', photoFile)
      if (editId === 'new') {
        await api.post('/api/institutions', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Institution added!')
      } else {
        await api.put(`/api/institutions/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['institutions'] })
      setEditId(null)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this institution?')) return
    try {
      await api.delete(`/api/institutions/${id}`)
      qc.invalidateQueries({ queryKey: ['institutions'] })
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
            <h2 className="text-2xl font-black text-[var(--navy)]">Institutions</h2>
            <p className="text-gray-500 text-sm mt-1">These appear as the tree chart under Pillar 4 (Institutional Stewardship & Reinvestment).</p>
          </div>
          <button onClick={() => { setEditId('new'); setForm({ ...BLANK }); setPhotoFile(null) }} className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
            <Plus size={16} /> Add Institution
          </button>
        </div>

        {/* Tree preview hint */}
        <div className="bg-[var(--gold-pale)] border border-[var(--gold)]/30 rounded-xl p-4 text-sm text-[var(--navy)]">
          <strong>Tip:</strong> Each institution you add here will appear as a node in the tree diagram on the Programs page under Pillar 4. Upload a photo for each institution for a richer visual.
        </div>

        {/* Institutions grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {institutions.map((inst: Institution) => (
            <div key={inst.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
              <div className="relative h-32 bg-[var(--navy)]">
                {inst.photo_url ? (
                  <Image src={inst.photo_url} alt={inst.name} fill className="object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={36} className="text-white/30" />
                  </div>
                )}
                {inst.category && (
                  <span className="absolute top-2 left-2 bg-[var(--gold)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{inst.category}</span>
                )}
              </div>
              <div className="p-4 flex justify-between items-start">
                <div>
                  <p className="font-black text-[var(--navy)] text-sm">{inst.name}</p>
                  {inst.location && <p className="text-gray-400 text-xs mt-0.5">{inst.location}</p>}
                  {inst.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{inst.description}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => { setEditId(inst.id); setForm({ ...inst }); setPhotoFile(null) }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(inst.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {institutions.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Building2 size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No institutions yet</p>
            <p className="text-sm mt-1">Add institutions that appear in the tree under Pillar 4.</p>
          </div>
        )}

        {/* Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'Add Institution' : 'Edit Institution'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Photo upload */}
              <div className="mb-5">
                <div className="relative h-28 rounded-xl overflow-hidden bg-[var(--navy)] mb-3">
                  {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : form.photo_url ? (
                    <Image src={form.photo_url} alt="Institution" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={32} className="text-white/30" />
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--gold)] transition-colors text-sm text-gray-500 w-fit">
                  <Upload size={14} />
                  {photoFile ? photoFile.name.slice(0, 20) : 'Upload photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'name', label: 'Institution Name *', type: 'text' },
                  { key: 'category', label: 'Category (e.g. Education, Community)', type: 'text' },
                  { key: 'location', label: 'Location', type: 'text' },
                  { key: 'display_order', label: 'Display Order', type: 'number' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={String(form[key as keyof Institution] || '')}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description || ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Add Institution' : 'Save'}
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
