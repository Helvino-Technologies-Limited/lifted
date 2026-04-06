'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery } from '@tanstack/react-query'
import { fetchTeam, fetchMedia, fetchNews, fetchInstitutions, fetchUnreadCount } from '@/lib/api'
import Link from 'next/link'
import { Users, Image as ImageIcon, Newspaper, Building2, ArrowRight, Settings, FileText, Globe, Inbox } from 'lucide-react'

function StatCard({ icon: Icon, label, value, href, color }: {
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
  value: number
  href: string
  color: string
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={22} className="text-white" />
        </div>
        <ArrowRight size={16} className="text-gray-300 group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all" />
      </div>
      <div className="text-3xl font-black text-[var(--navy)]">{value}</div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
    </Link>
  )
}

const QUICK_LINKS = [
  { label: 'Hero & Branding', desc: 'Update logo, background video, tagline', href: '/admin/hero', icon: Globe },
  { label: 'Page Content', desc: 'Edit all page text and sections', href: '/admin/content', icon: FileText },
  { label: 'Media Library', desc: 'Upload photos and videos', href: '/admin/media', icon: ImageIcon },
  { label: 'Contact & Settings', desc: 'Update contact info and social links', href: '/admin/settings', icon: Settings },
]

export default function AdminDashboard() {
  const { data: team = [] } = useQuery({ queryKey: ['team'], queryFn: fetchTeam })
  const { data: media = [] } = useQuery({ queryKey: ['media', 'all'], queryFn: () => fetchMedia() })
  const { data: news = [] } = useQuery({ queryKey: ['news', 'published'], queryFn: () => fetchNews() })
  const { data: institutions = [] } = useQuery({ queryKey: ['institutions'], queryFn: fetchInstitutions })
  const { data: unreadData } = useQuery({ queryKey: ['messages', 'unread-count'], queryFn: fetchUnreadCount })

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-[var(--navy)] to-[var(--navy-light)] rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-black mb-1">Welcome back, Admin</h2>
          <p className="text-gray-300 text-sm">Manage the LIFTED TO LIFT website content and media.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Team Members" value={team.length} href="/admin/team" color="bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)]" />
          <StatCard icon={ImageIcon} label="Media Files" value={media.length} href="/admin/media" color="bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)]" />
          <StatCard icon={Newspaper} label="News Articles" value={news.length} href="/admin/news" color="bg-gradient-to-br from-[var(--green)] to-emerald-400" />
          <StatCard icon={Building2} label="Institutions" value={institutions.length} href="/admin/institutions" color="bg-gradient-to-br from-[#6b3fa0] to-[#8a5cbf]" />
          <StatCard icon={Inbox} label="Unread Messages" value={unreadData?.count ?? 0} href="/admin/messages" color="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]" />
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="font-black text-[var(--navy)] text-lg mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map(({ label, desc, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[var(--gold)]/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--gold-pale)] flex items-center justify-center mb-3 group-hover:bg-[var(--gold)] transition-colors">
                  <Icon size={18} className="text-[var(--gold)] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-[var(--navy)] text-sm mb-1">{label}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[var(--gold-pale)] border border-[var(--gold)]/30 rounded-2xl p-6">
          <h3 className="font-black text-[var(--navy)] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--gold)] flex items-center justify-center text-white text-[10px] font-black">!</span>
            Getting Started
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[var(--gold)] font-bold">1.</span>
              Go to <Link href="/admin/hero" className="text-[var(--gold)] font-semibold hover:underline">Hero & Branding</Link> to upload your logo and background video.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--gold)] font-bold">2.</span>
              Visit <Link href="/admin/settings" className="text-[var(--gold)] font-semibold hover:underline">Contact & Settings</Link> to add your phone number, email, and address.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--gold)] font-bold">3.</span>
              Upload photos to the <Link href="/admin/media" className="text-[var(--gold)] font-semibold hover:underline">Media Library</Link> for the gallery and page backgrounds.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--gold)] font-bold">4.</span>
              Add institutions in the <Link href="/admin/institutions" className="text-[var(--gold)] font-semibold hover:underline">Institutions</Link> section (shown as the tree under Pillar 4).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--gold)] font-bold">5.</span>
              Edit any page text via <Link href="/admin/content" className="text-[var(--gold)] font-semibold hover:underline">Page Content</Link>.
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
