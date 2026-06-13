"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useIntegrationStatus } from "@/hooks/use-integration-status"

interface CalendarEvent {
  id: string
  summary?: string
  start?: string
  end?: string
  description?: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { status: integrationStatus, loading: integrationLoading } = useIntegrationStatus()

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch("/api/calendar/events")
      if (!res.ok) throw new Error("Failed to fetch events")
      
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Failed to fetch events")

      setEvents(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "No time"
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      
      {loading || integrationLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !integrationStatus?.calendarConnected ? (
        <Card>
          <CardContent className="text-center space-y-4 pt-6">
            <h3 className="text-lg font-semibold">Connect Google Calendar</h3>
            <p className="text-muted-foreground">Connect your calendar to view events, manage your schedule, and create meetings from emails</p>
            <Button onClick={() => window.location.href = "/api/corsair/googlecalendar/connect"}>
              Connect Calendar
            </Button>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-center space-y-2 pt-6">
            <p className="text-red-500 font-medium">Unable to load calendar events.</p>
            <p className="text-sm text-muted-foreground">Please try again.</p>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="text-center space-y-1 pt-6">
            <p className="text-muted-foreground">No upcoming events</p>
            <p className="text-sm text-muted-foreground">Your calendar is clear</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="text-lg">{event.summary || "Untitled Event"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.start && (
                  <p className="text-sm text-muted-foreground">
                    Start: {formatTime(event.start)}
                  </p>
                )}
                {event.end && (
                  <p className="text-sm text-muted-foreground">
                    End: {formatTime(event.end)}
                  </p>
                )}
                {event.description && (
                  <p className="text-sm">{event.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
