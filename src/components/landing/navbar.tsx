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
    <div className="sticky top-0 z-50 w-full px-4 md:px-6 pt-4">
      <nav
        className={`mx-auto w-full max-w-[1280px] rounded-2xl border-2 border-[#2B2B2B] bg-[#FFF8E7] transition-all duration-300 ${scrolled
            ? "shadow-[3px_3px_0_0_rgba(43,43,43,0.9)] py-2.5 px-5"
            : "shadow-[4px_4px_0_0_rgba(43,43,43,0.9)] py-3.5 px-6"
          }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 select-none">
            <Logo className="rounded-full border-2 border-[#2B2B2B] bg-[#F6D2DE]" width={36} height={36} />
            <span className="font-hand text-xl font-bold tracking-tight text-[#2B2B2B]">
              Briefly
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <a
              href="#features"
              className="font-hand text-base text-[#2B2B2B]/70 transition-colors hover:text-[#2B2B2B]"
            >
              Features
            </a>

            <a
              href="#flow"
              className="font-hand text-base text-[#2B2B2B]/70 transition-colors hover:text-[#2B2B2B]"
            >
              How It Works
            </a>

            <a
              href="#demo"
              onClick={scrollToDemo}
              className="font-hand text-base text-[#2B2B2B]/70 transition-colors hover:text-[#2B2B2B]"
            >
              AI Demo
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="font-hand text-base text-[#2B2B2B]/70 transition-colors hover:text-[#2B2B2B]"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-[#2B2B2B] bg-[#F2B33D] px-5 font-hand text-base font-bold text-[#2B2B2B] shadow-[3px_3px_0_0_rgba(43,43,43,0.9)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[4px_5px_0_0_rgba(43,43,43,0.9)] active:translate-y-0 active:shadow-[1px_1px_0_0_rgba(43,43,43,0.9)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}