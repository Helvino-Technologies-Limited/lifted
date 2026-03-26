'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, adminBulkUpdateSettings, adminUploadMedia, api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Upload, Video, ImageIcon, Save } from 'lucide-react'

export default function HeroAdmin() {
  const qc = useQueryClient()
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const [form, setForm] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const val = (key: string) => form[key] ?? settings[key] ?? ''

  const handleChange = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSave = async () => {
    if (Object.keys(form).length === 0) return toast('No changes to save.')
    setSaving(true)
    try {
      await adminBulkUpdateSettings(form)
      qc.invalidateQueries({ queryKey: ['settings'] })
      setForm({})
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, settingKey: string, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(settingKey)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'branding')
      const media = await adminUploadMedia(fd)
      // Save the URL to settings
      await api.put('/api/settings', { key: settingKey, value: media.url })
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success(`${type === 'video' ? 'Video' : 'Image'} uploaded!`)
    } catch {
      toast.error('Upload failed. Check your Cloudinary credentials.')
    } finally {
      setUploading(null)
      e.target.value = ''
    }
  }

  const FIELDS = [
    { key: 'hero_title', label: 'Hero Title', type: 'text', placeholder: 'Lifting Lives, Building Futures' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Together, we create a legacy...' },
    { key: 'stats_beneficiaries', label: 'Stat: Beneficiaries', type: 'text', placeholder: '500+' },
    { key: 'stats_schools', label: 'Stat: Schools Partnered', type: 'text', placeholder: '12' },
    { key: 'stats_youth_trained', label: 'Stat: Youth Trained', type: 'text', placeholder: '200+' },
    { key: 'stats_seniors_supported', label: 'Stat: Seniors Supported', type: 'text', placeholder: '150+' },
  ]

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-8">
        <div>
          <h2 className="text-2xl font-black text-[var(--navy)]">Hero & Branding</h2>
          <p className="text-gray-500 text-sm mt-1">Upload your logo, background video, and configure the hero section.</p>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-black text-[var(--navy)] mb-1 flex items-center gap-2">
            <ImageIcon size={16} className="text-[var(--gold)]" /> Organisation Logo
          </h3>
          <p className="text-gray-400 text-xs mb-4">Upload a square PNG/JPG logo (recommended: 200×200px)</p>
          {settings.hero_logo_url && (
            <img src={settings.hero_logo_url} alt="Logo" className="w-20 h-20 rounded-full object-cover border-2 border-[var(--gold)] mb-4 shadow-md" />
          )}
          <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[var(--gold)] transition-colors w-fit">
            {uploading === 'hero_logo_url' ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-[var(--gold)] rounded-full animate-spin" />
            ) : (
              <Upload size={18} className="text-gray-400" />
            )}
            <span className="text-sm text-gray-500">{uploading === 'hero_logo_url' ? 'Uploading...' : 'Choose logo image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!!uploading}
              onChange={(e) => handleFileUpload(e, 'hero_logo_url', 'image')}
            />
          </label>
        </div>

        {/* Background Video */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-black text-[var(--navy)] mb-1 flex items-center gap-2">
            <Video size={16} className="text-[var(--gold)]" /> Hero Background Video
          </h3>
          <p className="text-gray-400 text-xs mb-4">Upload an MP4 video for the homepage hero background (max 200MB). If empty, rotating images are used.</p>
          {settings.hero_video_url && (
            <div className="mb-4">
              <video src={settings.hero_video_url} controls className="w-full max-h-40 rounded-xl object-cover" />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[var(--gold)] transition-colors w-fit">
            {uploading === 'hero_video_url' ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-[var(--gold)] rounded-full animate-spin" />
            ) : (
              <Upload size={18} className="text-gray-400" />
            )}
            <span className="text-sm text-gray-500">{uploading === 'hero_video_url' ? 'Uploading...' : 'Choose video file (MP4)'}</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={!!uploading}
              onChange={(e) => handleFileUpload(e, 'hero_video_url', 'video')}
            />
          </label>
          {settings.hero_video_url && (
            <button
              className="mt-2 text-xs text-red-500 hover:underline"
              onClick={async () => {
                await api.put('/api/settings', { key: 'hero_video_url', value: '' })
                qc.invalidateQueries({ queryKey: ['settings'] })
                toast.success('Video removed.')
              }}
            >
              Remove video
            </button>
          )}
        </div>

        {/* Text Fields */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <h3 className="font-black text-[var(--navy)] mb-2">Hero Text & Stats</h3>
          {FIELDS.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-sm font-semibold text-[var(--navy)] block mb-2">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={val(key)}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] text-sm resize-none"
                  placeholder={placeholder}
                />
              ) : (
                <input
                  type="text"
                  value={val(key)}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] text-sm"
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving || Object.keys(form).length === 0}
            className="btn-primary px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
