"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CalendarEvent {
  id: string
  summary?: string
  start?: string
  end?: string
  description?: string
}

interface TodaysScheduleProps {
  events: CalendarEvent[]
}

export function TodaysSchedule({ events }: TodaysScheduleProps) {
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
      <Card>
        <CardContent className="p-6 space-y-3">
          {events.length === 0 ? (
            <p className="text-muted-foreground">No meetings scheduled today</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className="text-sm font-medium text-muted-foreground min-w-[80px]">
                  {formatTime(event.start)}
                </div>
                <div className="font-medium">{event.summary || "Untitled Event"}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
