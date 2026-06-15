"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToDemo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    document.getElementById("demo")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 md:px-6 pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-[1440px] rounded-2xl border backdrop-blur-xl transition-all duration-300 ${scrolled
          ? "bg-white/60 border-neutral-200 shadow-[0_12px_30px_rgba(0,0,0,0.06)] py-3 px-6"
          : "bg-white/40 border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.03)] py-4 px-6"
          }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 select-none">
            <Logo
              width={36}
              height={36}
              className="h-8 w-8 md:h-9 md:w-9"
            />
            <span className="text-lg font-bold tracking-tight text-black">
              Briefly
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-black"
            >
              Features
            </a>

            <a
              href="#flow"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-black"
            >
              How It Works
            </a>

            <a
              href="#demo"
              onClick={scrollToDemo}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-black"
            >
              AI Demo
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-black"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}