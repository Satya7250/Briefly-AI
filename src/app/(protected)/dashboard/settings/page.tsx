import type { Metadata } from "next";
import SettingsClient from "./settings-client";

export const metadata: Metadata = {
  title: "Settings • Briefly",
};

export default function Page() {
  return <SettingsClient />;
}
