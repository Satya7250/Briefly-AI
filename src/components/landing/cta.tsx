import Link from "next/link"

export default function CTA() {
  return (
    <section className="py-32 border-t border-black/[0.06] relative bg-white overflow-hidden text-center select-none z-10">
      {/* Glow */}
      <div className="absolute inset-0 bg-[#6D5EF8]/[0.03] rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10 flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          Ready to reclaim 10+ hours every week?
        </h2>
        <p className="text-neutral-500 text-sm sm:text-base max-w-md">
          Unlock executive focus and speed through notifications in minutes.
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <Link 
            href="/sign-up" 
            className="h-12 inline-flex items-center justify-center px-8 rounded-xl text-sm font-semibold bg-[#6D5EF8] hover:bg-[#5b4fe0] text-white shadow-[0_5px_22px_-4px_rgba(109,94,248,0.3)] transition-all active:scale-98 cursor-pointer"
          >
            Get Started Free
          </Link>
          <Link 
            href="/sign-in" 
            className="h-12 inline-flex items-center justify-center px-6 rounded-xl text-sm font-semibold border border-black/[0.08] bg-white hover:bg-neutral-50 text-neutral-700 transition-all cursor-pointer shadow-xs"
          >
            Sign In to Account
          </Link>
        </div>

        <p className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-widest">Secure OAuth integration • Free 14-day trial • No CC required</p>
      </div>
    </section>
  )
}
