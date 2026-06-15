"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Logo } from "@/components/common/logo"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

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

  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="w-full fixed top-4 left-0 right-0 z-50 px-4 md:px-6 pointer-events-none flex justify-center">
      <nav className={`w-full max-w-[1440px] rounded-2xl border transition-all duration-300 backdrop-blur-xl pointer-events-auto ${
        scrolled 
          ? "bg-white/55 border-neutral-900/[0.06] shadow-[0_12px_30px_rgba(0,0,0,0.03),_inset_0_1px_0_rgba(255,255,255,0.6)] py-3 px-6" 
          : "bg-white/35 border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.02),_inset_0_1px_0_rgba(255,255,255,0.8)] py-4 px-6"
      }`}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <Logo width={36} height={36} className="h-8 w-8 md:h-9 md:w-9" />
            <span className="font-bold text-lg tracking-tight text-[#111111] group-hover:text-[#111111]/80 transition-colors">Briefly</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
            <a href="#features" className="hover:text-[#111111] transition-colors duration-200">Features</a>
            <a href="#flow" className="hover:text-[#111111] transition-colors duration-200">How It Works</a>
            <a href="#demo" onClick={scrollToDemo} className="hover:text-[#111111] transition-colors duration-200">AI Demo</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/sign-in" 
              className="text-sm font-medium text-neutral-500 hover:text-[#111111] transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="inline-flex h-9 items-center justify-center px-4 rounded-xl text-xs font-semibold bg-[#111111] text-white hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
