'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings } from '@/lib/api'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Our Pillars',
    href: '/programs',
    children: [
      { label: 'Educational Equity', href: '/programs#pillar1' },
      { label: 'Youth Empowerment', href: '/programs#pillar2' },
      { label: 'Senior Citizens Welfare', href: '/programs#pillar3' },
      { label: 'Institutional Stewardship', href: '/programs#pillar4' },
      { label: 'Partnerships & Networking', href: '/programs#pillar5' },
    ],
  },
  { label: 'Gallery', href: '/gallery' },
  { label: 'News', href: '/news' },
  {
    label: 'Get Involved',
    href: '/sponsor',
    children: [
      { label: 'Sponsor a Child', href: '/sponsor' },
      { label: 'Upcoming Events', href: '/events' },
      { label: 'Our Needs', href: '/needs' },
      { label: 'Donate', href: '/donate' },
    ],
  },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navBg = scrolled || !isHome
    ? 'bg-white shadow-md text-[var(--navy)]'
    : 'bg-transparent text-white'

  const logoUrl = settings?.hero_logo_url || null

  return (
    <nav className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', navBg)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <Image src={logoUrl} alt="LIFTED TO LIFT" width={52} height={52} className="rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-[var(--navy-dark)] font-black text-sm leading-none text-center">L2L</span>
              </div>
            )}
            <div>
              <div className={cn('font-black text-lg leading-tight tracking-wide', scrolled || !isHome ? 'text-[var(--navy)]' : 'text-white')}>
                LIFTED TO LIFT
              </div>
              <div className={cn('text-xs font-medium tracking-widest uppercase', scrolled || !isHome ? 'text-[var(--gold)]' : 'text-[var(--gold-light)]')}>
                Blessed to be a blessing
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group">
                {link.children ? (
                  <>
                    <button
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all',
                        (pathname.startsWith('/programs') || pathname.startsWith('/sponsor') || pathname.startsWith('/events') || pathname.startsWith('/needs') || pathname.startsWith('/donate')) ? 'text-[var(--gold)]' : '',
                        'hover:text-[var(--gold)]'
                      )}
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.label} <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                    </button>
                    <div
                      className={cn(
                        'absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100',
                        'opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0'
                      )}
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[var(--gold)] hover:bg-[var(--gold-pale)] transition-colors font-medium"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      'px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:text-[var(--gold)]',
                      pathname === link.href && 'text-[var(--gold)]'
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            <Link
              href="/donate"
              className="ml-2 px-5 py-2.5 rounded-full btn-primary text-sm font-bold"
            >
              Donate
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300',
        isOpen ? 'max-h-screen py-4' : 'max-h-0'
      )}>
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          {navLinks.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'block px-4 py-3 rounded-lg font-semibold text-[var(--navy)] hover:bg-[var(--gold-pale)] hover:text-[var(--gold)] transition-colors',
                  pathname === link.href && 'text-[var(--gold)] bg-[var(--gold-pale)]'
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="ml-4 space-y-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-[var(--gold)] hover:bg-[var(--gold-pale)] rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/donate"
            className="block mx-4 mt-3 px-5 py-3 rounded-full btn-primary text-center text-sm font-bold"
            onClick={() => setIsOpen(false)}
          >
            Donate
          </Link>
        </div>
      </div>
    </nav>
  )
}
