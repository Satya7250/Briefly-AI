"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export default function AIDemo() {
  const [demoStep, setDemoStep] = useState(0)

  // Auto-advance the AI Demo Sequence
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 6)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="demo" className="py-24 border-y border-black/[0.06] relative bg-white/40 z-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3.5 mb-12 select-none">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Live AI Execution</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">Watch Briefly AI dynamically assemble a briefing in real time.</p>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-sm">
          <div className="border-b border-black/[0.04] px-5 py-3.5 flex items-center justify-between bg-neutral-50/50 select-none">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="ml-2 font-mono text-[11px] text-neutral-400">briefly-agent-stream.js</span>
            </div>
            <button 
              onClick={() => setDemoStep(0)} 
              className="text-[11px] font-bold text-[#6D5EF8] hover:underline cursor-pointer"
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
                  className="flex items-center gap-3 text-sm font-semibold text-[#6D5EF8]"
                >
                  <span>🧠</span>
                  <span>Briefly AI is reviewing your day...</span>
                  {demoStep === 0 && <span className="inline-block w-1.5 h-4 bg-[#6D5EF8] animate-pulse" />}
                </motion.div>
              )}

              {demoStep >= 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-sm font-semibold text-red-500 pl-6"
                >
                  <span>📬</span>
                  <span>3 priority emails detected</span>
                  {demoStep === 1 && <span className="inline-block w-1.5 h-4 bg-red-500 animate-pulse" />}
                </motion.div>
              )}

              {demoStep >= 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-sm font-semibold text-blue-500 pl-6"
                >
                  <span>📅</span>
                  <span>2 meetings scheduled</span>
                  {demoStep === 2 && <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse" />}
                </motion.div>
              )}

              {demoStep >= 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-sm font-semibold text-amber-600 pl-6"
                >
                  <span>⚠️</span>
                  <span>1 follow-up requires attention</span>
                  {demoStep === 3 && <span className="inline-block w-1.5 h-4 bg-amber-600 animate-pulse" />}
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
                  className="rounded-xl border border-black/[0.06] bg-neutral-50/50 p-5 mt-4"
                >
                  {/* Briefly AI Banner Header */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-black/[0.04] pb-3 mb-4 select-none">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-700">
                      <span>🧠</span>
                      <span>Generated by Briefly AI</span>
                    </div>
                    <span className="font-semibold text-neutral-400">Generated just now</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Priority Card */}
                    <div className="rounded-lg border border-red-100 bg-white p-3.5">
                      <span className="text-xs font-bold text-red-500 flex items-center gap-1.5 mb-2.5">
                        <span>🔥</span> Priority Emails
                      </span>
                      <div className="space-y-2">
                        <div className="p-2 rounded-lg bg-neutral-50 border border-black/[0.04] text-left">
                          <span className="font-bold text-[11px] text-neutral-800 block truncate">Google Security</span>
                          <span className="text-[10px] text-neutral-400 block truncate">Review permissions grant</span>
                        </div>
                      </div>
                    </div>

                    {/* Meetings Card */}
                    <div className="rounded-lg border border-blue-100 bg-white p-3.5">
                      <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5 mb-2.5">
                        <span>📅</span> Meetings Today
                      </span>
                      <div className="space-y-2">
                        <div className="p-2 rounded-lg bg-neutral-50 border border-black/[0.04] text-left">
                          <span className="font-bold text-[11px] text-neutral-800 block truncate">Sync with Satya</span>
                          <span className="text-[10px] text-neutral-400 block truncate">Review budget targets</span>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Focus Card */}
                    <div className="rounded-lg border border-indigo-100 bg-white p-3.5">
                      <span className="text-xs font-bold text-[#6D5EF8] flex items-center gap-1.5 mb-2.5">
                        <span>🎯</span> Suggested Focus
                      </span>
                      <p className="text-[11px] text-neutral-500 text-left leading-normal">
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
  )
}
