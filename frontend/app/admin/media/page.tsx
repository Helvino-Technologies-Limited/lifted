'use client'
import { useState, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMedia, adminUploadMedia, adminDeleteMedia, adminUpdateMedia } from '@/lib/api'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Upload, Trash2, Edit2, Play, Star, Check, X, ImageIcon, Video } from 'lucide-react'

const CATEGORIES = ['general', 'gallery', 'team', 'programs', 'news', 'branding']
const PAGES = ['home', 'about', 'programs', 'gallery', 'contact', 'news']

export default function AdminMedia() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ alt_text: '', caption: '', category: 'gallery', page: '' })
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string | boolean>>({})
  const [activeFilter, setActiveFilter] = useState('all')
  const [dragOver, setDragOver] = useState(false)

  const { data: media = [] } = useQuery({
    queryKey: ['media', 'all'],
    queryFn: () => fetchMedia(),
  })

  const filtered = activeFilter === 'all' ? media
    : activeFilter === 'videos' ? media.filter((m: { type: string }) => m.type === 'video')
    : activeFilter === 'images' ? media.filter((m: { type: string }) => m.type === 'image')
    : media.filter((m: { category: string }) => m.category === activeFilter)

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    let successCount = 0
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('alt_text', form.alt_text || file.name)
        fd.append('caption', form.caption)
        fd.append('category', form.category)
        if (form.page) fd.append('page', form.page)
        await adminUploadMedia(fd)
        successCount++
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded!`)
      qc.invalidateQueries({ queryKey: ['media'] })
      setForm({ alt_text: '', caption: '', category: 'gallery', page: '' })
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this file? This cannot be undone.')) return
    try {
      await adminDeleteMedia(id)
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const handleToggleFeatured = async (item: { id: number; featured?: boolean }) => {
    try {
      await adminUpdateMedia(item.id, { featured: !(item.featured === true) })
      qc.invalidateQueries({ queryKey: ['media'] })
    } catch {
      toast.error('Failed to update.')
    }
  }

  const handleEditSave = async (id: number) => {
    try {
      await adminUpdateMedia(id, editForm)
      qc.invalidateQueries({ queryKey: ['media'] })
      setEditId(null)
      toast.success('Updated.')
    } catch {
      toast.error('Failed to update.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[var(--navy)]">Media Library</h2>
          <p className="text-gray-500 text-sm mt-1">Upload and manage photos and videos for the website. Featured items appear in the gallery preview.</p>
        </div>

        {/* Upload Zone */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-black text-[var(--navy)] mb-4">Upload Files</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Alt Text / Description</label>
                <input
                  type="text"
                  value={form.alt_text}
                  onChange={(e) => setForm((f) => ({ ...f, alt_text: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  placeholder="Describe the image/video"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] bg-white"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Page (optional)</label>
                <select
                  value={form.page}
                  onChange={(e) => setForm((f) => ({ ...f, page: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] bg-white"
                >
                  <option value="">All pages</option>
                  {PAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver ? 'border-[var(--gold)] bg-[var(--gold-pale)]' : 'border-gray-300 hover:border-[var(--gold)]'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-gray-200 border-t-[var(--gold)] rounded-full animate-spin" />
                  <span className="text-[var(--navy)] font-semibold text-sm">Uploading to Cloudinary...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[var(--gold-pale)] flex items-center justify-center">
                    <Upload size={24} className="text-[var(--gold)]" />
                  </div>
                  <p className="text-[var(--navy)] font-semibold">Drop files here or click to browse</p>
                  <p className="text-gray-400 text-xs">Images (JPG, PNG, WEBP) and Videos (MP4, MOV) — multiple files supported</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>

          {/* Filters */}
          <div className="px-6 py-3 bg-gray-50 flex gap-2 overflow-x-auto">
            {['all', 'images', 'videos', ...CATEGORIES].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeFilter === f ? 'bg-[var(--navy)] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--gold)]'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Media Grid */}
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ImageIcon size={40} className="mx-auto mb-3 opacity-40" />
                <p>No media uploaded yet. Upload files above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((item: { id: number; url: string; type: string; alt_text?: string; caption?: string; category?: string; featured?: boolean }) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square shadow-sm hover:shadow-md transition-all">
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-[var(--navy)] flex items-center justify-center">
                        <Video size={28} className="text-white/60" />
                      </div>
                    ) : (
                      <Image
                        src={item.url}
                        alt={item.alt_text || ''}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    )}

                    {/* Featured badge */}
                    {item.featured && (
                      <div className="absolute top-1 left-1 bg-[var(--gold)] text-white p-1 rounded-full">
                        <Star size={10} fill="white" />
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${item.featured ? 'bg-[var(--gold)] text-white' : 'bg-white/20 text-white hover:bg-[var(--gold)] hover:text-white'}`}
                        title={item.featured ? 'Unfeature' : 'Feature'}
                      >
                        <Star size={10} />
                      </button>
                      <button
                        onClick={() => { setEditId(item.id); setEditForm({ alt_text: item.alt_text || '', caption: item.caption || '', category: item.category || 'general' }) }}
                        className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-blue-500 transition-all"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-red-500 transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-[var(--navy)]">Edit Media</h3>
                <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Alt Text</label>
                  <input
                    type="text"
                    value={String(editForm.alt_text || '')}
                    onChange={(e) => setEditForm((f) => ({ ...f, alt_text: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Caption</label>
                  <input
                    type="text"
                    value={String(editForm.caption || '')}
                    onChange={(e) => setEditForm((f) => ({ ...f, caption: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Category</label>
                  <select
                    value={String(editForm.category || 'general')}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEditSave(editId)}
                    className="flex-1 btn-primary py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button onClick={() => setEditId(null)} className="flex-1 border-2 border-gray-200 py-2 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
