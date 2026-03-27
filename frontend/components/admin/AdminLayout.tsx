'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { isAuthenticated, removeToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, FileText, Image as ImageIcon, Users,
  Settings, LogOut, Menu, X, Building2, Newspaper,
  ExternalLink, ChevronRight, Globe, BookOpen, Heart
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Hero & Branding', href: '/admin/hero', icon: Globe },
  { label: 'Page Content', href: '/admin/content', icon: FileText },
  { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { label: 'Team Members', href: '/admin/team', icon: Users },
  { label: 'Institutions', href: '/admin/institutions', icon: Building2 },
  { label: 'News & Stories', href: '/admin/news', icon: Newspaper },
  { label: 'Newsletters', href: '/admin/newsletters', icon: BookOpen },
  { label: 'Donation Page', href: '/admin/donations', icon: Heart },
  { label: 'Contact & Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.replace('/admin/login')
    }
  }, [router])

  if (!mounted) return null

  const handleLogout = () => {
    removeToken()
    toast.success('Signed out successfully.')
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 admin-sidebar z-40 flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center">
              <span className="text-[var(--navy-dark)] font-black text-xs">L2L</span>
            </div>
            <div>
              <div className="text-white font-black text-sm leading-tight">LIFTED TO LIFT</div>
              <div className="text-[var(--gold)] text-[10px] font-semibold uppercase tracking-wider">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 mx-2 rounded-xl text-sm font-semibold transition-all group',
                  active
                    ? 'bg-[var(--gold)] text-[var(--navy-dark)] shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
          >
            <ExternalLink size={14} />
            View Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="font-black text-[var(--navy)] text-sm md:text-base">
                {NAV_ITEMS.find((n) => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Admin'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center">
              <span className="text-[var(--navy-dark)] font-black text-xs">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
