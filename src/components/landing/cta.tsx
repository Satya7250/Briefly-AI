import Link from "next/link"

export default function CTA() {
  return (
    <section className="py-32 border-t-2 border-dashed border-[#2B2B2B]/20 relative bg-[#FFF8E7] overflow-hidden text-center select-none z-10">
      {/* Glow */}
      <div className="absolute inset-0 bg-[#F2B33D]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10 flex flex-col items-center">
        {/* Dotted progress markers */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#2B2B2B]/40" />
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#2B2B2B]/40" />
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#2B2B2B]/40" />
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#2B2B2B]/40" />
        </div>

        <h2 className="font-hand text-5xl sm:text-6xl font-bold tracking-tight text-[#2B2B2B] leading-tight">
          Ready to reclaim 10+ hours every week? ✨
        </h2>
        <p className="text-[#2B2B2B]/60 text-base max-w-md">
          Unlock executive focus and speed through notifications in minutes.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <Link
            href="/sign-up"
            className="h-12 inline-flex items-center justify-center px-8 rounded-xl border-2 border-[#2B2B2B] font-hand text-base font-bold bg-[#F2B33D] text-[#2B2B2B] shadow-[4px_4px_0_0_rgba(43,43,43,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_6px_0_0_rgba(43,43,43,0.9)] active:translate-y-0 active:shadow-[1px_1px_0_0_rgba(43,43,43,0.9)]"
          >
            Get Started Free
          </Link>
          <Link
            href="/sign-in"
            className="h-12 inline-flex items-center justify-center px-6 rounded-xl border-2 border-[#2B2B2B] bg-[#FBF2DE] font-hand text-base font-bold text-[#2B2B2B] shadow-[3px_3px_0_0_rgba(43,43,43,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_5px_0_0_rgba(43,43,43,0.9)] active:translate-y-0 active:shadow-[1px_1px_0_0_rgba(43,43,43,0.9)]"
          >
            Sign In to Account
          </Link>
        </div>

        <p className="text-[11px] font-bold text-[#2B2B2B]/40 uppercase tracking-widest">Secure OAuth integration • Free 14-day trial • No CC required ~</p>

        {/* Hand-drawn star rating */}
        <div className="flex items-center gap-1.5 pt-1 text-[#F2B33D] text-xl">
          <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-[#2B2B2B]/25">★</span>
        </div>
      </div>
    </section>
  )
}