import { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { isSnoozed } from "@/lib/snooze"
import { markEmailAsRead, getUnreadState } from "@/lib/unread"

import { SquarePen } from "lucide-react"

export interface InboxMessage {
  id: string
  threadId: string
  subject: string
  from: string
  snippet: string
  createdAt: string
}

const HIGH_PRIORITY_SENDERS = [
  "github",
  "google",
  "cursor",
  "corsair",
  "stripe",
  "vercel",
  "openai",
]

interface EmailListProps {
  emails: InboxMessage[]
  selectedEmailId?: string | null
  onSelect?: (id: string) => void
  loading?: boolean
  error?: string | null
  snoozeUpdated?: number
  unreadUpdated?: number
  onUnreadCountChange?: (count: number) => void
}

export function EmailList({ emails, selectedEmailId, onSelect, loading, error, snoozeUpdated, unreadUpdated, onUnreadCountChange }: EmailListProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "priority">("all")
  const [now, setNow] = useState(Date.now())
  const [unreadState, setUnreadState] = useState<Record<string, boolean>>({})

  const refreshUnreadState = useCallback(() => {
    const state = getUnreadState()
    setUnreadState(state)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setNow(Date.now())
  }, [snoozeUpdated])

  useEffect(() => {
    refreshUnreadState()
  }, [refreshUnreadState, unreadUpdated])

  const emailsWithPriority = useMemo(() => {
    return emails.map((email) => {
      const isHighPriority = HIGH_PRIORITY_SENDERS.some((sender) =>
        email.from.toLowerCase().includes(sender.toLowerCase())
      )
      const isUnread = unreadState[email.id] ?? true
      return { ...email, priority: isHighPriority ? "high" : "normal", isUnread }
    })
  }, [emails, unreadState])

  const counts = useMemo(() => {
    const nonSnoozed = emailsWithPriority.filter((email) => !isSnoozed(email.id))
    const allCount = nonSnoozed.length
    const unreadCount = nonSnoozed.filter((email) => email.isUnread).length
    const priorityCount = nonSnoozed.filter((email) => email.priority === "high").length
    return { all: allCount, unread: unreadCount, priority: priorityCount }
  }, [emailsWithPriority])

  useEffect(() => {
    onUnreadCountChange?.(counts.unread)
  }, [counts.unread, onUnreadCountChange])

  const filteredAndSortedEmails = useMemo(() => {
    let filtered = emailsWithPriority
    if (filter === "priority") {
      filtered = emailsWithPriority.filter((email) => email.priority === "high")
    } else if (filter === "unread") {
      filtered = emailsWithPriority.filter((email) => email.isUnread)
    }
    filtered = filtered.filter((email) => !isSnoozed(email.id))

    return filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [emailsWithPriority, filter, now])

  const handleSelect = useCallback((id: string) => {
    markEmailAsRead(id)
    refreshUnreadState()
    onSelect?.(id)
  }, [onSelect, refreshUnreadState])

  return (
    <Card className="w-[350px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inbox</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent("open-compose-email"))}
            className="size-8 rounded-full hover:bg-muted"
          >
            <SquarePen className="size-4.5" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({counts.all})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({counts.unread})
          </Button>
          <Button
            variant={filter === "priority" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("priority")}
          >
            Priority ({counts.priority})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {loading && (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="p-4 text-center space-y-2">
            <p className="text-red-500 font-medium">Unable to load emails.</p>
            <p className="text-sm text-muted-foreground">Please try again.</p>
          </div>
        )}
        {!loading && !error && filteredAndSortedEmails.length === 0 && (
          <div className="p-4 text-center space-y-1">
            <p className="text-muted-foreground">
              {filter === "priority"
                ? "No priority emails"
                : filter === "unread"
                ? "No unread emails"
                : "No emails in your inbox"}
            </p>
            {filter !== "all" && (
              <p className="text-sm text-muted-foreground">Try switching to a different filter</p>
            )}
          </div>
        )}
        {!loading && !error && filteredAndSortedEmails.map((email) => (
          <div
            key={email.id}
            onClick={() => handleSelect(email.id)}
            className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${selectedEmailId === email.id ? "bg-muted" : ""}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">{email.from}</div>
                {email.isUnread && <div className="w-2 h-2 bg-primary rounded-full" />}
              </div>
              <Badge variant={email.priority === "high" ? "destructive" : "secondary"}>
                {email.priority === "high" ? "HIGH" : "NORMAL"}
              </Badge>
            </div>
            <div className={`text-sm ${email.isUnread ? "font-semibold" : "font-medium"} mb-1`}>{email.subject}</div>
            <div className="text-sm text-muted-foreground truncate">{email.snippet}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
