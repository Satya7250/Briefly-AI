import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  PlayIcon,
  CheckCircle2Icon,
  SparklesIcon
} from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] pt-36 pb-16 flex items-center justify-center px-6 overflow-hidden z-10">

      {/* BACKGROUND DESIGN SYSTEM - Moved to Hero to keep background contained */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">

        {/* Subtle Technical Grid Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(109,94,248,0.06) 1.5px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Dark Shade Gradient (Hero Section Faded Overlay) */}
        <div className="absolute top-0 left-0 right-0 h-[650px] bg-gradient-to-b from-black/[0.18] via-black/[0.06] to-transparent z-10" />

        {/* Large Blurred Radial Glows - Pulsing & Breathing via CSS */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#6D5EF8]/7 to-transparent rounded-full blur-[140px] animate-glow-top" />
        <div className="absolute top-[40%] -left-[200px] w-[800px] h-[800px] bg-[#6D5EF8]/[0.04] rounded-full blur-[160px] animate-glow-left" />
        <div className="absolute top-[70%] -right-[200px] w-[900px] h-[900px] bg-indigo-500/[0.04] rounded-full blur-[180px] animate-glow-right" />

        {/* Floating Background Particles via CSS */}
        <div className="absolute top-[18%] left-[8%] w-2 h-2 rounded-full bg-[#6D5EF8]/40 blur-[1px] animate-particle-1" />
        <div className="absolute top-[32%] right-[12%] w-2.5 h-2.5 rounded-full bg-[#6D5EF8]/30 blur-[1px] animate-particle-2" />
        <div className="absolute top-[55%] left-[6%] w-2 h-2 rounded-full bg-indigo-500/30 blur-[1px] animate-particle-3" />
        <div className="absolute top-[72%] right-[8%] w-2 h-2 rounded-full bg-[#6D5EF8]/40 blur-[1px] animate-particle-4" />
        <div className="absolute top-[88%] left-[12%] w-3 h-3 rounded-full bg-violet-400/30 blur-[1.5px] animate-particle-5" />

        {/* Curved Dashed SVG Paths */}
        <svg className="absolute inset-0 w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M -100 250 Q 250 80 750 450 T 1600 250"
            fill="none"
            stroke="rgba(109,94,248,0.08)"
            strokeWidth="1.5"
            strokeDasharray="10 12"
          />
          <path
            d="M -50 800 Q 550 1000 1050 650 T 2000 1050"
            fill="none"
            stroke="rgba(109,94,248,0.05)"
            strokeWidth="1.2"
            strokeDasharray="10 12"
          />
        </svg>

        {/* Floating "+" Markers */}
        <div className="absolute top-[15%] left-[5%] text-neutral-300 font-mono text-sm font-semibold select-none opacity-50">+</div>
        <div className="absolute top-[8%] right-[8%] text-neutral-300 font-mono text-sm font-semibold select-none opacity-50">+</div >
        <div className="absolute top-[48%] left-[12%] text-neutral-300 font-mono text-sm font-semibold select-none opacity-50">+</div >
        <div className="absolute top-[35%] right-[5%] text-neutral-300 font-mono text-sm font-semibold select-none opacity-50">+</div >
        <div className="absolute bottom-[20%] left-[8%] text-neutral-300 font-mono text-sm font-semibold select-none opacity-50">+</div >
        <div className="absolute bottom-[10%] right-[10%] text-neutral-300 font-mono text-sm font-semibold select-none opacity-50">+</div >
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

        {/* Hero Content Left */}
        <div className="lg:col-span-5 space-y-7 flex flex-col text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.08] bg-white select-none w-fit shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#6D5EF8] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase">Meet Your New Chief of Staff</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.08] text-[#111111]">
            Take Control of Your Inbox <br className="hidden sm:inline" />
            and Schedule
          </h1>

          <div className="space-y-3">
            <p className="text-base sm:text-lg text-neutral-500 leading-relaxed">
              Briefly AI automatically analyzes your inbox and calendar to surface what matters most, turning cluttered notifications into actionable briefings.
            </p>
            <p className="text-xs text-[#6D5EF8] font-bold">
              Connect Gmail and Google Calendar in under 60 seconds.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className="h-11 inline-flex items-center justify-center px-6 rounded-xl text-sm font-semibold bg-[#6D5EF8] text-white hover:bg-[#5b4fe0] transition-all shadow-[0_4px_16px_rgba(109,94,248,0.25)] hover:shadow-[0_4px_22px_rgba(109,94,248,0.4)] active:scale-98 cursor-pointer"
            >
              Get Started Free
            </Link>
            <a
              href="#demo"
              className="h-11 inline-flex items-center justify-center px-5 rounded-xl text-sm font-semibold border border-black/[0.08] bg-white hover:bg-neutral-50 text-neutral-700 transition-all cursor-pointer group shadow-xs"
            >
              <PlayIcon className="size-3.5 mr-2 fill-neutral-500/10 group-hover:fill-neutral-500/20 text-neutral-600 transition-all" />
              Watch Demo
            </a>
          </div>

          {/* Trust Banner / Connected badges */}
          <div className="pt-6 border-t border-black/[0.08] max-w-lg select-none">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] font-bold tracking-tight text-neutral-400">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-3.5 text-[#6D5EF8]" />
                <span>Gmail Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-3.5 text-blue-500" />
                <span>Google Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-3.5 text-[#6D5EF8]" />
                <span>Daily Briefings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Premium Dashboard Preview Mockup Right */}
        <div className="lg:col-span-7 relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          {/* Glow backing */}
          <div className="absolute -inset-4 rounded-[2rem] bg-[#6D5EF8]/5 blur-[30px] opacity-70 pointer-events-none" />

          {/* Floating Container mockup via CSS keyframe float */}
          <div className="relative rounded-2xl border border-black/[0.08] bg-white p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] w-full overflow-hidden animate-hero-float">
            {/* Window Bar Header simulation */}
            <div className="flex items-center justify-between border-b border-black/[0.04] pb-4 mb-5 select-none">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#6D5EF8]/10 text-[#6D5EF8]">
                  🧠
                </span>
                <span className="font-bold text-xs text-neutral-800">Briefly AI Workspace</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6D5EF8]/80 animate-pulse" />
                <span className="text-[10px] text-neutral-400 font-bold uppercase">ACTIVE CLIENT</span>
              </div>
            </div>

            {/* Greeting */}
            <div className="text-left mb-5">
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Good Morning, Ansh 👋</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Briefly AI reviewed your inbox and calendar.</p>
            </div>

            {/* Mockup cards grid */}
            <div className="grid grid-cols-3 gap-3 mb-4 select-none">
              <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-3.5 text-left">
                <span className="text-xs text-red-500 font-bold block">3 Priority</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">Emails requiring reply</span>
              </div>
              <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.02] p-3.5 text-left">
                <span className="text-xs text-amber-600 font-bold block">2 Follow-Ups</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">Action items pending</span>
              </div>
              <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.02] p-3.5 text-left">
                <span className="text-xs text-blue-500 font-bold block">1 Meeting</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">Scheduled for today</span>
              </div>
            </div>

            {/* Next Action Item Mockup */}
            <div className="rounded-xl border border-black/[0.04] bg-neutral-50/50 p-4 mb-4 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Recommended Next Action</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                <div>
                  <h4 className="font-semibold text-sm text-neutral-800">Reply to Satya</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Confirm proposal approval deadline before 11:00 AM</p>
                </div>
                <Badge className="bg-[#6D5EF8]/10 text-[#6D5EF8] hover:bg-[#6D5EF8]/15 border border-[#6D5EF8]/20 text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 w-fit">
                  HIGH PRIORITY
                </Badge>
              </div>
            </div>

            {/* Insight block */}
            <div className="rounded-xl border border-[#6D5EF8]/10 bg-[#6D5EF8]/[0.02] p-3 text-left flex items-start gap-2.5">
              <SparklesIcon className="size-4 mr-0.5 text-[#6D5EF8] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-[#6D5EF8] uppercase block">Briefly AI Insight</span>
                <p className="text-xs text-neutral-600 leading-snug mt-0.5">Your first meeting begins in 45 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
