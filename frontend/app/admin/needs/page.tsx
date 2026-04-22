'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNeeds, api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, AlertTriangle, Package } from 'lucide-react'

type Need = {
  id: number
  title: string
  description?: string
  category?: string
  quantity_needed?: number
  quantity_fulfilled: number
  urgent: boolean
  active: boolean
  display_order: number
}

const CATEGORIES = ['Food', 'Clothing', 'School Supplies', 'Medical', 'Financial', 'Furniture', 'Electronics', 'Other']
const BLANK: Partial<Need> = { title: '', description: '', category: '', quantity_needed: undefined, quantity_fulfilled: 0, urgent: false, active: true, display_order: 0 }

export default function AdminNeeds() {
  const qc = useQueryClient()
  const { data: needs = [] } = useQuery({ queryKey: ['needs'], queryFn: () => fetchNeeds() })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<Need>>(BLANK)
  const [saving, setSaving] = useState(false)

  const handleOpenEdit = (need?: Need) => {
    setEditId(need?.id ?? 'new')
    setForm(need ? { ...need } : { ...BLANK })
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required.')
    setSaving(true)
    try {
      const body = {
        title: form.title,
        description: form.description || '',
        category: form.category || '',
        quantity_needed: form.quantity_needed ?? null,
        quantity_fulfilled: form.quantity_fulfilled ?? 0,
        urgent: form.urgent ?? false,
        active: form.active ?? true,
        display_order: form.display_order ?? 0,
      }
      if (editId === 'new') {
        await api.post('/api/needs', body)
        toast.success('Need added!')
      } else {
        await api.put(`/api/needs/${editId}`, body)
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['needs'] })
      setEditId(null)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this need?')) return
    try {
      await api.delete(`/api/needs/${id}`)
      qc.invalidateQueries({ queryKey: ['needs'] })
      toast.success('Deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const fulfillmentPct = (need: Need) => {
    if (!need.quantity_needed) return null
    return Math.min(100, Math.round((need.quantity_fulfilled / need.quantity_needed) * 100))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-[var(--navy)]">Listed Needs</h2>
            <p className="text-gray-500 text-sm mt-1">Manage items and resources needed by the organisation.</p>
          </div>
          <button
            onClick={() => handleOpenEdit()}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Need
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Needs', value: needs.length },
            { label: 'Urgent', value: (needs as Need[]).filter(n => n.urgent && n.active).length },
            { label: 'Active', value: (needs as Need[]).filter(n => n.active).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-black text-[var(--navy)]">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Needs Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(needs as Need[]).map((need) => {
            const pct = fulfillmentPct(need)
            return (
              <div key={need.id} className={`bg-white rounded-2xl p-5 border shadow-sm group relative ${!need.active ? 'opacity-60' : ''} ${need.urgent ? 'border-red-200' : 'border-gray-100'}`}>
                {need.urgent && (
                  <span className="absolute top-3 right-3 bg-red-100 text-red-700 text-[10px] font-black rounded-full px-2 py-0.5 flex items-center gap-1">
                    <AlertTriangle size={9} /> Urgent
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center shrink-0">
                    <Package size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[var(--navy)] text-sm">{need.title}</p>
                    {need.category && <p className="text-[var(--gold)] text-xs font-semibold">{need.category}</p>}
                    {need.description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{need.description}</p>}
                  </div>
                </div>
                {pct !== null && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{need.quantity_fulfilled} of {need.quantity_needed} fulfilled</span>
                      <span className="font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--gold)] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ marginTop: need.urgent ? '24px' : '0' }}>
                  <button onClick={() => handleOpenEdit(need)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors bg-white shadow-sm">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(need.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors bg-white shadow-sm">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {needs.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="text-lg font-semibold">No needs listed yet</p>
            <p className="text-sm mt-1">Add your first need using the button above.</p>
          </div>
        )}

        {/* Edit/Add Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'Add Need' : 'Edit Need'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={form.title || ''}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. School uniforms for 20 children"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Category</label>
                  <select
                    value={form.category || ''}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] bg-white"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description || ''}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Quantity Needed</label>
                    <input
                      type="number"
                      min={0}
                      value={form.quantity_needed ?? ''}
                      onChange={(e) => setForm(f => ({ ...f, quantity_needed: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Quantity Fulfilled</label>
                    <input
                      type="number"
                      min={0}
                      value={form.quantity_fulfilled ?? 0}
                      onChange={(e) => setForm(f => ({ ...f, quantity_fulfilled: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
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
                      checked={form.urgent ?? false}
                      onChange={(e) => setForm(f => ({ ...f, urgent: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-[var(--navy)]">Mark as Urgent</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active ?? true}
                      onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-[var(--navy)]">Active</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Add Need' : 'Save Changes'}
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
