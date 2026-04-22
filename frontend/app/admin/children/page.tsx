'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchChildren, api } from '@/lib/api'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Upload, Heart } from 'lucide-react'

type Child = {
  id: number
  name: string
  age?: number
  grade?: string
  story?: string
  photo_url?: string
  sponsored: boolean
  active: boolean
  display_order: number
}

const BLANK: Partial<Child> = { name: '', age: undefined, grade: '', story: '', sponsored: false, active: true, display_order: 0 }

export default function AdminChildren() {
  const qc = useQueryClient()
  const { data: children = [] } = useQuery({ queryKey: ['children'], queryFn: () => fetchChildren() })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<Child>>(BLANK)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleOpenEdit = (child?: Child) => {
    setEditId(child?.id ?? 'new')
    setForm(child ? { ...child } : { ...BLANK })
    setPhotoFile(null)
  }

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required.')
    setSaving(true)
    try {
      const fd = new FormData()
      if (form.name) fd.append('name', form.name)
      if (form.age !== undefined && form.age !== null) fd.append('age', String(form.age))
      if (form.grade) fd.append('grade', form.grade)
      if (form.story) fd.append('story', form.story)
      fd.append('sponsored', String(form.sponsored ?? false))
      fd.append('active', String(form.active ?? true))
      fd.append('display_order', String(form.display_order ?? 0))
      if (photoFile) fd.append('photo', photoFile)

      if (editId === 'new') {
        await api.post('/api/children', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Child profile added!')
      } else {
        await api.put(`/api/children/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['children'] })
      setEditId(null)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this child profile?')) return
    try {
      await api.delete(`/api/children/${id}`)
      qc.invalidateQueries({ queryKey: ['children'] })
      toast.success('Deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const handleToggleSponsored = async (child: Child) => {
    try {
      const fd = new FormData()
      fd.append('sponsored', String(!child.sponsored))
      await api.put(`/api/children/${child.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      qc.invalidateQueries({ queryKey: ['children'] })
      toast.success(child.sponsored ? 'Marked as needing sponsorship.' : 'Marked as sponsored!')
    } catch {
      toast.error('Failed to update.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-[var(--navy)]">Children Sponsorship</h2>
            <p className="text-gray-500 text-sm mt-1">Manage children profiles displayed on the sponsorship page.</p>
          </div>
          <button
            onClick={() => handleOpenEdit()}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Child
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Profiles', value: children.length },
            { label: 'Need Sponsorship', value: (children as Child[]).filter(c => !c.sponsored && c.active).length },
            { label: 'Sponsored', value: (children as Child[]).filter(c => c.sponsored).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-black text-[var(--navy)]">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Children Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(children as Child[]).map((child) => (
            <div key={child.id} className={`bg-white rounded-2xl p-5 border shadow-sm flex gap-4 items-start group relative ${!child.active ? 'opacity-60' : ''} ${child.sponsored ? 'border-green-200' : 'border-gray-100'}`}>
              {child.sponsored && (
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-[10px] font-black rounded-full px-2 py-0.5">Sponsored</span>
              )}
              <div className="relative w-14 h-14 shrink-0">
                {child.photo_url ? (
                  <Image src={child.photo_url} alt={child.name} fill className="rounded-full object-cover border-2 border-[var(--gold)]/30" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center">
                    <Heart size={18} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[var(--navy)] text-sm truncate">{child.name}</p>
                {(child.age || child.grade) && (
                  <p className="text-[var(--gold)] text-xs font-semibold">
                    {child.age ? `Age ${child.age}` : ''}{child.age && child.grade ? ' · ' : ''}{child.grade || ''}
                  </p>
                )}
                {child.story && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{child.story}</p>}
                <button
                  onClick={() => handleToggleSponsored(child)}
                  className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${child.sponsored ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-amber-100 text-amber-700 hover:bg-green-100 hover:text-green-700'}`}
                >
                  {child.sponsored ? 'Mark Unsponsored' : 'Mark Sponsored'}
                </button>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(child)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(child.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {children.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="text-lg font-semibold">No children profiles yet</p>
            <p className="text-sm mt-1">Add profiles using the button above.</p>
          </div>
        )}

        {/* Edit/Add Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'Add Child Profile' : 'Edit Child Profile'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Photo upload */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-16 h-16">
                  {(photoFile ? URL.createObjectURL(photoFile) : form.photo_url) ? (
                    <img
                      src={photoFile ? URL.createObjectURL(photoFile) : form.photo_url}
                      alt="Preview"
                      className="w-full h-full rounded-full object-cover border-2 border-[var(--gold)]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--navy)] flex items-center justify-center">
                      <Heart size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--gold)] transition-colors text-sm text-gray-500">
                  <Upload size={14} />
                  {photoFile ? photoFile.name.slice(0, 20) : 'Upload photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Age</label>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={form.age ?? ''}
                      onChange={(e) => setForm(f => ({ ...f, age: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Grade / Class</label>
                    <input
                      type="text"
                      value={form.grade || ''}
                      onChange={(e) => setForm(f => ({ ...f, grade: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Story / Description</label>
                  <textarea
                    rows={4}
                    value={form.story || ''}
                    onChange={(e) => setForm(f => ({ ...f, story: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                    placeholder="Share the child's background and why they need sponsorship..."
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
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.sponsored ?? false}
                      onChange={(e) => setForm(f => ({ ...f, sponsored: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-[var(--navy)]">Already Sponsored</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active ?? true}
                      onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-[var(--navy)]">Active (show on website)</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Add Child' : 'Save Changes'}
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
