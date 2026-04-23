'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, adminBulkUpdateSettings } from '@/lib/api'
import toast from 'react-hot-toast'
import { Save, MapPin, Phone, Mail, Globe, Lock } from 'lucide-react'
import { api } from '@/lib/api'

const SETTING_GROUPS = [
  {
    title: 'Contact Information',
    icon: Phone,
    fields: [
      { key: 'phone_primary', label: 'Primary Phone', type: 'text', placeholder: '+254 XXX XXX XXX' },
      { key: 'phone_secondary', label: 'Secondary Phone (optional)', type: 'text', placeholder: '' },
      { key: 'email_primary', label: 'Primary Email', type: 'email', placeholder: 'info@liftedtolift.org' },
      { key: 'email_secondary', label: 'Secondary Email (optional)', type: 'email', placeholder: '' },
      { key: 'whatsapp_number', label: 'WhatsApp Number (floating button on all pages)', type: 'text', placeholder: '0705560257' },
    ],
  },
  {
    title: 'Address & Location',
    icon: MapPin,
    fields: [
      { key: 'address_line1', label: 'Address Line 1', type: 'text', placeholder: 'P.O. Box XXXX' },
      { key: 'address_line2', label: 'Address Line 2', type: 'text', placeholder: 'Nairobi, Kenya' },
      { key: 'location_city', label: 'City', type: 'text', placeholder: 'Nairobi' },
      { key: 'location_country', label: 'Country', type: 'text', placeholder: 'Kenya' },
    ],
  },
  {
    title: 'Social Media Links',
    icon: Globe,
    fields: [
      { key: 'facebook_url', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/...' },
      { key: 'twitter_url', label: 'Twitter/X URL', type: 'url', placeholder: 'https://twitter.com/...' },
      { key: 'instagram_url', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/...' },
      { key: 'youtube_url', label: 'YouTube URL', type: 'url', placeholder: 'https://youtube.com/...' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/...' },
    ],
  },
  {
    title: 'Organisation Details',
    icon: Mail,
    fields: [
      { key: 'about_story', label: 'About Story (homepage)', type: 'textarea', placeholder: 'Tell the story of LIFTED TO LIFT...' },
      { key: 'footer_text', label: 'Footer Description', type: 'text', placeholder: 'Dedicated to lifting lives...' },
    ],
  },
]

export default function AdminSettings() {
  const qc = useQueryClient()
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [changingPw, setChangingPw] = useState(false)

  const val = (key: string) => form[key] ?? settings[key] ?? ''
  const handleChange = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSaveGroup = async (groupTitle: string, fields: Array<{ key: string }>) => {
    const updates: Record<string, string> = {}
    fields.forEach(({ key }) => { if (form[key] !== undefined) updates[key] = form[key] })
    if (Object.keys(updates).length === 0) return toast('No changes in this section.')
    setSaving(groupTitle)
    try {
      await adminBulkUpdateSettings(updates)
      qc.invalidateQueries({ queryKey: ['settings'] })
      setForm((f) => {
        const copy = { ...f }
        fields.forEach(({ key }) => delete copy[key])
        return copy
      })
      toast.success('Saved successfully!')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(null)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match.')
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters.')
    setChangingPw(true)
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch {
      toast.error('Failed to change password. Check current password.')
    } finally {
      setChangingPw(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-8">
        <div>
          <h2 className="text-2xl font-black text-[var(--navy)]">Contact & Settings</h2>
          <p className="text-gray-500 text-sm mt-1">All changes take effect immediately on the website.</p>
        </div>

        {SETTING_GROUPS.map(({ title, icon: Icon, fields }) => (
          <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-black text-[var(--navy)] mb-4 flex items-center gap-2">
              <Icon size={16} className="text-[var(--gold)]" />
              {title}
            </h3>
            <div className="space-y-4">
              {fields.map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-semibold text-[var(--navy)] block mb-2">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      rows={4}
                      value={val(key)}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] text-sm resize-none"
                      placeholder={placeholder}
                    />
                  ) : (
                    <input
                      type={type}
                      value={val(key)}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] text-sm"
                      placeholder={placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => handleSaveGroup(title, fields)}
              disabled={saving === title}
              className="mt-5 btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving === title ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Save size={15} />}
              Save {title}
            </button>
          </div>
        ))}

        {/* Change Password */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-black text-[var(--navy)] mb-4 flex items-center gap-2">
            <Lock size={16} className="text-[var(--gold)]" />
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
              { key: 'newPassword', label: 'New Password', placeholder: 'Minimum 8 characters' },
              { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-[var(--navy)] block mb-2">{label}</label>
                <input
                  type="password"
                  value={pwForm[key as keyof typeof pwForm]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] text-sm"
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={changingPw}
              className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {changingPw ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" /> : <Lock size={15} />}
              Change Password
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
