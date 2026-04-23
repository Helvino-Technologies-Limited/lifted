'use client'
import { useState, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPartners, api } from '@/lib/api'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Handshake, Upload } from 'lucide-react'

type Partner = {
  id: number
  name: string
  logo_url?: string
  website_url?: string
  type?: string
  display_order: number
  active: boolean
}

const BLANK: Partial<Partner> = { name: '', logo_url: '', website_url: '', type: 'partner', display_order: 0, active: true }

export default function AdminPartners() {
  const qc = useQueryClient()
  const { data: partners = [] } = useQuery<Partner[]>({ queryKey: ['partners'], queryFn: fetchPartners })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<Partner>>(BLANK)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleOpenEdit = (partner?: Partner) => {
    setEditId(partner?.id ?? 'new')
    setForm(partner ? { ...partner } : { ...BLANK })
    setLogoFile(null)
    setLogoPreview(partner?.logo_url || '')
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name) return toast.error('Partner name is required.')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name || '')
      fd.append('website_url', form.website_url || '')
      fd.append('type', form.type || 'partner')
      fd.append('display_order', (form.display_order ?? 0).toString())
      fd.append('active', String(form.active ?? true))
      if (logoFile) fd.append('logo', logoFile)

      if (editId === 'new') {
        await api.post('/api/partners', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Partner added!')
      } else {
        await api.put(`/api/partners/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['partners'] })
      setEditId(null)
      setLogoFile(null)
      setLogoPreview('')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this partner?')) return
    try {
      await api.delete(`/api/partners/${id}`)
      qc.invalidateQueries({ queryKey: ['partners'] })
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
            <h2 className="text-2xl font-black text-[var(--navy)]">Partners</h2>
            <p className="text-gray-500 text-sm mt-1">Partners appear in the footer of every page on the website.</p>
          </div>
          <button
            onClick={() => handleOpenEdit()}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Partner
          </button>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(partners as Partner[]).map((partner) => (
            <div
              key={partner.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm group relative flex items-center gap-4 ${!partner.active ? 'opacity-50' : 'border-gray-100'}`}
            >
              {!partner.active && (
                <span className="absolute top-3 left-3 bg-gray-100 text-gray-500 text-[10px] font-black rounded-full px-2 py-0.5">Hidden</span>
              )}
              <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {partner.logo_url ? (
                  <Image src={partner.logo_url} alt={partner.name} width={56} height={56} className="object-contain" />
                ) : (
                  <Handshake size={20} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[var(--navy)] text-sm truncate">{partner.name}</p>
                {partner.type && <p className="text-[var(--gold)] text-xs font-semibold capitalize">{partner.type}</p>}
                {partner.website_url && (
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-xs hover:text-[var(--gold)] truncate block">
                    {partner.website_url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(partner)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 bg-white shadow-sm">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(partner.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 bg-white shadow-sm">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {partners.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Handshake size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold">No partners added yet</p>
            <p className="text-sm mt-1">Add partners — they will appear in the website footer.</p>
          </div>
        )}

        {/* Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'Add Partner' : 'Edit Partner'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                {/* Logo */}
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Logo</label>
                  {logoPreview ? (
                    <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                      <Image src={logoPreview} alt="Logo preview" fill className="object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload size={16} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[var(--gold)] transition-colors"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload size={20} className="mx-auto text-gray-300 mb-1" />
                      <p className="text-xs text-gray-400">Click to upload logo</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. UNICEF Kenya"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Website URL</label>
                  <input
                    type="url"
                    value={form.website_url || ''}
                    onChange={(e) => setForm(f => ({ ...f, website_url: e.target.value }))}
                    placeholder="https://example.org"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Type</label>
                  <select
                    value={form.type || 'partner'}
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] bg-white"
                  >
                    <option value="partner">Partner</option>
                    <option value="donor">Donor</option>
                    <option value="sponsor">Sponsor</option>
                    <option value="collaborator">Collaborator</option>
                  </select>
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
                  <span className="text-sm font-semibold text-[var(--navy)]">Visible in footer</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Add Partner' : 'Save Changes'}
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
