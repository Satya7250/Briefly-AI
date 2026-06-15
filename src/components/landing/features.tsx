import { CheckCircle2Icon, SparklesIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Features() {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center space-y-4 mb-16 select-none">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">Inbox & Schedule Intelligence</h2>
        <p className="text-neutral-500 text-sm sm:text-base max-w-lg mx-auto">Reclaim your attention span with four modules built specifically for high-growth operations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: AI Briefings (Large Asymmetric - Row 1, Col 1-7) */}
        <div className="lg:col-span-7 group relative rounded-2xl border border-black/[0.08] bg-white p-8 text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-[#6D5EF8]/30 hover:-translate-y-1 overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#6D5EF8]/[0.02] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#6D5EF8]/10 text-[#6D5EF8] flex items-center justify-center mb-6 font-bold text-lg select-none">
              🧠
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2.5">AI Briefings</h3>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-md">
              Receive premium personalized briefings summarizing critical actions, follow-ups, and calendar timelines at the start of your day.
            </p>
          </div>

          {/* Simulated UI Mockup inside card */}
          <div className="mt-8 border border-black/[0.04] bg-neutral-50/50 rounded-xl p-4 space-y-2.5 select-none relative z-10">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Daily Briefing Summary</span>
            <div className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-black/[0.02]">
              <CheckCircle2Icon className="size-4 text-[#6D5EF8] shrink-0" />
              <span className="text-xs font-semibold text-neutral-700">Approve contract with legal team</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-black/[0.02]">
              <CheckCircle2Icon className="size-4 text-[#6D5EF8] shrink-0" />
              <span className="text-xs font-semibold text-neutral-700">Follow up with investor on pitch deck</span>
            </div>
          </div>
        </div>

        {/* Card 2: Inbox Intelligence (Medium Asymmetric - Row 1, Col 8-12) */}
        <div className="lg:col-span-5 group relative rounded-2xl border border-black/[0.08] bg-white p-8 text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-red-500/30 hover:-translate-y-1 overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/[0.01] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6 font-bold text-lg select-none">
              📬
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2.5">Inbox Intelligence</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Automatically identify important senders, classify incoming message priorities, and extract actions so you never miss a beat.
            </p>
          </div>

          {/* Simulated UI Mockup inside card */}
          <div className="mt-8 border border-black/[0.04] bg-neutral-50/50 rounded-xl p-4 select-none relative z-10 flex flex-col gap-2">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">AI Classification Feed</span>
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-black/[0.02] gap-2">
              <span className="text-xs font-bold text-neutral-800 truncate">Vercel Deployment</span>
              <Badge className="bg-red-55 text-red-500 border-none font-bold text-[9px] px-1.5 py-0">PRIORITY</Badge>
            </div>
          </div>
        </div>

        {/* Card 3: Calendar Intelligence (Medium Asymmetric - Row 2, Col 1-5) */}
        <div className="lg:col-span-5 group relative rounded-2xl border border-black/[0.08] bg-white p-8 text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-blue-500/30 hover:-translate-y-1 overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/[0.01] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 font-bold text-lg select-none">
              📅
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2.5">Calendar Intelligence</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Consolidate daily meetings contextually. Automatically generates context highlights and preparation notes ahead of schedule.
            </p>
          </div>

          {/* Simulated UI Mockup inside card */}
          <div className="mt-8 border border-black/[0.04] bg-neutral-50/50 rounded-xl p-4 select-none relative z-10 flex flex-col gap-2">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Agenda Context Card</span>
            <div className="bg-white p-2 rounded-lg border border-black/[0.02] text-left">
              <span className="text-[10px] font-bold text-[#6D5EF8] block">Sync with Design</span>
              <p className="text-[9.5px] text-neutral-500 mt-0.5">Review Arc Browser branding feedback files.</p>
            </div>
          </div>
        </div>

        {/* Card 4: Action Recommendations (Large Asymmetric - Row 2, Col 6-12) */}
        <div className="lg:col-span-7 group relative rounded-2xl border border-black/[0.08] bg-white p-8 text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-amber-500/30 hover:-translate-y-1 overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.01] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 font-bold text-lg select-none">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2.5">Action Recommendations</h3>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-md">
              Know exactly what requires response, what action steps to execute next, and generate drafted responses contextually.
            </p>
          </div>

          {/* Simulated UI Mockup inside card */}
          <div className="mt-8 border border-black/[0.04] bg-neutral-50/50 rounded-xl p-4 select-none relative z-10 flex flex-col gap-2">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Quick Action Draft Response</span>
            <div className="bg-white p-3 rounded-lg border border-black/[0.02] flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-neutral-700 block truncate">"Sure, let's reschedule this to Friday at 2:00 PM."</span>
              <button className="bg-[#6D5EF8] hover:bg-[#5b4fe0] text-white text-[10px] font-bold py-1 px-3.5 rounded-lg shrink-0 transition-colors shadow-xs">
                Generate Draft
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
