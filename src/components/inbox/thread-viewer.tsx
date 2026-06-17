import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState, useRef } from "react"
import { getSnoozeTime, getSnoozeLabel, setSnooze } from "@/lib/snooze"
import { toast } from "sonner"
import { EmailReader } from "./email-reader"
import { Logo } from "@/components/common/logo"

interface AISummary {
  summary: string[]
  actions: string[]
}

interface ThreadViewerProps {
  subject?: string
  sender?: string
  body?: string
  messageId?: string
  onSnooze?: () => void
}

export function ThreadViewer({ subject, sender, body, messageId, onSnooze }: ThreadViewerProps) {
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSubject, setLastSubject] = useState<string | null>(null)
  const [lastBody, setLastBody] = useState<string | null>(null)
  const [isAiSummaryCollapsed, setIsAiSummaryCollapsed] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({
        top: 0,
        behavior: "instant"
      })
    }
  }, [subject, messageId])

  useEffect(() => {
    if (!subject || !body) {
      setAiSummary(null)
      setLastSubject(null)
      setLastBody(null)
      return
    }

    if (subject === lastSubject && body === lastBody) {
      return
    }

    const fetchSummary = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: "SUMMARIZE_EMAIL",
            subject: subject, 
            body: body 
          }),
        });

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.details || data.error || "Failed to generate summary")
        }

        setAiSummary(data)
        setLastSubject(subject)
        setLastBody(body)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate summary")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [subject, body, lastSubject, lastBody])

  const handleSnooze = (option: "tonight" | "tomorrow" | "nextWeek") => {
    if (!messageId) return
    const snoozedUntil = getSnoozeTime(option)
    setSnooze(messageId, snoozedUntil)
    toast(`Email snoozed until ${getSnoozeLabel(option)}`)
    onSnooze?.()
  }

  if (!subject) {
    return (
      <Card className="flex-1 flex flex-col items-center justify-center p-8 border-dashed">
        <CardContent className="flex flex-col items-center text-center space-y-4 max-w-sm select-none">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/5 blur-md" />
            <Logo width={64} height={64} className="opacity-40 animate-pulse relative" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground/80 tracking-tight">No Conversation Selected</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select an email from the inbox list to view messages, drafts, and AI key points.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardHeader className="pb-4 border-b shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl md:text-2xl leading-tight">{subject}</CardTitle>
            {sender && <p className="text-sm text-muted-foreground">From: <span className="font-medium">{sender}</span></p>}
          </div>
          {messageId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Snooze</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSnooze("tonight")}>Tonight</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze("tomorrow")}>Tomorrow</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze("nextWeek")}>Next Week</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <div ref={threadRef} className="flex-1 overflow-y-auto outline-none" tabIndex={-1}>
        {(aiSummary || loading || error) && (
          <div className="p-4 border-b">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  </div>
                  <CardTitle className="text-sm font-semibold">AI Summary</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAiSummaryCollapsed(!isAiSummaryCollapsed)}>
                  {isAiSummaryCollapsed ? "Show" : "Hide"}
                </Button>
              </CardHeader>
              {!isAiSummaryCollapsed && (
                <CardContent className="pt-0 space-y-4">
                  {loading && <p className="text-sm text-muted-foreground">Generating AI Summary...</p>}
                  {error && <p className="text-sm text-muted-foreground">{error}</p>}
                  {aiSummary && !loading && !error && (
                    <>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                          {aiSummary.summary.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      {aiSummary.actions.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Action Items</h4>
                          <ul className="space-y-1.5 text-sm">
                            {aiSummary.actions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="mt-1 text-muted-foreground">•</div>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}

        <EmailReader html={body || ""} subject={subject} sender={sender} />
      </div>
    </Card>
  )
}
