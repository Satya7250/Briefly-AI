import type { Metadata } from "next";
import CalendarClient from "./calendar-client";

export const metadata: Metadata = {
  title: "Calendar • Briefly",
};

export default function Page() {
  return <CalendarClient />;
}
