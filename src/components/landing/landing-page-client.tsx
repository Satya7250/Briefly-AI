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
    <div className="min-h-screen bg-[#F8F8F8] text-[#111111] font-sans antialiased overflow-x-hidden selection:bg-[#6D5EF8]/10 selection:text-[#6D5EF8] relative">
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
