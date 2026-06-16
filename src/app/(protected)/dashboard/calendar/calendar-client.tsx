"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIntegrationStatus } from "@/hooks/use-integration-status"
import { Logo } from "@/components/common/logo"

interface CalendarEvent {
  id: string
  summary?: string
  start?: string
  end?: string
  description?: string
}

export default function CalendarClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasCache, setHasCache] = useState(false)
  const { status: integrationStatus, loading: integrationLoading } = useIntegrationStatus()

  const fetchEvents = async () => {
    try {
      const cacheExists = typeof window !== "undefined" && sessionStorage.getItem("calendar-events-v1") !== null
      if (!cacheExists) {
        setLoading(true)
      }
      setError(null)
      
      const res = await fetch("/api/calendar/events")
      if (!res.ok) throw new Error("Failed to fetch events")
      
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Failed to fetch events")

      setEvents(result.data)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("calendar-events-v1", JSON.stringify(result.data))
        setHasCache(true)
      }
    } catch (err) {
      const cacheExists = typeof window !== "undefined" && sessionStorage.getItem("calendar-events-v1") !== null
      if (!cacheExists) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } else {
        console.error("Failed to silently refresh calendar events in background:", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("calendar-events-v1")
      if (cached) {
        try {
          setEvents(JSON.parse(cached))
          setLoading(false)
          setHasCache(true)
        } catch (e) {
          // ignore parse error
        }
      }
    }
    fetchEvents()
  }, [])

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "No time"
    return new Date(dateStr).toLocaleString()
  }

  const showLoader = (loading || integrationLoading) && !hasCache
  const showConnectionPrompt = !integrationLoading && !integrationStatus?.calendarConnected

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Calendar</h1>
      
      {showLoader ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <Logo width={64} height={64} className="animate-pulse" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading calendar events...</p>
        </div>
      ) : showConnectionPrompt ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-8 pb-8 max-w-md mx-auto select-none">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-md" />
              <Logo width={64} height={64} className="opacity-40 relative" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">Connect Google Calendar</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your calendar to view events, manage your daily schedule, and prepare for upcoming meetings with Briefly AI.
              </p>
            </div>
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
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-8 pb-8 max-w-sm mx-auto select-none">
            <div className="relative animate-in zoom-in duration-300">
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-md" />
              <Logo width={64} height={64} className="opacity-30 relative" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground/80 tracking-tight">No Upcoming Events</p>
              <p className="text-sm text-muted-foreground">Your schedule is clear. Enjoy your day!</p>
            </div>
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
