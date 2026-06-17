"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BriefingRenderer } from "@/components/briefing-renderer"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CalendarEvent {
  id: string
  summary?: string
  start?: string
  end?: string
  description?: string
}

interface UpcomingMeetingsProps {
  events: CalendarEvent[]
}

export function UpcomingMeetings({ events }: UpcomingMeetingsProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [briefing, setBriefing] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }

  const handlePrepare = async (event: CalendarEvent) => {
    setSelectedEvent(event)
    setBriefing(null)
    setLoading(true)
    setOpen(true)

    try {
      const res = await fetch("/api/meetings/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to prepare meeting briefing")
      }

      setBriefing(result.data)
    } catch (err: any) {
      toast.error(err.message || "Could not generate meeting prep notes.")
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upcoming Meetings</h2>
      <Card>
        <CardContent className="p-6 space-y-4">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming meetings scheduled</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-sm font-semibold text-muted-foreground min-w-[70px] select-none">
                    {formatTime(event.start)}
                  </div>
                  <div className="font-semibold text-sm truncate">{event.summary || "Untitled Event"}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePrepare(event)}
                  className="rounded-xl shrink-0 gap-1.5 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/30 cursor-pointer"
                >
                  <Sparkles className="size-3.5 text-[#8B5CF6]" />
                  <span>Prepare</span>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-6 rounded-2xl bg-card border border-border text-foreground shadow-xl">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2 select-none text-foreground">
              <Sparkles className="size-5 text-[#8B5CF6]" />
              <span>Meeting Prep: {selectedEvent?.summary || "Untitled Event"}</span>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 mt-4 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
                <Loader2 className="size-8 text-[#8B5CF6] animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse font-medium">Analyzing conversations and generating briefing...</p>
              </div>
            ) : briefing ? (
              <div className="py-2">
                <BriefingRenderer content={briefing} />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No briefing notes generated.
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
