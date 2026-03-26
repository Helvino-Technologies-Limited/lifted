'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTeam, api } from '@/lib/api'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Upload } from 'lucide-react'
import { getInitials } from '@/lib/utils'

type TeamMember = {
  id: number
  name: string
  title?: string
  bio?: string
  photo_url?: string
  email?: string
  linkedin_url?: string
  display_order?: number
  active?: boolean
}

const BLANK: Partial<TeamMember> = { name: '', title: '', bio: '', email: '', linkedin_url: '', display_order: 0 }

export default function AdminTeam() {
  const qc = useQueryClient()
  const { data: team = [] } = useQuery({ queryKey: ['team'], queryFn: fetchTeam })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<TeamMember>>(BLANK)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleOpenEdit = (member?: TeamMember) => {
    setEditId(member?.id ?? 'new')
    setForm(member ? { ...member } : { ...BLANK })
    setPhotoFile(null)
  }

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required.')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)) })
      if (photoFile) fd.append('photo', photoFile)

      if (editId === 'new') {
        await api.post('/api/team', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Team member added!')
      } else {
        await api.put(`/api/team/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['team'] })
      setEditId(null)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this team member?')) return
    try {
      await api.delete(`/api/team/${id}`)
      qc.invalidateQueries({ queryKey: ['team'] })
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
            <h2 className="text-2xl font-black text-[var(--navy)]">Team Members</h2>
            <p className="text-gray-500 text-sm mt-1">Manage the team displayed on the About page.</p>
          </div>
          <button
            onClick={() => handleOpenEdit()}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Member
          </button>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member: TeamMember) => (
            <div key={member.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4 items-start group">
              <div className="relative w-14 h-14 shrink-0">
                {member.photo_url ? (
                  <Image src={member.photo_url} alt={member.name} fill className="rounded-full object-cover border-2 border-[var(--gold)]/30" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center">
                    <span className="text-white font-black text-sm">{getInitials(member.name)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[var(--navy)] text-sm truncate">{member.name}</p>
                <p className="text-[var(--gold)] text-xs font-semibold">{member.title}</p>
                {member.bio && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{member.bio}</p>}
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(member)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(member.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {team.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="text-lg font-semibold">No team members yet</p>
            <p className="text-sm mt-1">Add your first team member using the button above.</p>
          </div>
        )}

        {/* Edit/Add Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'Add Team Member' : 'Edit Team Member'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Photo upload */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-16 h-16">
                  {(photoFile ? URL.createObjectURL(photoFile) : form.photo_url) ? (
                    <img
                      src={photoFile ? URL.createObjectURL(photoFile) : form.photo_url}
                      alt="Photo preview"
                      className="w-full h-full rounded-full object-cover border-2 border-[var(--gold)]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--navy)] flex items-center justify-center">
                      <span className="text-white font-black">{form.name ? getInitials(form.name) : '?'}</span>
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
                {[
                  { key: 'name', label: 'Name *', type: 'text' },
                  { key: 'title', label: 'Job Title', type: 'text' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
                  { key: 'display_order', label: 'Display Order (0 = first)', type: 'number' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={String(form[key as keyof TeamMember] || '')}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio || ''}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
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
                    {editId === 'new' ? 'Add Member' : 'Save Changes'}
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
