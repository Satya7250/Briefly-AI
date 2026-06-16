"use client"

import { useEffect, useState } from "react"

const activitySteps = [
  "Connecting to Gmail",
  "Syncing calendar",
  "Analyzing emails",
  "Ranking priorities",
  "Generating briefing",
]

const briefingText = `Good morning.

You have 3 urgent emails requiring attention.

Your first meeting begins at 10:00 AM.

The highest priority item today is reviewing the Google Security permission request before your budget review meeting.

Completing that task early will remove a blocker and keep the rest of your day focused.

Recommended focus:
Review permissions → Prepare budget notes → Attend 10:00 AM sync.`

export default function AIDemo() {
  const [activeStep, setActiveStep] = useState(0)
  const [displayedText, setDisplayedText] = useState("")

  // Activity feed animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= activitySteps.length - 1) return prev
        return prev + 1
      })
    }, 900)

    return () => clearInterval(interval)
  }, [])

  // Streaming text animation
  useEffect(() => {
    let index = 0

    const timer = setInterval(() => {
      if (index >= briefingText.length) {
        clearInterval(timer)
        return
      }

      setDisplayedText(briefingText.slice(0, index + 1))
      index++
    }, 18)

    return () => clearInterval(timer)
  }, [])

  return (
    <section
      id="demo"
      className="relative py-24 bg-white border-y border-black/[0.06]"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900">
            Live AI Execution
          </h2>

          <p className="mt-4 text-neutral-500 max-w-xl mx-auto">
            Watch Briefly AI analyze your inbox, calendar, and tasks while
            generating a personalized daily briefing in real time.
          </p>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_20px_60px_rgba(0,0,0,.06)]">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-black/[0.05] bg-neutral-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>

              <span className="font-mono text-xs text-neutral-400">
                briefly-ai-agent.ts
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />

              <span className="text-xs font-medium text-green-700">
                AI Active
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-[320px_1fr]">
            {/* LEFT PANEL */}
            <div className="border-r border-black/[0.05] bg-neutral-50/50 p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D5EF8]/10">
                  <span className="text-lg">🧠</span>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900">
                    AI Activity
                  </h3>

                  <p className="text-xs text-neutral-500">
                    Live execution feed
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {activitySteps.map((step, index) => {
                  const completed = index < activeStep
                  const active = index === activeStep

                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 transition-all duration-500 ${index <= activeStep
                          ? "opacity-100"
                          : "opacity-40"
                        }`}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${completed
                            ? "bg-green-100 text-green-600"
                            : active
                              ? "bg-[#6D5EF8]/10 text-[#6D5EF8]"
                              : "bg-neutral-200 text-neutral-500"
                          }`}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      <span className="text-sm text-neutral-700">
                        {step}
                      </span>

                      {active && (
                        <div className="h-4 w-1 rounded-full bg-[#6D5EF8] animate-pulse" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Stats */}
              <div className="mt-10 rounded-2xl border border-black/[0.05] bg-white p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-400">
                      Emails Processed
                    </p>
                    <p className="text-xl font-semibold">247</p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">
                      Meetings Today
                    </p>
                    <p className="text-xl font-semibold">2</p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">
                      Priority Items
                    </p>
                    <p className="text-xl font-semibold text-red-500">
                      3
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-[#6D5EF8] text-white flex items-center justify-center">
                  ✨
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900">
                    AI Briefing
                  </h3>

                  <p className="text-sm text-neutral-500">
                    Generated in real time
                  </p>
                </div>
              </div>

              {/* Streaming Output */}
              <div className="rounded-2xl border border-black/[0.06] bg-neutral-50 p-6 min-h-[350px]">
                <div className="font-mono text-[15px] leading-8 text-neutral-700 whitespace-pre-wrap">
                  {displayedText}

                  <span className="ml-1 inline-block animate-pulse text-[#6D5EF8]">
                    ▋
                  </span>
                </div>
              </div>

              {/* Bottom Summary */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="text-xs font-medium text-red-500 mb-1">
                    Priority Emails
                  </div>

                  <div className="text-2xl font-bold text-red-600">
                    3
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="text-xs font-medium text-blue-500 mb-1">
                    Meetings
                  </div>

                  <div className="text-2xl font-bold text-blue-600">
                    2
                  </div>
                </div>

                <div className="rounded-xl border border-[#6D5EF8]/20 bg-[#6D5EF8]/5 p-4">
                  <div className="text-xs font-medium text-[#6D5EF8] mb-1">
                    Focus Score
                  </div>

                  <div className="text-2xl font-bold text-[#6D5EF8]">
                    92%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}