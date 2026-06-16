"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Timeline from "@/components/landing/timeline";
import Testimonials from "@/components/landing/testimonials";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

// Lazy-load the interactive AI demo client component to reduce initial JS payload
const AIDemo = dynamic(() => import("@/components/landing/ai-demo"));

export default function LandingPageClient() {
  return (
    <div className="min-h-screen bg-[#FBF2DE] text-[#2B2B2B] font-body antialiased overflow-x-hidden selection:bg-[#F2B33D]/30 selection:text-[#2B2B2B] relative">
      <Navbar />
      <Hero />
      <AIDemo />
      <Features />
      <Timeline />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}