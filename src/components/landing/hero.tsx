import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/common/logo"
import {
  PlayIcon,
  CheckCircle2Icon,
  SparklesIcon
} from "lucide-react"

export default function Hero() {
  return (
    <section className="relative pt-16 pb-20 flex items-center justify-center px-6 overflow-hidden z-10">

      {/* BACKGROUND DESIGN SYSTEM - hand-drawn paper texture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Subtle dot grid like graph paper */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(43,43,43,0.10) 1.5px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Soft pastel blobs */}
        <div className="absolute top-[-10%] left-1/3 w-[700px] h-[500px] bg-[#F6D2DE]/40 rounded-full blur-[120px]" />
        <div className="absolute top-[35%] -left-[150px] w-[600px] h-[600px] bg-[#CFE3F2]/40 rounded-full blur-[130px]" />
        <div className="absolute top-[65%] -right-[150px] w-[650px] h-[650px] bg-[#FCEAC1]/50 rounded-full blur-[130px]" />

        {/* Floating "+" doodle marks */}
        <div className="absolute top-[15%] left-[6%] text-[#2B2B2B]/30 font-hand text-xl select-none">+</div>
        <div className="absolute top-[10%] right-[8%] text-[#2B2B2B]/30 font-hand text-xl select-none">✦</div>
        <div className="absolute top-[50%] left-[10%] text-[#2B2B2B]/25 font-hand text-2xl select-none">~</div>
        <div className="absolute top-[30%] right-[5%] text-[#2B2B2B]/25 font-hand text-xl select-none">+</div>
        <div className="absolute bottom-[15%] left-[8%] text-[#2B2B2B]/25 font-hand text-xl select-none">✦</div>
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

        {/* Hero Content Left */}
        <div className="lg:col-span-5 space-y-7 flex flex-col text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#2B2B2B] bg-[#FFF8E7] select-none w-fit shadow-[2px_2px_0_0_rgba(43,43,43,0.9)]">
            <span className="flex h-2 w-2 rounded-full bg-[#F2B33D]" />
            <span className="font-hand text-sm font-bold tracking-wide text-[#2B2B2B]">Meet Your New Chief of Staff ~</span>
          </div>

          <h1 className="font-hand text-5xl sm:text-6xl lg:text-[58px] font-bold tracking-tight leading-[1.05] text-[#2B2B2B]">
            Take Control of
            Your Inbox &{" "}
            <span className="relative inline-block">
              Schedule
              <svg
                className="absolute left-0 -bottom-2 w-full"
                height="14"
                viewBox="0 0 220 14"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 9C40 2 90 2 110 7C130 12 180 12 218 4"
                  stroke="#F2B33D"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <div className="space-y-3">
            <p className="text-lg text-[#2B2B2B]/70 leading-relaxed">
              Briefly AI automatically analyzes your inbox and calendar to surface what matters most — turning cluttered notifications into actionable briefings.
            </p>
            <p className="text-sm text-[#E2725B] font-bold flex items-center gap-1.5">
              <span>→</span> Connect Gmail + Calendar in under 60 seconds!
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className="h-12 inline-flex items-center justify-center px-7 rounded-xl border-2 border-[#2B2B2B] font-hand text-base font-bold bg-[#F2B33D] text-[#2B2B2B] shadow-[4px_4px_0_0_rgba(43,43,43,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_6px_0_0_rgba(43,43,43,0.9)] active:translate-y-0 active:shadow-[1px_1px_0_0_rgba(43,43,43,0.9)]"
            >
              Get Started Free
            </Link>
            <a
              href="#demo"
              className="h-12 inline-flex items-center justify-center px-6 rounded-xl border-2 border-[#2B2B2B] bg-[#FFF8E7] font-hand text-base font-bold text-[#2B2B2B] shadow-[3px_3px_0_0_rgba(43,43,43,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_5px_0_0_rgba(43,43,43,0.9)] active:translate-y-0 active:shadow-[1px_1px_0_0_rgba(43,43,43,0.9)] group"
            >
              <PlayIcon className="size-4 mr-2 fill-[#2B2B2B]/10 text-[#2B2B2B] transition-all" />
              Watch Demo
            </a>
          </div>

          {/* Trust Banner / Connected badges */}
          <div className="pt-6 border-t-2 border-dashed border-[#2B2B2B]/30 max-w-lg select-none">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 font-hand text-sm font-bold text-[#2B2B2B]/60">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-[#E2725B]" />
                <span>Gmail Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-[#6FA8D8]" />
                <span>Google Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-[#F2B33D]" />
                <span>Daily Briefings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-[#7FB88B]" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Sketchbook Dashboard Preview Mockup Right */}
        <div className="lg:col-span-7 relative">
          {/* Sticky-note style card */}
          <div className="relative rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-6 md:p-8 shadow-[8px_8px_0_0_rgba(43,43,43,0.9)] w-full overflow-hidden rotate-[0.4deg]">
            {/* Window Bar Header simulation */}
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#2B2B2B]/20 pb-4 mb-5 select-none">
              <div className="flex items-center gap-2.5">
                <Logo className="rounded-lg border-2 border-[#2B2B2B] bg-[#F6D2DE]" width={32} height={32} />
                <span className="font-hand font-bold text-sm text-[#2B2B2B]">Briefly AI Workspace</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7FB88B]" />
                <span className="font-hand text-xs text-[#2B2B2B]/50 font-bold uppercase">Active</span>
              </div>
            </div>

            {/* Greeting */}
            <div className="text-left mb-5">
              <h3 className="font-hand text-xl font-bold text-[#2B2B2B] tracking-tight">Good Morning, Satya 👋</h3>
              <p className="text-sm text-[#2B2B2B]/60 mt-0.5">Briefly AI reviewed your inbox and calendar.</p>
            </div>

            {/* Mockup cards grid */}
            <div className="grid grid-cols-3 gap-3 mb-4 select-none">
              <div className="rounded-xl border-2 border-[#2B2B2B] bg-[#F6D2DE]/40 p-3.5 text-left shadow-[2px_2px_0_0_rgba(43,43,43,0.5)]">
                <span className="font-hand text-sm text-[#C9536B] font-bold block">3 Priority</span>
                <span className="text-[11px] text-[#2B2B2B]/50 mt-0.5 block">Emails requiring reply</span>
              </div>
              <div className="rounded-xl border-2 border-[#2B2B2B] bg-[#FCEAC1]/60 p-3.5 text-left shadow-[2px_2px_0_0_rgba(43,43,43,0.5)]">
                <span className="font-hand text-sm text-[#A47A22] font-bold block">2 Follow-Ups</span>
                <span className="text-[11px] text-[#2B2B2B]/50 mt-0.5 block">Action items pending</span>
              </div>
              <div className="rounded-xl border-2 border-[#2B2B2B] bg-[#CFE3F2]/60 p-3.5 text-left shadow-[2px_2px_0_0_rgba(43,43,43,0.5)]">
                <span className="font-hand text-sm text-[#3E7CA6] font-bold block">1 Meeting</span>
                <span className="text-[11px] text-[#2B2B2B]/50 mt-0.5 block">Scheduled for today</span>
              </div>
            </div>

            {/* Next Action Item Mockup */}
            <div className="rounded-xl border-2 border-[#2B2B2B] bg-[#FBF2DE] p-4 mb-4 text-left shadow-[2px_2px_0_0_rgba(43,43,43,0.4)]">
              <span className="font-hand text-xs font-bold uppercase tracking-wide text-[#2B2B2B]/40">Recommended Next Action</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                <div>
                  <h4 className="font-hand font-bold text-base text-[#2B2B2B]">Reply to Saurav</h4>
                  <p className="text-sm text-[#2B2B2B]/60 mt-0.5">Confirm proposal approval deadline before 11:00 AM</p>
                </div>
                <Badge className="bg-[#E2725B] text-[#2B2B2B] hover:bg-[#E2725B] border-2 border-[#2B2B2B] text-[10px] px-2 py-0.5 rounded font-hand font-bold uppercase shrink-0 w-fit">
                  HIGH PRIORITY
                </Badge>
              </div>
            </div>

            {/* Insight block */}
            <div className="rounded-xl border-2 border-dashed border-[#F2B33D]/60 bg-[#F2B33D]/[0.06] p-3 text-left flex items-start gap-2.5">
              <SparklesIcon className="size-4 mr-0.5 text-[#F2B33D] shrink-0 mt-0.5" />
              <div>
                <span className="font-hand text-xs font-bold text-[#F2B33D] uppercase block">Briefly AI Insight</span>
                <p className="text-sm text-[#2B2B2B]/70 leading-snug mt-0.5">Your first meeting begins in 45 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}