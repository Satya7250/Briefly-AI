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
    <section id="flow" className="py-24 border-y-2 border-dashed border-[#2B2B2B]/20 relative bg-[#FFF8E7]/50 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-20 select-none">
          <h2 className="font-hand text-4xl font-bold tracking-tight text-[#2B2B2B]">How It Works</h2>
          <p className="text-[#2B2B2B]/60 text-sm max-w-md mx-auto">Briefly AI fits right into your daily workspace ~</p>
        </div>

        <div className="relative">
          {/* Dashed Horizontal Connection Line for Desktop */}
          <div className="absolute top-[48px] left-[12.5%] right-[12.5%] hidden lg:block h-[12px] w-3/4 -translate-y-1/2 z-0 pointer-events-none">
            <svg className="w-full h-full overflow-visible" fill="none">
              <defs>
                <marker
                  id="arrow-horizontal"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path
                    d="M 1 1.5 C 3 3.5, 6 4.5, 8.5 5 C 6 5.5, 3 6.5, 1 8.5"
                    stroke="#2B2B2B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </marker>
              </defs>
              <line
                x1="0"
                y1="6"
                x2="100%"
                y2="6"
                stroke="#2B2B2B"
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-thread-flow-desktop"
                markerEnd="url(#arrow-horizontal)"
              />
            </svg>
          </div>

          {/* Dashed Vertical Connection Line for Mobile/Tablet */}
          <div className="absolute top-[48px] bottom-[48px] left-1/2 -translate-x-1/2 block lg:hidden w-[12px] z-0 pointer-events-none">
            <svg className="w-full h-full overflow-visible" fill="none">
              <defs>
                <marker
                  id="arrow-vertical"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path
                    d="M 1 1.5 C 3 3.5, 6 4.5, 8.5 5 C 6 5.5, 3 6.5, 1 8.5"
                    stroke="#2B2B2B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </marker>
              </defs>
              <line
                x1="6"
                y1="0"
                x2="6"
                y2="100%"
                stroke="#2B2B2B"
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-thread-flow-mobile"
                markerEnd="url(#arrow-vertical)"
              />
            </svg>
          </div>

          {/* Timeline Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">

            {/* Step 1: Gmail */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl border-2 border-[#2B2B2B] bg-[#E2725B]/20 flex items-center justify-center text-[#E2725B] group-hover:scale-105 transition-all duration-300 shadow-[3px_3px_0_0_rgba(43,43,43,0.6)]">
                <GmailIconSvg className="size-10" />
              </div>
              <div className="mt-6 space-y-1.5 max-w-[220px]">
                <span className="font-hand text-xs font-bold text-[#E2725B] uppercase tracking-widest">01 / Input</span>
                <h4 className="font-hand font-bold text-lg text-[#2B2B2B]">Gmail</h4>
                <p className="text-sm text-[#2B2B2B]/60 leading-relaxed">
                  Authenticate securely using Google OAuth to sync your inbox.
                </p>
              </div>
            </div>

            {/* Step 2: Briefly AI */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl border-2 border-[#2B2B2B] bg-[#8C7CF0]/20 flex items-center justify-center text-2xl scale-105 group-hover:scale-110 transition-all duration-300 shadow-[4px_4px_0_0_rgba(43,43,43,0.7)]">
                🧠
              </div>
              <div className="mt-6 space-y-1.5 max-w-[220px]">
                <span className="font-hand text-xs font-bold text-[#8C7CF0] uppercase tracking-widest">02 / Core</span>
                <h4 className="font-hand font-bold text-lg text-[#2B2B2B]">Briefly AI</h4>
                <p className="text-sm text-[#2B2B2B]/60 leading-relaxed">
                  Our parser filters noise, detects priorities and extracts action points.
                </p>
              </div>
            </div>

            {/* Step 3: Calendar */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl border-2 border-[#2B2B2B] bg-[#6FA8D8]/20 flex items-center justify-center text-[#6FA8D8] group-hover:scale-105 transition-all duration-300 shadow-[3px_3px_0_0_rgba(43,43,43,0.6)]">
                <GoogleCalendarIconSvg className="size-10" />
              </div>
              <div className="mt-6 space-y-1.5 max-w-[220px]">
                <span className="font-hand text-xs font-bold text-[#6FA8D8] uppercase tracking-widest">03 / Context</span>
                <h4 className="font-hand font-bold text-lg text-[#2B2B2B]">Calendar</h4>
                <p className="text-sm text-[#2B2B2B]/60 leading-relaxed">
                  Sync Google Calendar accounts to link schedules and contextual alerts.
                </p>
              </div>
            </div>

            {/* Step 4: Actions */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl border-2 border-[#2B2B2B] bg-[#7FB88B]/20 flex items-center justify-center text-[#7FB88B] text-2xl group-hover:scale-105 transition-all duration-300 shadow-[3px_3px_0_0_rgba(43,43,43,0.6)]">
                ✨
              </div>
              <div className="mt-6 space-y-1.5 max-w-[220px]">
                <span className="font-hand text-xs font-bold text-[#7FB88B] uppercase tracking-widest">04 / Output</span>
                <h4 className="font-hand font-bold text-lg text-[#2B2B2B]">Actions</h4>
                <p className="text-sm text-[#2B2B2B]/60 leading-relaxed">
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