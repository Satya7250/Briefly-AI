import type { Metadata } from "next";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: "Briefly",
};

export default function Page() {
  return <DashboardClient />;
}
