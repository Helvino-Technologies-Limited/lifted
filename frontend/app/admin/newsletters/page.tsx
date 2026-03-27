'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNewsletters, adminCreateNewsletter, adminUpdateNewsletter, adminDeleteNewsletter } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Upload, Eye, EyeOff, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Newsletter = {
  id: number
  title: string
  description?: string
  file_url?: string
  cover_image_url?: string
  published: boolean
  created_at: string
}

export default function AdminNewsletters() {
  const qc = useQueryClient()
  const { data: newsletters = [] } = useQuery({ queryKey: ['newsletters', 'all'], queryFn: () => fetchNewsletters() })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<Newsletter>>({ title: '', description: '', published: false })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setEditId('new')
    setForm({ title: '', description: '', published: false })
    setPdfFile(null)
    setCoverFile(null)
  }

  const openEdit = (item: Newsletter) => {
    setEditId(item.id)
    setForm({ ...item })
    setPdfFile(null)
    setCoverFile(null)
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required.')
    if (editId === 'new' && !pdfFile) return toast.error('Please select a PDF file.')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title!)
      if (form.description) fd.append('description', form.description)
      fd.append('published', String(form.published || false))
      if (pdfFile) fd.append('pdf', pdfFile)
      if (coverFile) fd.append('cover', coverFile)

      if (editId === 'new') {
        await adminCreateNewsletter(fd)
        toast.success('Newsletter created!')
      } else {
        await adminUpdateNewsletter(editId as number, fd)
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['newsletters'] })
      setEditId(null)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this newsletter?')) return
    try {
      await adminDeleteNewsletter(id)
      qc.invalidateQueries({ queryKey: ['newsletters'] })
      toast.success('Deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const togglePublish = async (item: Newsletter) => {
    try {
      const fd = new FormData()
      fd.append('published', String(!item.published))
      await adminUpdateNewsletter(item.id, fd)
      qc.invalidateQueries({ queryKey: ['newsletters'] })
      toast.success(item.published ? 'Unpublished.' : 'Published!')
    } catch {
      toast.error('Failed.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-[var(--navy)]">Newsletters</h2>
            <p className="text-gray-500 text-sm mt-1">Upload and publish newsletters for your community.</p>
          </div>
          <button onClick={openNew} className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
            <Plus size={16} /> New Newsletter
          </button>
        </div>

        <div className="space-y-3">
          {newsletters.map((item: Newsletter) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              {item.cover_image_url ? (
                <img src={item.cover_image_url} alt={item.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[var(--gold-pale)] flex items-center justify-center shrink-0">
                  <FileText size={22} className="text-[var(--gold)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-gray-400 text-[10px]">{formatDate(item.created_at)}</span>
                  {item.file_url && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">PDF</span>}
                </div>
                <p className="font-black text-[var(--navy)] text-sm truncate">{item.title}</p>
                {item.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => togglePublish(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" title={item.published ? 'Unpublish' : 'Publish'}>
                  {item.published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {newsletters.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No newsletters yet</p>
            <p className="text-sm mt-1">Upload your first newsletter above.</p>
          </div>
        )}

        {/* Editor Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'New Newsletter' : 'Edit Newsletter'}</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={form.title || ''}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    placeholder="e.g. Community Newsletter — March 2026"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description || ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                    placeholder="Short description of what's inside..."
                  />
                </div>

                {/* PDF Upload */}
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">
                    PDF File {editId === 'new' ? '*' : '(leave empty to keep existing)'}
                  </label>
                  {form.file_url && !pdfFile && (
                    <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mb-2 block">
                      View current PDF
                    </a>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--gold)] transition-colors text-sm text-gray-500 w-fit">
                    <FileText size={14} />
                    {pdfFile ? pdfFile.name.slice(0, 30) : 'Choose PDF file'}
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Cover Image (optional)</label>
                  {(coverFile || form.cover_image_url) && (
                    <img
                      src={coverFile ? URL.createObjectURL(coverFile) : form.cover_image_url}
                      alt="Cover"
                      className="w-24 h-32 object-cover rounded-xl mb-2"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--gold)] transition-colors text-sm text-gray-500 w-fit">
                    <Upload size={14} />
                    {coverFile ? coverFile.name.slice(0, 20) : 'Upload cover image'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded" />
                  <span className="text-sm font-semibold text-[var(--navy)]">Publish immediately</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Create Newsletter' : 'Save Changes'}
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
