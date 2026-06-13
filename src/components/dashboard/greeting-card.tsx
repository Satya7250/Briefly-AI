"use client"

import { Card, CardContent } from "@/components/ui/card"

interface GreetingCardProps {
  unreadEmails: number
  priorityEmails: number
  snoozedEmails: number
  todaysMeetings: number
}

export function GreetingCard({ unreadEmails, priorityEmails, snoozedEmails, todaysMeetings }: GreetingCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{getGreeting()} 👋</h2>
        <div className="text-muted-foreground space-y-2">
          <p>You have:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{unreadEmails} unread email{unreadEmails !== 1 ? "s" : ""}</li>
            <li>{priorityEmails} priority email{priorityEmails !== 1 ? "s" : ""}</li>
            <li>{todaysMeetings} meeting{todaysMeetings !== 1 ? "s" : ""} today</li>
            <li>{snoozedEmails} snoozed email{snoozedEmails !== 1 ? "s" : ""}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
