import type { Metadata } from "next";
import BriefingClient from "./briefing-client";

export const metadata: Metadata = {
  title: "Briefly AI",
};

export default function Page() {
  return <BriefingClient />;
}
