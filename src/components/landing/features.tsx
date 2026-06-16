import { CheckCircle2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Features() {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center space-y-4 mb-16 select-none">
        <h2 className="font-hand text-4xl sm:text-5xl font-bold tracking-tight text-[#2B2B2B]">Inbox & Schedule Intelligence</h2>
        <p className="text-[#2B2B2B]/60 text-base max-w-lg mx-auto">Four modules built for high-growth operations ↓</p>
        <div className="flex justify-center pt-2">
          <svg width="240" height="14" viewBox="0 0 240 14" fill="none">
            <path d="M2 9C50 2 120 2 150 7C180 12 220 12 238 4" stroke="#F2B33D" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Card 1: AI Briefings */}
        <div className="lg:col-span-7 relative rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0_0_rgba(43,43,43,0.9)] shadow-[4px_4px_0_0_rgba(43,43,43,0.9)] overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="w-11 h-11 rounded-xl border-2 border-[#2B2B2B] bg-[#F6D2DE] flex items-center justify-center mb-6 text-lg select-none">
              🧠
            </div>
            <h3 className="font-hand text-2xl font-bold text-[#2B2B2B] mb-2.5">AI Briefings</h3>
            <p className="text-[#2B2B2B]/60 text-sm leading-relaxed max-w-md">
              Receive premium personalized briefings summarizing critical actions, follow-ups, and calendar timelines at the start of your day.
            </p>
          </div>

          {/* Simulated UI Mockup inside card */}
          <div className="mt-8 border-2 border-dashed border-[#2B2B2B]/25 bg-[#FBF2DE]/60 rounded-xl p-4 space-y-2.5 select-none relative z-10">
            <span className="text-[10px] font-bold text-[#2B2B2B]/40 uppercase tracking-wide">Daily Briefing Summary</span>
            <div className="flex items-center gap-2.5 bg-[#FFF8E7] p-2 rounded-lg border-2 border-[#2B2B2B]/15">
              <CheckCircle2Icon className="size-4 text-[#7FB88B] shrink-0" />
              <span className="text-sm font-semibold text-[#2B2B2B]/80">Approve contract with legal team</span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#FFF8E7] p-2 rounded-lg border-2 border-[#2B2B2B]/15">
              <CheckCircle2Icon className="size-4 text-[#7FB88B] shrink-0" />
              <span className="text-sm font-semibold text-[#2B2B2B]/80">Follow up with investor on pitch deck</span>
            </div>
          </div>
        </div>

        {/* Card 2: Inbox Intelligence */}
        <div className="lg:col-span-5 relative rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0_0_rgba(43,43,43,0.9)] shadow-[4px_4px_0_0_rgba(43,43,43,0.9)] overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="w-11 h-11 rounded-xl border-2 border-[#2B2B2B] bg-[#F2B9AC] flex items-center justify-center mb-6 text-lg select-none">
              📬
            </div>
            <h3 className="font-hand text-2xl font-bold text-[#2B2B2B] mb-2.5">Inbox Intelligence</h3>
            <p className="text-[#2B2B2B]/60 text-sm leading-relaxed">
              Automatically identify important senders, classify incoming message priorities, and extract actions so you never miss a beat.
            </p>
          </div>

          {/* Simulated UI Mockup inside card */}
          <div className="mt-8 border-2 border-dashed border-[#2B2B2B]/25 bg-[#FBF2DE]/60 rounded-xl p-4 select-none relative z-10 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#2B2B2B]/40 uppercase tracking-wide">AI Classification Feed</span>
            <div className="flex items-center justify-between bg-[#FFF8E7] p-2 rounded-lg border-2 border-[#2B2B2B]/15 gap-2">
              <span className="text-sm font-bold text-[#2B2B2B]/80 truncate">Vercel Deployment</span>
              <Badge className="bg-[#E2725B]/15 text-[#C9536B] border-2 border-[#C9536B]/30 font-bold text-[10px] px-1.5 py-0">PRIORITY</Badge>
            </div>
          </div>
        </div>

        {/* Card 3: Calendar Intelligence */}
        <div className="lg:col-span-5 relative rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0_0_rgba(43,43,43,0.9)] shadow-[4px_4px_0_0_rgba(43,43,43,0.9)] overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="w-11 h-11 rounded-xl border-2 border-[#2B2B2B] bg-[#CFE3F2] flex items-center justify-center mb-6 text-lg select-none">
              📅
            </div>
            <h3 className="font-hand text-2xl font-bold text-[#2B2B2B] mb-2.5">Calendar Intelligence</h3>
            <p className="text-[#2B2B2B]/60 text-sm leading-relaxed">
              Consolidate daily meetings contextually. Automatically generates context highlights and preparation notes ahead of schedule.
            </p>
          </div>

          {/* Simulated UI Mockup inside card */}
          <div className="mt-8 border-2 border-dashed border-[#2B2B2B]/25 bg-[#FBF2DE]/60 rounded-xl p-4 select-none relative z-10 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#2B2B2B]/40 uppercase tracking-wide">Agenda Context Card</span>
            <div className="bg-[#FFF8E7] p-2 rounded-lg border-2 border-[#2B2B2B]/15 text-left">
              <span className="text-xs font-bold text-[#6FA8D8] block">Sync with Design</span>
              <p className="text-[11px] text-[#2B2B2B]/60 mt-0.5">Review Arc Browser branding feedback files.</p>
            </div>
          </div>
        </div>

        {/* Card 4: Action Recommendations */}
        <div className="lg:col-span-7 relative rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0_0_rgba(43,43,43,0.9)] shadow-[4px_4px_0_0_rgba(43,43,43,0.9)] overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="w-11 h-11 rounded-xl border-2 border-[#2B2B2B] bg-[#FCEAC1] flex items-center justify-center mb-6 text-lg select-none">
              ⚡
            </div>
            <h3 className="font-hand text-2xl font-bold text-[#2B2B2B] mb-2.5">Action Recommendations</h3>
            <p className="text-[#2B2B2B]/60 text-sm leading-relaxed max-w-md">
              Know exactly what requires response, what action steps to execute next, and generate drafted responses contextually.
            </p>
          </div>

          {/* Simulated UI Mockup inside card */}
          <div className="mt-8 border-2 border-dashed border-[#2B2B2B]/25 bg-[#FBF2DE]/60 rounded-xl p-4 select-none relative z-10 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#2B2B2B]/40 uppercase tracking-wide">Quick Action Draft Response</span>
            <div className="bg-[#FFF8E7] p-3 rounded-lg border-2 border-[#2B2B2B]/15 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-[#2B2B2B]/80 block truncate">"Sure, let's reschedule this to Friday at 2:00 PM."</span>
              <button className="bg-[#F2B33D] hover:bg-[#e0a22e] text-[#2B2B2B] text-[10px] font-bold py-1.5 px-3.5 rounded-lg border-2 border-[#2B2B2B] shrink-0 transition-colors">
                Generate Draft
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}