"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FocusTodayProps {
  unreadEmails: number
  priorityEmails: number
  todaysMeetings: number
}

export function FocusToday({ unreadEmails, priorityEmails, todaysMeetings }: FocusTodayProps) {
  const actions = []

  if (priorityEmails > 0) {
    actions.push({ icon: "🔥", text: `Review ${priorityEmails} priority email${priorityEmails !== 1 ? "s" : ""}` })
  }
  if (unreadEmails > 0) {
    actions.push({ icon: "📨", text: `Clear ${unreadEmails} unread message${unreadEmails !== 1 ? "s" : ""}` })
  }
  if (todaysMeetings > 0) {
    actions.push({ icon: "📅", text: `Attend ${todaysMeetings} meeting${todaysMeetings !== 1 ? "s" : ""} today` })
  }
  actions.push({ icon: "⚡", text: "Check latest important conversations" })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <span className="text-2xl">{action.icon}</span>
            <span className="font-medium">{action.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
