'use client'
import { useState, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPageContent, adminBulkUpdateContent, adminUploadMedia } from '@/lib/api'
import toast from 'react-hot-toast'
import { Save, ChevronDown, ChevronUp, Upload, X } from 'lucide-react'

const PAGE_SECTIONS = [
  {
    page: 'home',
    label: 'Home Page',
    sections: [
      { section: 'hero', label: 'Hero Section', fields: ['title', 'subtitle', 'cta_primary', 'cta_secondary'] },
      { section: 'impact', label: 'Impact Section', fields: ['title', 'description'] },
      { section: 'story_images', label: 'Our Story — Images', fields: ['image1', 'image2', 'image3', 'image4'] },
    ],
  },
  {
    page: 'about',
    label: 'About Page',
    sections: [
      { section: 'mission', label: 'Mission', fields: ['title', 'body'] },
      { section: 'vision', label: 'Vision', fields: ['title', 'body'] },
      { section: 'values', label: 'Values', fields: ['title'] },
    ],
  },
  {
    page: 'programs',
    label: 'Programs Page',
    sections: [
      { section: 'header', label: 'Page Header', fields: ['title', 'subtitle'] },
      { section: 'pillar1', label: 'Pillar 1: Educational Equity', fields: ['title', 'body', 'image'] },
      { section: 'pillar2', label: 'Pillar 2: Youth Empowerment', fields: ['title', 'body', 'image'] },
      { section: 'pillar3', label: "Pillar 3: Senior Citizens' Welfare", fields: ['title', 'body', 'image'] },
      { section: 'pillar4', label: 'Pillar 4: Institutional Stewardship', fields: ['title', 'body', 'image'] },
      { section: 'pillar5', label: 'Pillar 5: Partnerships & Networking', fields: ['title', 'body', 'image'] },
    ],
  },
  {
    page: 'contact',
    label: 'Contact Page',
    sections: [
      { section: 'header', label: 'Page Header', fields: ['title', 'subtitle'] },
    ],
  },
]

function ImageUploadField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'general')
      const result = await adminUploadMedia(fd)
      onChange(result.url)
      toast.success('Image uploaded!')
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Current" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs">
          Using default image
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {uploading
            ? <div className="w-3 h-3 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" />
            : <Upload size={13} />}
          {value ? 'Replace' : 'Upload Image'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-4 py-2 rounded-xl text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
          >
            <X size={13} /> Remove
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

function SectionEditor({ page, section, label, fields }: {
  page: string
  section: string
  label: string
  fields: string[]
}) {
  const qc = useQueryClient()
  const { data: content = {} } = useQuery({
    queryKey: ['content', page],
    queryFn: () => fetchPageContent(page),
  })
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const val = (f: string) => form[f] ?? content?.[section]?.[f] ?? ''

  const handleSave = async () => {
    const updates = fields.map((field) => ({
      page, section, field, content: form[field] ?? content?.[section]?.[field] ?? '',
    }))
    setSaving(true)
    try {
      await adminBulkUpdateContent(updates)
      qc.invalidateQueries({ queryKey: ['content', page] })
      setForm({})
      toast.success(`${label} saved!`)
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-[var(--gold-pale)] transition-colors text-left"
      >
        <span className="font-semibold text-[var(--navy)] text-sm">{label}</span>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {expanded && (
        <div className="p-5 space-y-4">
          {fields.map((field) => {
            const isImage = field === 'image' || field.startsWith('image')
            const isLong = field === 'body' || field === 'subtitle' || field === 'description'
            return (
              <div key={field}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  {field.replace(/_/g, ' ')}
                </label>
                {isImage ? (
                  <ImageUploadField
                    value={val(field)}
                    onChange={(url) => setForm((f) => ({ ...f, [field]: url }))}
                  />
                ) : isLong ? (
                  <textarea
                    rows={4}
                    value={val(field)}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] text-sm resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={val(field)}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] text-sm"
                  />
                )}
              </div>
            )
          })}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Save size={14} />}
            Save Section
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminContent() {
  const [activePage, setActivePage] = useState('home')
  const activePageData = PAGE_SECTIONS.find((p) => p.page === activePage)

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[var(--navy)]">Page Content</h2>
          <p className="text-gray-500 text-sm mt-1">Edit text content for every section of the website. Changes are saved and take effect immediately.</p>
        </div>

        {/* Page tabs */}
        <div className="flex gap-2 flex-wrap">
          {PAGE_SECTIONS.map(({ page, label }) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activePage === page ? 'bg-[var(--navy)] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--gold)]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sections */}
        {activePageData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-[var(--gold-pale)]">
              <h3 className="font-black text-[var(--navy)]">{activePageData.label}</h3>
            </div>
            <div className="p-5 space-y-3">
              {activePageData.sections.map(({ section, label, fields }) => (
                <SectionEditor
                  key={section}
                  page={activePage}
                  section={section}
                  label={label}
                  fields={fields}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
