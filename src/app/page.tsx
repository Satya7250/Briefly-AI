import type { Metadata } from "next";
import LandingPageClient from "@/components/landing/landing-page-client";

export const metadata: Metadata = {
  title: "Briefly — AI Email & Calendar Workspace",
};

export default function Page() {
  return <LandingPageClient />;
}
