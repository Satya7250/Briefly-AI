"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSnoozes } from "@/lib/snooze"
import { getUnreadState } from "@/lib/unread"
import { GreetingCard } from "@/components/dashboard/greeting-card"
import { FocusToday } from "@/components/dashboard/focus-today"
import { NeedsAttention } from "@/components/dashboard/needs-attention"
import { TodaysSchedule } from "@/components/dashboard/todays-schedule"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useIntegrationStatus } from "@/hooks/use-integration-status"
import { Button } from "@/components/ui/button"

const HIGH_PRIORITY_SENDERS = [
  "github",
  "google",
  "cursor",
  "corsair",
  "stripe",
  "vercel",
  "openai",
]

interface InboxMessage {
  id: string
  threadId: string
  subject: string
  from: string
  snippet: string
  createdAt: string
}

interface CalendarEvent {
  id: string
  summary?: string
  start?: string
  end?: string
  description?: string
}

export default function DashboardPage() {
  const [emails, setEmails] = useState<InboxMessage[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [unreadState, setUnreadState] = useState<Record<string, boolean>>({})
  const { status: integrationStatus } = useIntegrationStatus()

  // Update now periodically to check expired snoozes
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Refresh unread state
  useEffect(() => {
    setUnreadState(getUnreadState())
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [messagesRes, eventsRes] = await Promise.all([
        fetch("/api/mail/messages"),
        fetch("/api/calendar/events"),
      ])
      
      if (!messagesRes.ok) throw new Error("Failed to fetch messages")
      const messagesResult = await messagesRes.json()
      if (!messagesResult.success) throw new Error(messagesResult.error || "Failed to fetch messages")
      setEmails(messagesResult.data)

      if (eventsRes.ok) {
        const eventsResult = await eventsRes.json()
        if (eventsResult.success) {
          setEvents(eventsResult.data)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const emailsWithPriority = useMemo(() => {
    return emails.map((email) => {
      const isHighPriority = HIGH_PRIORITY_SENDERS.some((sender) =>
        email.from.toLowerCase().includes(sender.toLowerCase())
      )
      const isUnread = unreadState[email.id] ?? true
      return { ...email, priority: isHighPriority ? "high" : "normal", isUnread }
    })
  }, [emails, unreadState])

  const metrics = useMemo(() => {
    const totalEmails = emails.length
    const unreadEmails = emailsWithPriority.filter(e => e.isUnread).length
    const priorityEmails = emailsWithPriority.filter(e => e.priority === "high").length
    const snoozedEmails = Object.entries(getSnoozes()).filter(([id, time]) => 
      Date.now() < time
    ).length

    return { totalEmails, unreadEmails, priorityEmails, snoozedEmails }
  }, [emails, emailsWithPriority, now])

  const needsAttentionEmails = useMemo(() => {
    return [...emailsWithPriority]
      .filter(e => e.isUnread || e.priority === "high")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [emailsWithPriority])

  const todaysEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return events
      .filter(event => {
        if (!event.start) return false
        const eventDate = new Date(event.start)
        return eventDate >= today && eventDate < tomorrow
      })
      .sort((a, b) => {
        if (!a.start) return 1
        if (!b.start) return -1
        return new Date(a.start).getTime() - new Date(b.start).getTime()
      })
  }, [events])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card>
          <CardContent className="text-center space-y-2 pt-6">
            <p className="text-red-500 font-medium">Unable to load dashboard.</p>
            <p className="text-sm text-muted-foreground">Please try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Calendar Banner */}
      {!integrationStatus?.calendarConnected && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-semibold mb-1">Google Calendar not connected</h3>
                <p className="text-muted-foreground mb-0">
                  Connect Calendar to view today's meetings, create events from emails, and get calendar insights
                </p>
              </div>
              <Button onClick={() => window.location.href = "/api/corsair/googlecalendar/connect"}>
                Connect Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Greeting */}
      <GreetingCard 
        unreadEmails={metrics.unreadEmails}
        priorityEmails={metrics.priorityEmails}
        snoozedEmails={metrics.snoozedEmails}
        todaysMeetings={todaysEvents.length}
      />

      {/* Focus Today */}
      <FocusToday 
        unreadEmails={metrics.unreadEmails}
        priorityEmails={metrics.priorityEmails}
        todaysMeetings={todaysEvents.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Attention */}
        <NeedsAttention emails={needsAttentionEmails} />

        {/* Today's Schedule */}
        <TodaysSchedule events={todaysEvents} />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Inbox Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Inbox Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalEmails}</div>
            </CardContent>
          </Card>
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unread Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.unreadEmails}</div>
            </CardContent>
          </Card>
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Priority Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.priorityEmails}</div>
            </CardContent>
          </Card>
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Snoozed Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.snoozedEmails}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
