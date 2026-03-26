'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings } from '@/lib/api'
import { MapPin, Phone, Mail, Heart } from 'lucide-react'
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon, LinkedinIcon } from '@/components/ui/SocialIcons'

export default function Footer() {
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  return (
    <footer className="bg-[var(--navy-dark)] text-gray-300">
      {/* CTA Band */}
      <div className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-[var(--navy-dark)] mb-3">
            Join Us in Lifting Lives
          </h2>
          <p className="text-[var(--navy)] font-medium mb-6 text-lg">
            Together, we can create a legacy of transformed individuals lifting others.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[var(--navy-dark)] text-white font-bold px-8 py-3 rounded-full hover:bg-[var(--navy)] transition-all hover:scale-105 shadow-lg"
          >
            Partner With Us
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center">
                <span className="text-[var(--navy-dark)] font-black text-sm">L2L</span>
              </div>
              <div>
                <div className="text-white font-black text-lg">LIFTED TO LIFT</div>
                <div className="text-[var(--gold)] text-xs tracking-widest uppercase">Blessed to be a blessing</div>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              {settings.footer_text || 'Dedicated to lifting lives and building a legacy of hope across communities in Kenya and beyond.'}
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: FacebookIcon, url: settings.facebook_url, label: 'Facebook' },
                { icon: TwitterIcon, url: settings.twitter_url, label: 'Twitter' },
                { icon: InstagramIcon, url: settings.instagram_url, label: 'Instagram' },
                { icon: YoutubeIcon, url: settings.youtube_url, label: 'YouTube' },
                { icon: LinkedinIcon, url: settings.linkedin_url, label: 'LinkedIn' },
              ].map(({ icon: Icon, url, label }) => (
                url && url !== '#' ? (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[var(--gold)] hover:border-[var(--gold)] hover:text-[var(--navy-dark)] transition-all"
                  >
                    <Icon size={16} />
                  </a>
                ) : (
                  <span
                    key={label}
                    className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-600 cursor-default"
                  >
                    <Icon size={16} />
                  </span>
                )
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about' },
                { label: 'Our Pillars', href: '/programs' },
                { label: 'Gallery', href: '/gallery' },
                { label: 'News & Stories', href: '/news' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-[var(--gold)] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--gold)] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">
                  {settings.address_line1 || 'P.O. Box XXXX'}<br />
                  {settings.address_line2 || 'Nairobi, Kenya'}
                </span>
              </li>
              {settings.phone_primary && settings.phone_primary !== '+254 XXX XXX XXX' && (
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-[var(--gold)] shrink-0" />
                  <a href={`tel:${settings.phone_primary}`} className="text-sm text-gray-400 hover:text-[var(--gold)] transition-colors">
                    {settings.phone_primary}
                  </a>
                </li>
              )}
              {settings.email_primary && (
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-[var(--gold)] shrink-0" />
                  <a href={`mailto:${settings.email_primary}`} className="text-sm text-gray-400 hover:text-[var(--gold)] transition-colors">
                    {settings.email_primary}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LIFTED TO LIFT. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1.5">
            Made with <Heart size={13} className="text-[var(--gold)] fill-[var(--gold)]" /> for communities in Kenya
          </p>
        </div>
      </div>
    </footer>
  )
}
