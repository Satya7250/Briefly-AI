"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Button variant="secondary" className="w-full" onClick={() => router.push("/dashboard/inbox")}>
          Compose Email
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => router.push("/dashboard/calendar")}>
          Create Meeting
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => router.push("/dashboard/calendar")}>
          Open Calendar
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => router.push("/dashboard/briefing")}>
          Ask Briefly AI
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => router.push("/dashboard/inbox")}>
          Search Inbox
        </Button>
      </div>
    </div>
  )
}
