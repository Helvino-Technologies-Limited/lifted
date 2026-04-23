'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings, fetchImpactItems } from '@/lib/api'
import PageHero from '@/components/ui/PageHero'
import { Smartphone, Building2, Globe, Copy, Check, Heart } from 'lucide-react'
import { useState } from 'react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded-md text-gray-400 hover:text-[var(--gold)] transition-colors shrink-0"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-black text-[var(--navy)]">{value}</span>
        <CopyButton text={value} />
      </div>
    </div>
  )
}

type ImpactItem = { id: number; amount: string; label: string; display_order: number }

export default function DonateContent() {
  const { data: settings = {} } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: impactItems = [] } = useQuery<ImpactItem[]>({ queryKey: ['impact-items'], queryFn: fetchImpactItems })

  const s = settings as Record<string, string>

  const hasMpesa = s.donation_mpesa_paybill || s.donation_mpesa_till
  const hasBank = s.donation_bank_account_number
  const hasPaypal = s.donation_paypal_link

  const pageTitle = s.donation_page_title || 'Support Our Mission'
  const pageSubtitle = s.donation_page_subtitle || 'Your generosity transforms lives. Every contribution, big or small, helps us lift communities across Kenya.'
  const customMessage = s.donation_page_message

  return (
    <>
      <PageHero
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumb="Donate"
      />

      <section className="py-20 bg-[var(--cream)]">
        <div className="max-w-5xl mx-auto px-4 space-y-16">

          {/* Custom message */}
          {customMessage && (
            <div className="bg-[var(--gold-pale)] border border-[var(--gold)]/20 rounded-2xl p-6 text-center">
              <p className="text-[var(--navy)] font-medium leading-relaxed">{customMessage}</p>
            </div>
          )}

          {/* Impact amounts */}
          {impactItems.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-[var(--navy)] text-center mb-2">Your Impact</h2>
              <p className="text-gray-500 text-center mb-8 text-sm">See what your donation can do</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {impactItems.map(({ id, amount, label }) => (
                  <div key={id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center hover:border-[var(--gold)] hover:shadow-md transition-all">
                    <div className="text-2xl font-black text-[var(--gold)] mb-2">{amount}</div>
                    <div className="text-sm text-gray-500 leading-snug">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment methods */}
          {(hasMpesa || hasBank || hasPaypal) ? (
            <div>
              <h2 className="text-2xl font-black text-[var(--navy)] text-center mb-2">How to Donate</h2>
              <p className="text-gray-500 text-center mb-8 text-sm">Choose any method below. All funds go directly to our programmes.</p>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* M-Pesa */}
                {hasMpesa && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <Smartphone size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-black text-sm">M-Pesa</div>
                        <div className="text-green-100 text-xs">Mobile Money (Kenya)</div>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      {s.donation_mpesa_paybill && (
                        <>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Via Paybill</p>
                          <DetailRow label="Paybill No." value={s.donation_mpesa_paybill} />
                          {s.donation_mpesa_account && <DetailRow label="Account Name" value={s.donation_mpesa_account} />}
                          <DetailRow label="Registered As" value={s.donation_mpesa_name || 'LIFTED TO LIFT'} />
                        </>
                      )}
                      {s.donation_mpesa_till && (
                        <>
                          {s.donation_mpesa_paybill && <div className="my-3 border-t border-gray-100" />}
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Via Buy Goods</p>
                          <DetailRow label="Till No." value={s.donation_mpesa_till} />
                          <DetailRow label="Registered As" value={s.donation_mpesa_name || 'LIFTED TO LIFT'} />
                        </>
                      )}
                      <div className="mt-4 bg-green-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                        <p className="font-semibold text-green-700">Steps:</p>
                        <p>1. Open M-Pesa → Lipa na M-Pesa</p>
                        {s.donation_mpesa_paybill ? <p>2. Select Paybill, enter number above</p> : <p>2. Select Buy Goods, enter till above</p>}
                        <p>3. Enter amount &amp; your M-Pesa PIN</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer */}
                {hasBank && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-[var(--navy)] to-[var(--navy-light)] px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <Building2 size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-black text-sm">Bank Transfer</div>
                        <div className="text-blue-100 text-xs">Local &amp; International</div>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <DetailRow label="Bank" value={s.donation_bank_name} />
                      <DetailRow label="Branch" value={s.donation_bank_branch} />
                      <DetailRow label="Account Name" value={s.donation_bank_account_name} />
                      <DetailRow label="Account No." value={s.donation_bank_account_number} />
                      {s.donation_bank_swift && (
                        <>
                          <div className="my-3 border-t border-gray-100" />
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">International</p>
                          <DetailRow label="SWIFT / BIC" value={s.donation_bank_swift} />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* PayPal / International */}
                {hasPaypal && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <Globe size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-black text-sm">International</div>
                        <div className="text-blue-100 text-xs">PayPal / Online</div>
                      </div>
                    </div>
                    <div className="px-6 py-4 flex flex-col gap-4">
                      <DetailRow label="PayPal / Email" value={s.donation_paypal_link} />
                      {s.donation_paypal_link.startsWith('http') && (
                        <a
                          href={s.donation_paypal_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
                        >
                          Donate via PayPal
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Heart size={36} className="mx-auto text-[var(--gold)] opacity-50 mb-3" />
              <p className="font-black text-[var(--navy)] text-lg mb-1">Payment details coming soon</p>
              <p className="text-gray-400 text-sm">Please check back or contact us directly at</p>
              <a href="mailto:info@liftedtolift.org" className="text-[var(--gold)] font-semibold text-sm hover:underline">
                info@liftedtolift.org
              </a>
            </div>
          )}

          {/* Assurance note */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">All donations go directly to our community programmes in Kenya.</p>
            <p className="text-gray-400 text-sm">
              Questions? <a href="/contact" className="text-[var(--gold)] font-semibold hover:underline">Contact us</a> and we&apos;ll be happy to help.
            </p>
          </div>

        </div>
      </section>
    </>
  )
}
