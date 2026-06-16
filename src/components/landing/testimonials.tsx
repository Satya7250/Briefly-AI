import CountUpNumber from "./count-up"

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

function OpenAIIconSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19.61 9.77a5.55 5.55 0 0 0-.58-3.08 5.75 5.75 0 0 0-2.43-2.43 5.56 5.56 0 0 0-3.08-.58 5.48 5.48 0 0 0-4.22 2c-.31.39-.58.82-.78 1.28L8 6.43a4 4 0 0 1 2.37-.8 4 4 0 0 1 3.5 2.1 4 4 0 0 1 .4 4.09l-5.69 3.28a1.5 1.5 0 0 0-.55.55 1.48 1.48 0 0 0-.2 1.15c.08.38.27.73.55 1l2.45-1.41a2.5 2.5 0 0 1-1.25 2.17 2.45 2.45 0 0 1-2.5 0L4.54 17A4 4 0 0 1 2.5 13.5a4 4 0 0 1 2-3.46l.54-.31a5.61 5.61 0 0 0 .58 3.08 5.75 5.75 0 0 0 2.43 2.43 5.56 5.56 0 0 0 3.08.58 5.48 5.48 0 0 0 4.22-2l.54-.31a4 4 0 0 1 .55-.55 4 4 0 0 1-.22-4.09z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CorsairIconSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20c0-5 6-7 10-9-4-2-7-5-7-8 5 2 8 7 11 16-4-1-10 0-14 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Testimonials() {
  return (
    <>
      {/* Social Proof & Integration Logos */}
      <section className="py-20 border-b-2 border-dashed border-[#2B2B2B]/20 relative bg-[#FBF2DE] z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Side: Counter Metrics */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-6 text-left">
              <div className="space-y-1">
                <div className="font-hand text-3xl font-bold text-[#8C7CF0] tracking-tight">
                  <CountUpNumber value={10000} suffix="+" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2B2B2B]/40">Emails Parsed</p>
              </div>

              <div className="space-y-1">
                <div className="font-hand text-3xl font-bold text-[#6FA8D8] tracking-tight">
                  <CountUpNumber value={500} suffix="+" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2B2B2B]/40">Hours Saved</p>
              </div>

              <div className="space-y-1">
                <div className="font-hand text-3xl font-bold text-[#7FB88B] tracking-tight">
                  <CountUpNumber value={99} suffix="%" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2B2B2B]/40">Review Speed</p>
              </div>
            </div>

            {/* Right Side: Integration Logos */}
            <div className="lg:col-span-7 flex flex-wrap items-center justify-start lg:justify-end gap-10 lg:gap-12 select-none">
              <div className="flex items-center gap-2.5 text-[#2B2B2B]/50 hover:text-[#C9536B] transition-colors duration-300 cursor-pointer">
                <GmailIconSvg className="size-7" />
                <span className="font-hand text-base font-semibold tracking-tight">Gmail</span>
              </div>

              <div className="flex items-center gap-2.5 text-[#2B2B2B]/50 hover:text-[#3E7CA6] transition-colors duration-300 cursor-pointer">
                <GoogleCalendarIconSvg className="size-7" />
                <span className="font-hand text-base font-semibold tracking-tight">Calendar</span>
              </div>

              <div className="flex items-center gap-2.5 text-[#2B2B2B]/50 hover:text-[#10a37f] transition-colors duration-300 cursor-pointer">
                <OpenAIIconSvg className="size-7" />
                <span className="font-hand text-base font-semibold tracking-tight">OpenAI</span>
              </div>

              <div className="flex items-center gap-2.5 text-[#2B2B2B]/50 hover:text-[#E2725B] transition-colors duration-300 cursor-pointer">
                <CorsairIconSvg className="size-7" />
                <span className="font-hand text-base font-semibold tracking-tight">Corsair</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Section: Sketchbook Cards */}
      <section className="py-28 relative overflow-hidden z-10 bg-[#FBF2DE]/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20 select-none">
            <h2 className="font-hand text-4xl sm:text-5xl font-bold tracking-tight text-[#2B2B2B]">Used by Product Leaders</h2>
            <p className="text-[#2B2B2B]/60 text-base">See how Briefly AI empowers executive operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Testimonial 1 */}
            <div className="rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-8 text-left shadow-[4px_4px_0_0_rgba(43,43,43,0.85)] flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0_0_rgba(43,43,43,0.85)] -rotate-[0.3deg]">
              <span className="font-hand text-3xl text-[#2B2B2B]/20 leading-none">"</span>
              <p className="text-base leading-relaxed text-[#2B2B2B]/80 font-medium">
                Briefly has completely changed how I start my day. I review my briefings in 2 minutes instead of digging through 50 emails.
              </p>
              <div className="mt-8 flex items-center gap-3.5 border-t-2 border-dashed border-[#2B2B2B]/15 pt-4 select-none">
                <div className="w-9 h-9 rounded-full border-2 border-[#2B2B2B] bg-[#8C7CF0] flex items-center justify-center text-xs font-bold text-[#2B2B2B]">
                  SK
                </div>
                <div>
                  <span className="font-hand font-bold text-sm text-[#2B2B2B] block">Sarah K.</span>
                  <span className="text-[10px] font-bold text-[#2B2B2B]/40 block uppercase">VP of Product</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-8 text-left shadow-[4px_4px_0_0_rgba(43,43,43,0.85)] flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0_0_rgba(43,43,43,0.85)] rotate-[0.3deg]">
              <span className="font-hand text-3xl text-[#2B2B2B]/20 leading-none">"</span>
              <p className="text-base leading-relaxed text-[#2B2B2B]/80 font-medium">
                The proactive next actions are game-changing. It drafted a response to a critical client email before I even opened Outlook.
              </p>
              <div className="mt-8 flex items-center gap-3.5 border-t-2 border-dashed border-[#2B2B2B]/15 pt-4 select-none">
                <div className="w-9 h-9 rounded-full border-2 border-[#2B2B2B] bg-[#6FA8D8] flex items-center justify-center text-xs font-bold text-[#2B2B2B]">
                  DM
                </div>
                <div>
                  <span className="font-hand font-bold text-sm text-[#2B2B2B] block">David M.</span>
                  <span className="text-[10px] font-bold text-[#2B2B2B]/40 block uppercase">SaaS Founder</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-8 text-left shadow-[4px_4px_0_0_rgba(43,43,43,0.85)] flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0_0_rgba(43,43,43,0.85)] -rotate-[0.3deg]">
              <span className="font-hand text-3xl text-[#2B2B2B]/20 leading-none">"</span>
              <p className="text-base leading-relaxed text-[#2B2B2B]/80 font-medium">
                An absolute must-have for executives. The calendar prep notes save me hours of meeting prep every single week.
              </p>
              <div className="mt-8 flex items-center gap-3.5 border-t-2 border-dashed border-[#2B2B2B]/15 pt-4 select-none">
                <div className="w-9 h-9 rounded-full border-2 border-[#2B2B2B] bg-[#E2725B] flex items-center justify-center text-xs font-bold text-[#2B2B2B]">
                  ER
                </div>
                <div>
                  <span className="font-hand font-bold text-sm text-[#2B2B2B] block">Elena R.</span>
                  <span className="text-[10px] font-bold text-[#2B2B2B]/40 block uppercase">Chief of Staff</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}