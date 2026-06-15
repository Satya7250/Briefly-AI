import type { Metadata } from "next";
import InboxClient from "./inbox-client";

export const metadata: Metadata = {
  title: "Inbox • Briefly",
};

export default function Page() {
  return <InboxClient />;
}
