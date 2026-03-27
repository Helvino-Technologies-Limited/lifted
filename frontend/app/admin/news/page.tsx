'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNews, adminUploadMedia, api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Check, Upload, Eye, EyeOff, Link2, Video } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type NewsItem = {
  id: number
  title: string
  excerpt?: string
  body?: string
  image_url?: string
  video_url?: string
  author?: string
  published?: boolean
  featured?: boolean
  created_at: string
  slug: string
}

export default function AdminNews() {
  const qc = useQueryClient()
  const { data: news = [] } = useQuery({ queryKey: ['news', 'all'], queryFn: () => fetchNews() })
  const [editId, setEditId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Partial<NewsItem>>({ title: '', excerpt: '', body: '', author: 'LIFTED TO LIFT', published: false, featured: false, video_url: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required.')
    setSaving(true)
    try {
      const fd = new FormData()
      if (form.title) fd.append('title', form.title)
      if (form.excerpt) fd.append('excerpt', form.excerpt)
      if (form.body) fd.append('body', form.body)
      if (form.author) fd.append('author', form.author)
      fd.append('published', String(form.published || false))
      fd.append('featured', String(form.featured || false))
      fd.append('video_url', form.video_url || '')
      if (imageFile) fd.append('image', imageFile)

      if (editId === 'new') {
        await api.post('/api/news', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Story published!')
      } else {
        await api.put(`/api/news/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Updated!')
      }
      qc.invalidateQueries({ queryKey: ['news'] })
      setEditId(null)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this story?')) return
    try {
      await api.delete(`/api/news/${id}`)
      qc.invalidateQueries({ queryKey: ['news'] })
      toast.success('Deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const togglePublish = async (item: NewsItem) => {
    try {
      const fd = new FormData()
      fd.append('published', String(!item.published))
      await api.put(`/api/news/${item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      qc.invalidateQueries({ queryKey: ['news'] })
      toast.success(item.published ? 'Unpublished.' : 'Published!')
    } catch {
      toast.error('Failed to toggle.')
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'news')
      const media = await adminUploadMedia(fd)
      setForm((f) => ({ ...f, video_url: media.url }))
      toast.success('Video uploaded!')
    } catch {
      toast.error('Video upload failed.')
    } finally {
      setVideoUploading(false)
      e.target.value = ''
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-[var(--navy)]">News & Stories</h2>
            <p className="text-gray-500 text-sm mt-1">Write and publish stories and news updates.</p>
          </div>
          <button
            onClick={() => { setEditId('new'); setForm({ title: '', excerpt: '', body: '', author: 'LIFTED TO LIFT', published: false, featured: false, video_url: '' }); setImageFile(null) }}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> New Story
          </button>
        </div>

        {/* News list */}
        <div className="space-y-3">
          {news.map((item: NewsItem) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.published ? 'Published' : 'Draft'}
                  </span>
                  {item.featured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gold-pale)] text-[var(--gold)]">Featured</span>}
                  {item.video_url && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1"><Video size={9} /> Video</span>}
                  <span className="text-gray-400 text-[10px]">{formatDate(item.created_at)}</span>
                </div>
                <p className="font-black text-[var(--navy)] text-sm truncate">{item.title}</p>
                {item.excerpt && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.excerpt}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => togglePublish(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title={item.published ? 'Unpublish' : 'Publish'}>
                  {item.published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => { setEditId(item.id); setForm({ ...item }); setImageFile(null) }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="font-semibold">No stories yet</p>
            <p className="text-sm mt-1">Create your first news story or update above.</p>
          </div>
        )}

        {/* Editor Modal */}
        {editId !== null && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-[var(--navy)]">{editId === 'new' ? 'New Story' : 'Edit Story'}</h3>
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
                    placeholder="Story headline"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Excerpt / Summary</label>
                  <textarea
                    rows={2}
                    value={form.excerpt || ''}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                    placeholder="Short summary shown in listings"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Full Story</label>
                  <textarea
                    rows={8}
                    value={form.body || ''}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                    placeholder="Full story content..."
                  />
                </div>

                {/* Cover image */}
                <div>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Cover Image</label>
                  {(imageFile || form.image_url) && (
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : form.image_url}
                      alt="Cover"
                      className="w-full h-32 object-cover rounded-xl mb-2"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--gold)] transition-colors text-sm text-gray-500 w-fit">
                    <Upload size={14} />
                    {imageFile ? imageFile.name.slice(0, 20) : 'Upload cover image'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {/* Video */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-[var(--navy)] flex items-center gap-2"><Video size={14} /> Video (optional)</p>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1"><Link2 size={12} /> Paste YouTube URL</label>
                    <input
                      type="url"
                      value={form.video_url || ''}
                      onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">or upload a video file</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--gold)] transition-colors text-sm text-gray-500 w-fit">
                    {videoUploading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-[var(--gold)] rounded-full animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {videoUploading ? 'Uploading...' : 'Upload video (MP4)'}
                    <input type="file" accept="video/*" className="hidden" disabled={videoUploading} onChange={handleVideoUpload} />
                  </label>

                  {form.video_url && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-500 truncate flex-1">{form.video_url}</span>
                      <button onClick={() => setForm((f) => ({ ...f, video_url: '' }))} className="ml-2 text-red-400 hover:text-red-600 text-xs shrink-0">Remove</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-1.5">Author</label>
                    <input
                      type="text"
                      value={form.author || ''}
                      onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded" />
                      <span className="text-sm font-semibold text-[var(--navy)]">Publish</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="rounded" />
                      <span className="text-sm font-semibold text-[var(--navy)]">Featured Story</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Check size={14} />}
                    {editId === 'new' ? 'Publish Story' : 'Save Changes'}
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
