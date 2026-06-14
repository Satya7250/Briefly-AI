"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { 
  SparklesIcon, 
  MailIcon, 
  CalendarIcon, 
  AlertCircleIcon, 
  ArrowRightIcon, 
  PlayIcon, 
  CheckCircle2Icon, 
  ClockIcon, 
  ShieldCheckIcon,
  MousePointerClickIcon,
  ChevronRightIcon
} from "lucide-react"

// Dynamic Count-Up Component
function CountUpNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const duration = 1.5
      const end = value
      const stepTime = Math.abs(Math.floor(1500 / end))
      const timer = setInterval(() => {
        start += 1
        setCount(start)
        if (start >= end) {
          clearInterval(timer)
          setCount(end)
        }
      }, stepTime)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  // Manage navbar opacity on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-advance the AI Demo Sequence
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 6)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  // Smooth scroll helper
  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans antialiased overflow-x-hidden selection:bg-[#8B5CF6]/30 selection:text-white">
      
      {/* 1. Navbar: Transparent glass, blurs on scroll */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "backdrop-blur-md bg-[#09090B]/75 border-b border-[#27272A] py-3.5" 
          : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group select-none">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-indigo-600 text-white shadow-[0_0_15px_-3px_rgba(139,92,246,0.5)]">
              <SparklesIcon className="size-4.5 animate-pulse" />
            </span>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-white/90 transition-colors">Briefly</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#flow" className="hover:text-white transition-colors duration-200">How It Works</a>
            <a href="#demo" onClick={scrollToDemo} className="hover:text-white transition-colors duration-200">AI Demo</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/sign-in" 
              className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="hidden sm:inline-flex h-9 items-center justify-center px-4 rounded-xl text-xs font-semibold bg-[#FAFAFA] text-[#09090B] hover:bg-[#FAFAFA]/90 transition-all shadow-[0_2px_8px_-2px_rgba(255,255,255,0.1)] active:scale-95 cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section: Full viewport layout */}
      <section className="relative min-h-screen pt-28 flex items-center justify-center px-6 overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          {/* Hero Content Left */}
          <div className="lg:col-span-6 space-y-7 flex flex-col text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#27272A] bg-[#111113]/80 select-none w-fit"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#8B5CF6] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider text-[#A1A1AA] uppercase">Meet Your New Chief of Staff</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.08] text-white"
            >
              Take Control of Your Inbox <br className="hidden sm:inline" />
              and Schedule
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-3"
            >
              <p className="text-base sm:text-lg text-[#A1A1AA] max-w-xl leading-relaxed">
                Briefly AI automatically analyzes your inbox and calendar to surface what matters most, turning cluttered notifications into actionable briefings.
              </p>
              <p className="text-xs text-[#8B5CF6]/90 font-medium">
                Connect Gmail and Google Calendar in under 60 seconds.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link 
                href="/sign-up"
                className="h-11 inline-flex items-center justify-center px-6 rounded-xl text-sm font-semibold bg-[#8B5CF6] text-white hover:bg-[#7c4dff] transition-all shadow-[0_4px_20px_-3px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_-1px_rgba(139,92,246,0.45)] active:scale-98 cursor-pointer"
              >
                Get Started Free
              </Link>
              <a 
                href="#demo"
                onClick={scrollToDemo}
                className="h-11 inline-flex items-center justify-center px-5 rounded-xl text-sm font-semibold border border-[#27272A] bg-[#111113]/40 hover:bg-[#111113]/85 text-[#FAFAFA] hover:border-[#A1A1AA]/30 transition-all cursor-pointer group"
              >
                <PlayIcon className="size-3.5 mr-2 fill-white/10 group-hover:fill-white/20 transition-all" />
                Watch Demo
              </a>
            </motion.div>

            {/* Trust Banner / Connected badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 border-t border-[#27272A]/50 max-w-lg select-none"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] font-bold tracking-tight text-[#A1A1AA]">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-3.5 text-[#8B5CF6]" />
                  <span>Gmail Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-3.5 text-blue-500" />
                  <span>Google Calendar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-3.5 text-[#8B5CF6]" />
                  <span>Daily Briefings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                  <span>Privacy First</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Hero Premium Dashboard Preview Mockup Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-6 relative"
          >
            {/* Glow backing */}
            <div className="absolute -inset-6 rounded-[2rem] bg-[#8B5CF6]/10 blur-[40px] opacity-40 group-hover:opacity-60 transition-all duration-500" />
            
            {/* Floating Container mockup */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative rounded-2xl border border-[#27272A] bg-[#111113] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] w-full overflow-hidden"
            >
              {/* Header simulation */}
              <div className="flex items-center justify-between border-b border-[#27272A]/55 pb-4 mb-5 select-none">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6]">
                    🧠
                  </span>
                  <span className="font-bold text-xs text-white">Briefly AI Workspace</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]/80" />
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">ACTIVE CLIENT</span>
                </div>
              </div>

              {/* Greeting */}
              <div className="text-left mb-5">
                <h3 className="text-lg font-bold text-white tracking-tight">Good Morning, Ansh 👋</h3>
                <p className="text-[12.5px] text-[#A1A1AA] mt-0.5">Briefly AI reviewed your inbox and calendar.</p>
              </div>

              {/* Mockup cards grid */}
              <div className="grid grid-cols-3 gap-3 mb-4 select-none">
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-3 text-left">
                  <span className="text-xs text-red-400 font-bold block">3 Priority</span>
                  <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">Emails requiring reply</span>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-3 text-left">
                  <span className="text-xs text-amber-400 font-bold block">2 Follow-Ups</span>
                  <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">Action items pending</span>
                </div>
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.02] p-3 text-left">
                  <span className="text-xs text-blue-400 font-bold block">1 Meeting</span>
                  <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">Scheduled for today</span>
                </div>
              </div>

              {/* Next Action Item Mockup */}
              <div className="rounded-xl border border-[#27272A] bg-[#09090B]/50 p-4 mb-4 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]/80">Recommended Next Action</span>
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div>
                    <h4 className="font-semibold text-sm text-white">Reply to Satya</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Confirm proposal approval deadline before 11:00 AM</p>
                  </div>
                  <Badge className="bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/20 text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0">
                    HIGH PRIORITY
                  </Badge>
                </div>
              </div>

              {/* Insight block */}
              <div className="rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-3 text-left flex items-start gap-2.5">
                <SparklesIcon className="size-4.5 text-[#8B5CF6] shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="text-[11px] font-bold text-[#8B5CF6] uppercase block">Briefly AI Insight</span>
                  <p className="text-xs text-[#FAFAFA]/95 leading-snug mt-0.5">Your first meeting begins in 45 minutes.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. AI Demo Section: Interactive stream sequence simulator */}
      <section id="demo" className="py-24 border-t border-[#27272A] relative bg-[#111113]/15">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-3.5 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white">Live AI Execution</h2>
            <p className="text-sm text-[#A1A1AA] max-w-md mx-auto">Watch Briefly AI dynamically assemble a briefing on scroll.</p>
          </div>

          <div className="rounded-2xl border border-[#27272A] bg-[#111113] overflow-hidden shadow-2xl">
            <div className="border-b border-[#27272A] px-5 py-3.5 flex items-center justify-between bg-[#09090B]/30 select-none">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">briefly-agent-stream.js</span>
              </div>
              <button 
                onClick={() => setDemoStep(0)} 
                className="text-[11px] font-bold text-[#8B5CF6] hover:underline cursor-pointer"
              >
                Restart Sequence
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 text-left min-h-[350px] flex flex-col justify-between">
              
              {/* Timeline sequence */}
              <div className="space-y-4 flex-1">
                {demoStep >= 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-sm font-semibold text-[#8B5CF6]"
                  >
                    <span>🧠</span>
                    <span>Briefly AI is reviewing your day...</span>
                    {demoStep === 0 && <span className="inline-block w-1 h-4 bg-[#8B5CF6] animate-pulse" />}
                  </motion.div>
                )}

                {demoStep >= 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-sm font-medium text-red-400 pl-6"
                  >
                    <span>📬</span>
                    <span>3 priority emails detected</span>
                    {demoStep === 1 && <span className="inline-block w-1 h-4 bg-red-400 animate-pulse" />}
                  </motion.div>
                )}

                {demoStep >= 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-sm font-medium text-blue-400 pl-6"
                  >
                    <span>📅</span>
                    <span>2 meetings scheduled</span>
                    {demoStep === 2 && <span className="inline-block w-1 h-4 bg-blue-400 animate-pulse" />}
                  </motion.div>
                )}

                {demoStep >= 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-sm font-medium text-amber-500 pl-6"
                  >
                    <span>⚠️</span>
                    <span>1 follow-up requires attention</span>
                    {demoStep === 3 && <span className="inline-block w-1 h-4 bg-amber-500 animate-pulse" />}
                  </motion.div>
                )}
              </div>

              {/* Reveal Briefing Card */}
              <AnimatePresence mode="wait">
                {demoStep >= 4 ? (
                  <motion.div
                    key="revealed-briefing"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-xl border border-[#27272A] bg-[#09090B] p-5 shadow-inner mt-4"
                  >
                    {/* Briefly AI Banner Header */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-[#27272A] pb-3 mb-4 select-none">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <span>🧠</span>
                        <span>Generated by Briefly AI</span>
                      </div>
                      <span className="font-medium text-muted-foreground/60">Generated just now</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Priority Card */}
                      <div className="rounded-lg border border-red-500/10 bg-red-500/[0.01] p-3">
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-2">
                          <span>🔥</span> Priority Emails
                        </span>
                        <div className="space-y-2">
                          <div className="p-2 rounded bg-[#111113] border border-[#27272A] text-left">
                            <span className="font-semibold text-[11.5px] text-white block truncate">Google Security</span>
                            <span className="text-[10px] text-muted-foreground block truncate">Review permissions grant</span>
                          </div>
                        </div>
                      </div>

                      {/* Meetings Card */}
                      <div className="rounded-lg border border-blue-500/10 bg-blue-500/[0.01] p-3">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2">
                          <span>📅</span> Meetings Today
                        </span>
                        <div className="space-y-2">
                          <div className="p-2 rounded bg-[#111113] border border-[#27272A] text-left">
                            <span className="font-semibold text-[11.5px] text-white block truncate">Sync with Satya</span>
                            <span className="text-[10px] text-muted-foreground block truncate">Review budget targets</span>
                          </div>
                        </div>
                      </div>

                      {/* Suggested Focus Card */}
                      <div className="rounded-lg border border-[#8B5CF6]/10 bg-[#8B5CF6]/[0.01] p-3">
                        <span className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5 mb-2">
                          <span>🎯</span> Suggested Focus
                        </span>
                        <p className="text-[11px] text-muted-foreground text-left leading-normal">
                          Focus on closing priority follow-ups before the Satya sync at 10:00 AM.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-0 overflow-hidden" />
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section: Grid cards with hover glow */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center space-y-4 mb-16 select-none">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Inbox & Schedule Intelligence</h2>
          <p className="text-[#A1A1AA] text-sm sm:text-base max-w-lg mx-auto">Reclaim your attention span with four modules built specifically for high-growth operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative rounded-2xl border border-[#27272A] bg-[#111113] p-6 text-left transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)] hover:border-[#8B5CF6]/30 overflow-hidden"
          >
            {/* Hover mouse gradient simulation */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-5 font-semibold">
              🧠
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Briefings</h3>
            <p className="text-[#A1A1AA] text-xs sm:text-sm leading-relaxed">
              Receive premium personalized briefings summarizing critical actions, follow-ups, and calendar timelines at the start of your day.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative rounded-2xl border border-[#27272A] bg-[#111113] p-6 text-left transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.15)] hover:border-red-500/30 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-5 font-semibold">
              📬
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Inbox Intelligence</h3>
            <p className="text-[#A1A1AA] text-xs sm:text-sm leading-relaxed">
              Automatically identify important senders, classify incoming message priorities, and extract actions so you never miss a beat.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative rounded-2xl border border-[#27272A] bg-[#111113] p-6 text-left transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] hover:border-blue-500/30 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 font-semibold">
              📅
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Calendar Intelligence</h3>
            <p className="text-[#A1A1AA] text-xs sm:text-sm leading-relaxed">
              Consolidate daily meetings contextually. Automatically generates context highlights and preparation notes ahead of schedule.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative rounded-2xl border border-[#27272A] bg-[#111113] p-6 text-left transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] hover:border-amber-500/30 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5 font-semibold">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Action Recommendations</h3>
            <p className="text-[#A1A1AA] text-xs sm:text-sm leading-relaxed">
              Know exactly what requires response, what action steps to execute next, and generate drafted responses contextually.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. How It Works: Timeline connecting timeline */}
      <section id="flow" className="py-24 border-t border-[#27272A] relative bg-[#111113]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16 select-none">
            <h2 className="text-3xl font-bold tracking-tight text-white">How It Works</h2>
            <p className="text-[#A1A1AA] text-sm max-w-md mx-auto">Briefly AI seamlessly integrates into your existing Google suite.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="relative group text-left">
              <div className="p-5 rounded-2xl border border-[#27272A] bg-[#111113] relative z-10 transition-all duration-300 hover:border-[#8B5CF6]/40">
                <span className="text-xs font-bold text-[#8B5CF6] uppercase block">Step 01</span>
                <h4 className="font-bold text-[15px] text-white mt-2.5">Connect Gmail</h4>
                <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-relaxed">
                  Authenticate securely using Google OAuth to sync your inbox.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group text-left">
              <div className="p-5 rounded-2xl border border-[#27272A] bg-[#111113] relative z-10 transition-all duration-300 hover:border-[#8B5CF6]/40">
                <span className="text-xs font-bold text-[#8B5CF6] uppercase block">Step 02</span>
                <h4 className="font-bold text-[15px] text-white mt-2.5">Connect Calendar</h4>
                <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-relaxed">
                  Sync Google Calendar accounts to link schedules and context.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group text-left">
              <div className="p-5 rounded-2xl border border-[#27272A] bg-[#111113] relative z-10 transition-all duration-300 hover:border-[#8B5CF6]/40">
                <span className="text-xs font-bold text-[#8B5CF6] uppercase block">Step 03</span>
                <h4 className="font-bold text-[15px] text-white mt-2.5">Briefly AI Analyzes</h4>
                <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-relaxed">
                  Our LLM parser filters noise and identifies actions.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group text-left">
              <div className="p-5 rounded-2xl border border-[#27272A] bg-[#111113] relative z-10 transition-all duration-300 hover:border-[#8B5CF6]/40">
                <span className="text-xs font-bold text-[#8B5CF6] uppercase block">Step 04</span>
                <h4 className="font-bold text-[15px] text-white mt-2.5">Daily Briefings</h4>
                <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-relaxed">
                  Receive actionable summaries and draft replies instantly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Social Proof Counters */}
      <section className="py-20 border-t border-[#27272A] relative bg-[#09090B]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#8B5CF6] tracking-tight">
                <CountUpNumber value={10000} suffix="+" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]/80 mt-1">Emails Processed</p>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-extrabold text-blue-500 tracking-tight">
                <CountUpNumber value={500} suffix="+" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]/80 mt-1">Hours Saved</p>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-500 tracking-tight">
                <CountUpNumber value={99} suffix="%" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]/80 mt-1">Faster Inbox Reviews</p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Testimonials Section: Premium glass floating cards */}
      <section className="py-24 border-t border-[#27272A] relative overflow-hidden bg-[#111113]/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16 select-none">
            <h2 className="text-3xl font-bold tracking-tight text-white">Used by Product Leaders</h2>
            <p className="text-[#A1A1AA] text-sm">See how Briefly AI empowers executive operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-[#27272A] bg-[#111113]/60 backdrop-blur-md p-6 text-left shadow-sm flex flex-col justify-between"
            >
              <p className="text-sm leading-relaxed text-[#FAFAFA]/95 font-medium italic">
                "Briefly has completely changed how I start my day. I review my briefings in 2 minutes instead of digging through 50 emails."
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-[#27272A]/50 pt-4 select-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-indigo-500 flex items-center justify-center text-[10.5px] font-bold text-white shadow-sm">
                  SK
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">Sarah K.</span>
                  <span className="text-[10px] text-muted-foreground block">VP of Product</span>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-[#27272A] bg-[#111113]/60 backdrop-blur-md p-6 text-left shadow-sm flex flex-col justify-between"
            >
              <p className="text-sm leading-relaxed text-[#FAFAFA]/95 font-medium italic">
                "The proactive next actions are game-changing. It drafted a response to a critical client email before I even opened Outlook."
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-[#27272A]/50 pt-4 select-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10.5px] font-bold text-white shadow-sm">
                  DM
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">David M.</span>
                  <span className="text-[10px] text-muted-foreground block">SaaS Founder</span>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-[#27272A] bg-[#111113]/60 backdrop-blur-md p-6 text-left shadow-sm flex flex-col justify-between"
            >
              <p className="text-sm leading-relaxed text-[#FAFAFA]/95 font-medium italic">
                "An absolute must-have for executives. The calendar prep notes save me hours of meeting prep every single week."
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-[#27272A]/50 pt-4 select-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-pink-500 flex items-center justify-center text-[10.5px] font-bold text-white shadow-sm">
                  ER
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">Elena R.</span>
                  <span className="text-[10px] text-muted-foreground block">Chief of Staff</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="py-28 border-t border-[#27272A] relative bg-[#09090B] overflow-hidden text-center select-none">
        {/* Glow */}
        <div className="absolute inset-0 bg-[#8B5CF6]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 space-y-7 relative z-10 flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to Reclaim Your Day?
          </h2>
          <p className="text-[#A1A1AA] text-sm sm:text-base max-w-md">
            Unlock executive focus and speed through notifications in minutes.
          </p>
          <div className="pt-2">
            <Link 
              href="/sign-up" 
              className="h-12 inline-flex items-center justify-center px-8 rounded-xl text-sm font-semibold bg-[#8B5CF6] hover:bg-[#7c4dff] text-white shadow-[0_5px_22px_-4px_rgba(139,92,246,0.35)] transition-all active:scale-98 cursor-pointer"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Footer: Minimal, clean */}
      <footer className="py-12 border-t border-[#27272A] bg-[#09090B]/50 select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#A1A1AA]">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <SparklesIcon className="size-4 text-[#8B5CF6]" />
            <span>Briefly</span>
          </div>
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-[12px] text-muted-foreground/60 font-medium">
            &copy; {new Date().getFullYear()} Briefly. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}
