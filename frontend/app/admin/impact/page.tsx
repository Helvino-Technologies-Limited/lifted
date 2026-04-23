'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAllImpactItems, api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Target } from 'lucide-react'

type ImpactItem = {
  id: number
  program: string
  focus_area?: string
  financial_need?: string
  quantity_required?: string
  amount_required?: string
  quantity_fulfilled_pct: number
  amount_fulfilled_pct: number
  display_order: number
  active: boolean
}

const BLANK: Partial<ImpactItem> = {
  program: '',
  focus_area: '',
  financial_need: '',
  quantity_required: '',
  amount_required: '',
  quantity_fulfilled_pct: 0,
  amount_fulfilled_pct: 0,
  display_order: 0,
  active: true,
}

const PROGRAMS = ['Educational Equity', 'Youth Empowerment', "Senior Citizens' Welfare", 'Institutional Stewardship', 'Partnerships & Networking']

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

export default function AdminImpact() {
  const qc = useQueryClient()
  const { data: items = [] } = useQuery<ImpactItem[]>({ queryKey: ['impact-items-all'], queryFn: fetchAllImpactItems })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<ImpactItem>>(BLANK)
  const [saving, setSaving] = useState(false)

  const handleOpenEdit = (item?: ImpactItem) => {
    setEditId(item?.id ?? 'new')
    setForm(item ? { ...item } : { ...BLANK })
  }

  const handleSave = async () => {
    if (!form.program) return toast.error('Program is required.')
    if (!form.financial_need) return toast.error('Financial need description is required.')
    setSaving(true)
    try {
      const body = {
        program: form.program,
        focus_area: form.focus_area || '',
        financial_need: form.financial_need,
        quantity_required: form.quantity_required || '',
        amount_required: form.amount_required || '',
        quantity_fulfilled_pct: form.quantity_fulfilled_pct ?? 0,
        amount_fulfilled_pct: form.amount_fulfilled_pct ?? 0,
        display_order: form.display_order ?? 0,
        active: form.active ?? true,
      }
      if (editId === 'new') {
        await api.post('/api/impact-items', body)
        toast.success('Impact item added!')
      } else {
        await api.put(`/api/impact-items/${editId}`, body)
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['impact-items-all'] })
      qc.invalidateQueries({ queryKey: ['impact-items'] })
      setEditId(null)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this impact item?')) return
    try {
      await api.delete(`/api/impact-items/${id}`)
      qc.invalidateQueries({ queryKey: ['impact-items-all'] })
      qc.invalidateQueries({ queryKey: ['impact-items'] })
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
            <h2 className="text-2xl font-black text-[var(--navy)]">Your Impact Items</h2>
            <p className="text-gray-500 text-sm mt-1">Each item shows a program, its funding need, and progress towards the goal.</p>
          </div>
          <button
            onClick={() => handleOpenEdit()}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Items', value: (items as ImpactItem[]).length },
            { label: 'Visible', value: (items as ImpactItem[]).filter(i => i.active).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-black text-[var(--navy)]">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(items as ImpactItem[]).map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm group relative ${!item.active ? 'opacity-50' : 'border-gray-100'}`}
            >
              {!item.active && (
                <span className="absolute top-3 left-3 bg-gray-100 text-gray-500 text-[10px] font-black rounded-full px-2 py-0.5">Hidden</span>
              )}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shrink-0">
                  <Target size={16} className="text-[var(--navy)]" />
                </div>
                <div>
                  <p className="font-black text-[var(--navy)] text-sm">{item.program}</p>
                  {item.focus_area && <p className="text-[var(--gold)] text-xs font-semibold">{item.focus_area}</p>}
                </div>
              </div>
              {item.financial_need && (
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{item.financial_need}</p>
              )}
              <div className="space-y-3">
                {item.amount_required && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Amount: <span className="font-bold text-[var(--navy)]">{item.amount_required}</span></span>
                      <span className="font-bold text-[var(--navy)]">{item.amount_fulfilled_pct}%</span>
                    </div>
                    <ProgressBar pct={item.amount_fulfilled_pct} color="bg-[var(--gold)]" />
                  </div>
                )}
                {item.quantity_required && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Qty: <span className="font-bold text-[var(--navy)]">{item.quantity_required}</span></span>
                      <span className="font-bold text-[var(--navy)]">{item.quantity_fulfilled_pct}%</span>
                    </div>
                    <ProgressBar pct={item.quantity_fulfilled_pct} color="bg-emerald-400" />
                  </div>
                )}
              </div>

              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors bg-white shadow-sm">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors bg-white shadow-sm">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="text-lg font-semibold">No impact items yet</p>
            <p className="text-sm mt-1">Add your first item using the button above.</p>
          </div>
        )}

        {/* Edit/Add Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'Add Impact Item' : 'Edit Impact Item'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Program <span className="text-red-400">*</span></label>
                  <select
                    value={form.program || ''}
                    onChange={(e) => setForm(f => ({ ...f, program: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] bg-white"
                  >
                    <option value="">Select program...</option>
                    {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Focus Area</label>
                  <input
                    type="text"
                    value={form.focus_area || ''}
                    onChange={(e) => setForm(f => ({ ...f, focus_area: e.target.value }))}
                    placeholder="e.g. School Supplies, Healthcare, Skills Training"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Financial Need Description <span className="text-red-400">*</span></label>
                  <textarea
                    rows={3}
                    value={form.financial_need || ''}
                    onChange={(e) => setForm(f => ({ ...f, financial_need: e.target.value }))}
                    placeholder="Describe what the funds will be used for, e.g. Purchase school uniforms for 50 children in Grade 4"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Amount Required</label>
                    <input
                      type="text"
                      value={form.amount_required || ''}
                      onChange={(e) => setForm(f => ({ ...f, amount_required: e.target.value }))}
                      placeholder="e.g. KES 50,000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Quantity Required</label>
                    <input
                      type="text"
                      value={form.quantity_required || ''}
                      onChange={(e) => setForm(f => ({ ...f, quantity_required: e.target.value }))}
                      placeholder="e.g. 50 uniforms"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Amount Fulfilled (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.amount_fulfilled_pct ?? 0}
                      onChange={(e) => setForm(f => ({ ...f, amount_fulfilled_pct: Math.min(100, parseInt(e.target.value) || 0) }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Quantity Fulfilled (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.quantity_fulfilled_pct ?? 0}
                      onChange={(e) => setForm(f => ({ ...f, quantity_fulfilled_pct: Math.min(100, parseInt(e.target.value) || 0) }))}
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

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active ?? true}
                    onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-[var(--navy)]">Visible on donate page</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Add Item' : 'Save Changes'}
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
