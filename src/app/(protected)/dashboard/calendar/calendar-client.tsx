"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIntegrationStatus } from "@/hooks/use-integration-status"
import { Logo } from "@/components/common/logo"
import { CalendarDays, RefreshCw, Clock } from "lucide-react"

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
  const [retrying, setRetrying] = useState(false)
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
      setRetrying(false)
    }
  }

  const handleRetry = () => {
    setRetrying(true)
    setError(null)
    fetchEvents()
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

  useEffect(() => {
    const handleRefresh = () => { fetchEvents() }
    window.addEventListener("refresh-calendar", handleRefresh)
    return () => window.removeEventListener("refresh-calendar", handleRefresh)
  }, [])

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "No time"
    return new Date(dateStr).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
  }

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return null
    const s = new Date(start)
    const e = new Date(end)
    const diffMs = e.getTime() - s.getTime()
    const diffMins = Math.round(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m`
    const h = Math.floor(diffMins / 60)
    const m = diffMins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const showLoader = (loading || integrationLoading) && !hasCache
  const showConnectionPrompt = !integrationLoading && !integrationStatus?.calendarConnected

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        {!showLoader && !showConnectionPrompt && !error && (
          <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying} className="gap-2">
            <RefreshCw className={`size-3.5 ${retrying ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>
      
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
              <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="size-7 text-primary/60" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold tracking-tight">Connect Google Calendar</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your calendar to view events, manage your schedule, and prepare for upcoming meetings with Briefly AI.
              </p>
            </div>
            <Button onClick={() => window.location.href = "/api/corsair/googlecalendar/connect"}>
              Connect Calendar
            </Button>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-center space-y-3 pt-6 pb-6">
            <p className="text-red-500 font-medium">Unable to load calendar events.</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying} className="gap-2">
              <RefreshCw className={`size-3.5 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Retrying..." : "Try Again"}
            </Button>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-8 pb-8 max-w-sm mx-auto select-none">
            <div className="relative animate-in zoom-in duration-300">
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-md" />
              <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="size-7 text-primary/40" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-foreground/80 tracking-tight">No Upcoming Events</p>
              <p className="text-sm text-muted-foreground">Your schedule is clear for the next 30 days. Enjoy your time!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => {
            const duration = formatDuration(event.start, event.end)
            return (
              <Card key={event.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{event.summary || "Untitled Event"}</p>
                      {event.start && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(event.start)}
                          {duration && <span className="ml-2 text-muted-foreground/60">· {duration}</span>}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    {event.start && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 mt-0.5">
                        <Clock className="size-3" />
                        <span>{new Date(event.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
