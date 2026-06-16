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

  useEffect(() => {
    let stepTimer: NodeJS.Timeout
    let textTimer: NodeJS.Timeout
    let loopTimeout: NodeJS.Timeout

    const runAnimation = () => {
      setActiveStep(0)
      setDisplayedText("")

      let currentStep = 0
      stepTimer = setInterval(() => {
        if (currentStep < activitySteps.length - 1) {
          currentStep++
          setActiveStep(currentStep)
        } else {
          clearInterval(stepTimer)
        }
      }, 900)

      let charIndex = 0
      textTimer = setInterval(() => {
        if (charIndex >= briefingText.length) {
          clearInterval(textTimer)
          loopTimeout = setTimeout(() => {
            runAnimation()
          }, 5000) // Pause for 5 seconds at the end before looping
          return
        }
        setDisplayedText(briefingText.slice(0, charIndex + 1))
        charIndex++
      }, 18)
    }

    runAnimation()

    return () => {
      clearInterval(stepTimer)
      clearInterval(textTimer)
      clearTimeout(loopTimeout)
    }
  }, [])

  return (
    <section
      id="demo"
      className="relative py-24 bg-[#FBF2DE] border-y-2 border-dashed border-[#2B2B2B]/20"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-hand text-4xl font-bold tracking-tight text-[#2B2B2B]">
            Live AI Execution
          </h2>

          <p className="mt-4 text-[#2B2B2B]/60 max-w-xl mx-auto">
            Watch Briefly AI analyze your inbox, calendar, and tasks while
            generating a personalized daily briefing in real time.
          </p>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border-2 border-[#2B2B2B] bg-[#FFF8E7] shadow-[6px_6px_0_0_rgba(43,43,43,0.9)]">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#2B2B2B]/20 bg-[#FBF2DE] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full border border-[#2B2B2B]/40 bg-[#E2725B]" />
                <span className="h-3 w-3 rounded-full border border-[#2B2B2B]/40 bg-[#F2B33D]" />
                <span className="h-3 w-3 rounded-full border border-[#2B2B2B]/40 bg-[#7FB88B]" />
              </div>

              <span className="font-hand text-sm text-[#2B2B2B]/50">
                briefly-ai-agent.ts
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border-2 border-[#2B2B2B] bg-[#E3F0E5] px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-[#7FB88B]" />

              <span className="font-hand text-xs font-bold text-[#3F7A4D]">
                AI Active
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-[320px_1fr]">
            {/* LEFT PANEL */}
            <div className="border-r-2 border-dashed border-[#2B2B2B]/20 bg-[#FBF2DE]/60 p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#2B2B2B] bg-[#F6D2DE]">
                  <span className="text-lg">🧠</span>
                </div>

                <div>
                  <h3 className="font-hand font-bold text-[#2B2B2B]">
                    AI Activity
                  </h3>

                  <p className="text-xs text-[#2B2B2B]/50">
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
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#2B2B2B] text-xs font-bold transition-all duration-300 ${completed
                          ? "bg-[#7FB88B] text-[#1E3B25]"
                          : active
                            ? "bg-[#F2B33D] text-[#2B2B2B]"
                            : "bg-[#FFF8E7] text-[#2B2B2B]/50"
                          }`}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      <span className="text-sm text-[#2B2B2B]/80">
                        {step}
                      </span>

                      {active && (
                        <div className="h-4 w-1 rounded-full bg-[#F2B33D] animate-pulse" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Stats */}
              <div className="mt-10 rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] p-4 shadow-[2px_2px_0_0_rgba(43,43,43,0.5)]">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#2B2B2B]/50">
                      Emails Processed
                    </p>
                    <p className="font-hand text-xl font-bold text-[#2B2B2B]">247</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#2B2B2B]/50">
                      Meetings Today
                    </p>
                    <p className="font-hand text-xl font-bold text-[#2B2B2B]">2</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#2B2B2B]/50">
                      Priority Items
                    </p>
                    <p className="font-hand text-xl font-bold text-[#C9536B]">
                      3
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl border-2 border-[#2B2B2B] bg-[#F2B33D] text-[#2B2B2B] flex items-center justify-center">
                  ✨
                </div>

                <div>
                  <h3 className="font-hand font-bold text-[#2B2B2B]">
                    AI Briefing
                  </h3>

                  <p className="text-sm text-[#2B2B2B]/50">
                    Generated in real time
                  </p>
                </div>
              </div>

              {/* Streaming Output */}
              <div className="rounded-2xl border-2 border-[#2B2B2B] bg-[#FBF2DE] p-6 min-h-[350px] shadow-[2px_2px_0_0_rgba(43,43,43,0.3)] relative">
                {/* Invisible placeholder of the full text to reserve layout height and prevent page shrinkage */}
                <div className="font-mono text-[15px] leading-8 text-[#2B2B2B]/80 whitespace-pre-wrap invisible">
                  {briefingText}
                </div>
                {/* Floating overlay container containing the actual animated typewriter output */}
                <div className="font-mono text-[15px] leading-8 text-[#2B2B2B]/80 whitespace-pre-wrap absolute top-6 left-6 right-6 bottom-6 overflow-y-auto no-scrollbar">
                  {displayedText}
                  <span className="ml-1 inline-block animate-pulse text-[#F2B33D]">
                    ▋
                  </span>
                </div>
              </div>

              {/* Bottom Summary */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl border-2 border-[#2B2B2B] bg-[#F6D2DE]/40 p-4 shadow-[2px_2px_0_0_rgba(43,43,43,0.4)]">
                  <div className="text-xs font-bold text-[#C9536B] mb-1">
                    Priority Emails
                  </div>

                  <div className="font-hand text-2xl font-bold text-[#C9536B]">
                    3
                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#2B2B2B] bg-[#CFE3F2]/60 p-4 shadow-[2px_2px_0_0_rgba(43,43,43,0.4)]">
                  <div className="text-xs font-bold text-[#3E7CA6] mb-1">
                    Meetings
                  </div>

                  <div className="font-hand text-2xl font-bold text-[#3E7CA6]">
                    2
                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#2B2B2B] bg-[#F2B33D]/15 p-4 shadow-[2px_2px_0_0_rgba(43,43,43,0.4)]">
                  <div className="text-xs font-bold text-[#F2B33D] mb-1">
                    Focus Score
                  </div>

                  <div className="font-hand text-2xl font-bold text-[#F2B33D]">
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