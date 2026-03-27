'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, adminBulkUpdateSettings } from '@/lib/api'
import toast from 'react-hot-toast'
import { Save, Smartphone, Building2, Globe, FileText, ExternalLink } from 'lucide-react'

const SETTING_GROUPS = [
  {
    title: 'Page Content',
    icon: FileText,
    fields: [
      { key: 'donation_page_title', label: 'Page Title', type: 'text', placeholder: 'Support Our Mission' },
      { key: 'donation_page_subtitle', label: 'Page Subtitle', type: 'textarea', placeholder: 'Your generosity transforms lives...' },
      { key: 'donation_page_message', label: 'Custom Message (optional)', type: 'textarea', placeholder: 'Add a personal note or announcement for donors...' },
    ],
  },
  {
    title: 'M-Pesa',
    icon: Smartphone,
    fields: [
      { key: 'donation_mpesa_name', label: 'Registered Name', type: 'text', placeholder: 'LIFTED TO LIFT' },
      { key: 'donation_mpesa_paybill', label: 'Paybill Number', type: 'text', placeholder: 'e.g. 522533' },
      { key: 'donation_mpesa_account', label: 'Paybill Account Name', type: 'text', placeholder: 'e.g. LiftedToLift' },
      { key: 'donation_mpesa_till', label: 'Buy Goods Till Number (optional)', type: 'text', placeholder: 'e.g. 123456' },
    ],
  },
  {
    title: 'Bank Transfer',
    icon: Building2,
    fields: [
      { key: 'donation_bank_name', label: 'Bank Name', type: 'text', placeholder: 'e.g. Equity Bank Kenya' },
      { key: 'donation_bank_branch', label: 'Branch', type: 'text', placeholder: 'e.g. Nairobi CBD Branch' },
      { key: 'donation_bank_account_name', label: 'Account Name', type: 'text', placeholder: 'LIFTED TO LIFT' },
      { key: 'donation_bank_account_number', label: 'Account Number', type: 'text', placeholder: 'e.g. 0123456789' },
      { key: 'donation_bank_swift', label: 'SWIFT / BIC Code (for international donors)', type: 'text', placeholder: 'e.g. EQBLKENA' },
    ],
  },
  {
    title: 'International / PayPal',
    icon: Globe,
    fields: [
      { key: 'donation_paypal_link', label: 'PayPal.me Link or Email', type: 'text', placeholder: 'https://paypal.me/liftedtolift or donate@liftedtolift.org' },
    ],
  },
]

export default function AdminDonations() {
  const qc = useQueryClient()
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const val = (key: string) => form[key] ?? (settings as Record<string, string>)[key] ?? ''
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
      toast.success('Saved!')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-[var(--navy)]">Donation Page</h2>
            <p className="text-gray-500 text-sm mt-1">Configure the payment details shown to donors on the public donation page.</p>
          </div>
          <a
            href="/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--gold)] hover:underline"
          >
            <ExternalLink size={13} /> Preview Page
          </a>
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
            </div>
            <button
              onClick={() => handleSaveGroup(title, fields)}
              disabled={saving === title}
              className="mt-5 btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving === title
                ? <div className="w-4 h-4 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" />
                : <Save size={15} />}
              Save {title}
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
