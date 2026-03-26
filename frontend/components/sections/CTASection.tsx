import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 bg-[var(--navy)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--gold)] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold-light)] text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
          <Mail size={14} />
          Stay Connected
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          Ready to Make a<br />
          <span className="text-gradient">Difference?</span>
        </h2>
        <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Join us in our mission to lift lives, empower communities, and build a legacy of transformed individuals lifting others.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-primary px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 group text-base">
            Get Involved Today
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/about" className="btn-outline-white px-8 py-4 rounded-full font-bold text-base">
            Learn Our Story
          </Link>
        </div>

        <p className="mt-10 text-gray-500 text-sm italic">
          &ldquo;Blessed to be a blessing — every action, no matter how small, makes a difference.&rdquo;
        </p>
      </div>
    </section>
  )
}
