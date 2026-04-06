'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings, fetchPageContent } from '@/lib/api'
import { MapPin, Phone, Mail, Send } from 'lucide-react'
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon, LinkedinIcon } from '@/components/ui/SocialIcons'
import PageHero from '@/components/ui/PageHero'
import toast from 'react-hot-toast'
import { submitContactMessage } from '@/lib/api'

export default function ContactContent() {
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: content = {} } = useQuery({ queryKey: ['content', 'contact'], queryFn: () => fetchPageContent('contact') })

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitContactMessage(form)
      toast.success("Thank you! We'll be in touch soon.")
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const socials = [
    { icon: FacebookIcon, url: settings.facebook_url, label: 'Facebook' },
    { icon: TwitterIcon, url: settings.twitter_url, label: 'Twitter' },
    { icon: InstagramIcon, url: settings.instagram_url, label: 'Instagram' },
    { icon: YoutubeIcon, url: settings.youtube_url, label: 'YouTube' },
    { icon: LinkedinIcon, url: settings.linkedin_url, label: 'LinkedIn' },
  ].filter((s) => s.url && s.url !== '#')

  return (
    <>
      <PageHero
        title={content?.header?.title || 'Get In Touch'}
        subtitle={content?.header?.subtitle || "We'd love to hear from you. Reach out to learn more or get involved."}
        breadcrumb="Contact"
      />

      <section className="py-24 bg-[var(--cream)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-[var(--navy)] mb-6">Contact Information</h2>

                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-[var(--gold-pale)] flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-[var(--gold)]" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--navy)] text-sm">Address</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {settings.address_line1 || 'P.O. Box XXXX'}<br />
                        {settings.address_line2 || 'Nairobi, Kenya'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-[var(--gold-pale)] flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-[var(--gold)]" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--navy)] text-sm">Phone</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {settings.phone_primary || '+254 XXX XXX XXX'}
                        {settings.phone_secondary && <><br />{settings.phone_secondary}</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-[var(--gold-pale)] flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-[var(--gold)]" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--navy)] text-sm">Email</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {settings.email_primary || 'info@liftedtolift.org'}
                        {settings.email_secondary && <><br />{settings.email_secondary}</>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social links */}
              {socials.length > 0 && (
                <div>
                  <h3 className="font-bold text-[var(--navy)] text-sm uppercase tracking-wider mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    {socials.map(({ icon: Icon, url, label }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-10 h-10 rounded-full border-2 border-[var(--gold)] text-[var(--gold)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-white transition-all"
                      >
                        <Icon size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Map placeholder */}
              <div className="rounded-2xl overflow-hidden shadow-md h-48 bg-[var(--navy)] flex items-center justify-center relative">
                <div className="text-center text-white/60">
                  <MapPin size={32} className="mx-auto mb-2 text-[var(--gold)]" />
                  <p className="text-sm">{settings.location_city || 'Nairobi'}, {settings.location_country || 'Kenya'}</p>
                  <p className="text-xs mt-1">Map will display here</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-black text-[var(--navy)] mb-2">Send Us a Message</h2>
                <p className="text-gray-500 text-sm mb-8">Fill in the form below and we&apos;ll get back to you within 24–48 hours.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-[var(--navy)] block mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all text-sm"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[var(--navy)] block mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all text-sm"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-2">Subject</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all text-sm bg-white"
                    >
                      <option value="">Select a subject</option>
                      <option value="partnership">Partnership Enquiry</option>
                      <option value="volunteering">Volunteering</option>
                      <option value="donation">Donation</option>
                      <option value="scholarship">Scholarship Enquiry</option>
                      <option value="general">General Enquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[var(--navy)] block mb-2">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all text-sm resize-none"
                      placeholder="Tell us how you'd like to get involved or any questions you may have..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
