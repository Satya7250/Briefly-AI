import { Logo } from "@/components/common/logo"
import { SparklesIcon } from "lucide-react"

// Styled SVG Icons for Integrations
function GmailIconSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function GoogleCalendarIconSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  )
}

export default function Timeline() {
  return (
    <section id="flow" className="py-24 border-y border-black/[0.06] relative bg-white/40 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-20 select-none">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">How It Works</h2>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">Briefly AI seamlessly integrates into your existing daily workspace.</p>
        </div>

        <div className="relative">
          {/* Animated Horizontal Connection Line for Desktop (Curving Thread via CSS keyframes) */}
          <div className="absolute top-[48px] left-[12.5%] right-[12.5%] hidden lg:block h-[100px] -translate-y-1/2 z-0 pointer-events-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="thread-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6D5EF8" stopOpacity="0" />
                  <stop offset="50%" stopColor="#6D5EF8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#6D5EF8" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Background dashed track */}
              <path
                d="M 0,50 C 100,10 200,90 266.6,50 C 366.6,10 466.6,90 533.3,50 C 633.3,10 733.3,90 800,50"
                fill="none"
                stroke="rgba(109,94,248,0.12)"
                strokeWidth="2.5"
                strokeDasharray="8 8"
              />
              {/* Flowing overlay thread via CSS keyframes flow */}
              <path
                d="M 0,50 C 100,10 200,90 266.6,50 C 366.6,10 466.6,90 533.3,50 C 633.3,10 733.3,90 800,50"
                fill="none"
                stroke="url(#thread-gradient)"
                strokeWidth="3.5"
                strokeDasharray="60 180"
                strokeLinecap="round"
                className="animate-thread-flow-desktop"
              />
            </svg>
          </div>

          {/* Animated Vertical Connection Line for Mobile/Tablet via CSS keyframes */}
          <div className="absolute top-[48px] bottom-[48px] left-1/2 -translate-x-1/2 block lg:hidden w-0.5 z-0 pointer-events-none">
            <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="vertical-thread-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6D5EF8" stopOpacity="0" />
                  <stop offset="50%" stopColor="#6D5EF8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#6D5EF8" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Background dashed track */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="rgba(109,94,248,0.12)"
                strokeWidth="2.5"
                strokeDasharray="8 8"
              />
              {/* Flowing overlay thread via CSS keyframes flow */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="url(#vertical-thread-gradient)"
                strokeWidth="3.5"
                strokeDasharray="60 180"
                strokeLinecap="round"
                className="animate-thread-flow-mobile"
              />
            </svg>
          </div>

          {/* Timeline Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            
            {/* Step 1: Gmail */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl border border-red-500/20 bg-red-500/[0.02] flex items-center justify-center text-red-500 group-hover:scale-105 group-hover:border-red-500/40 transition-all duration-300 shadow-xs">
                <GmailIconSvg className="size-10" />
              </div>
              <div className="mt-6 space-y-1.5 max-w-[220px]">
                <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">01 / INPUT</span>
                <h4 className="font-bold text-base text-neutral-900">Gmail</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Authenticate securely using Google OAuth to sync your inbox.
                </p>
              </div>
            </div>

            {/* Step 2: Briefly AI */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl border border-[#6D5EF8]/30 bg-[#6D5EF8]/[0.04] flex items-center justify-center text-[#6D5EF8] scale-105 shadow-md group-hover:scale-110 group-hover:border-[#6D5EF8]/50 transition-all duration-300">
                <Logo width={48} height={48} />
              </div>
              <div className="mt-6 space-y-1.5 max-w-[220px]">
                <span className="text-[10px] font-extrabold text-[#6D5EF8] uppercase tracking-widest">02 / CORE</span>
                <h4 className="font-bold text-base text-neutral-900">Briefly AI</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Our parser filters noise, detects priorities and extracts action points.
                </p>
              </div>
            </div>

            {/* Step 3: Calendar */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl border border-blue-500/20 bg-blue-500/[0.02] flex items-center justify-center text-blue-500 group-hover:scale-105 group-hover:border-blue-500/40 transition-all duration-300 shadow-xs">
                <GoogleCalendarIconSvg className="size-10" />
              </div>
              <div className="mt-6 space-y-1.5 max-w-[220px]">
                <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest">03 / CONTEXT</span>
                <h4 className="font-bold text-base text-neutral-900">Calendar</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Sync Google Calendar accounts to link schedules and contextual alerts.
                </p>
              </div>
            </div>

            {/* Step 4: Actions */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] flex items-center justify-center text-emerald-500 group-hover:scale-105 group-hover:border-emerald-500/40 transition-all duration-300 shadow-xs">
                <SparklesIcon className="size-10" />
              </div>
              <div className="mt-6 space-y-1.5 max-w-[220px]">
                <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">04 / OUTPUT</span>
                <h4 className="font-bold text-base text-neutral-900">Actions</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Receive actionable daily summaries and draft replies instantly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
