"use client"

import { useState, useEffect, useCallback } from "react"
import { EmailList, InboxMessage as ListInboxMessage } from "@/components/inbox/email-list"
import { ThreadViewer } from "@/components/inbox/thread-viewer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import { useUnreadCount } from "@/components/unread-context"

interface FullMessage {
  id: string
  threadId: string
  subject: string
  from: string
  body: string
  snippet: string
  createdAt: string
}

export default function InboxPage() {
  const [emails, setEmails] = useState<ListInboxMessage[]>([])
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<FullMessage | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [messageLoading, setMessageLoading] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [snoozeUpdated, setSnoozeUpdated] = useState(0)
  const [unreadUpdated, setUnreadUpdated] = useState(0)
  const { setCount: setUnreadCount } = useUnreadCount()

  const fetchMessages = async () => {
    try {
      setListLoading(true)
      setListError(null)
      
      const res = await fetch("/api/mail/messages")
      if (!res.ok) throw new Error("Failed to fetch messages")
      
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Failed to fetch messages")

      setEmails(result.data)
    } catch (err) {
      setListError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setListLoading(false)
    }
  }

  const fetchMessage = async (id: string) => {
    try {
      setMessageLoading(true)
      setMessageError(null)
      
      const res = await fetch(`/api/mail/messages/${id}`)
      if (!res.ok) throw new Error("Failed to fetch message")
      
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Failed to fetch message")

      setSelectedMessage(result.data)
    } catch (err) {
      setMessageError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setMessageLoading(false)
    }
  }

  const handleSnooze = useCallback(() => {
    setSnoozeUpdated(prev => prev + 1)
    setSelectedMessageId(null)
    setSelectedMessage(null)
  }, [])

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count)
  }, [setUnreadCount])

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "j") {
      e.preventDefault()
      const currentIndex = selectedMessageId ? emails.findIndex(email => email.id === selectedMessageId) : -1
      const nextIndex = Math.min(currentIndex + 1, emails.length - 1)
      if (nextIndex >= 0 && emails[nextIndex]) {
        setSelectedMessageId(emails[nextIndex].id)
      }
    } else if (e.key === "k") {
      e.preventDefault()
      const currentIndex = selectedMessageId ? emails.findIndex(email => email.id === selectedMessageId) : emails.length
      const prevIndex = Math.max(currentIndex - 1, 0)
      if (prevIndex >= 0 && emails[prevIndex]) {
        setSelectedMessageId(emails[prevIndex].id)
      }
    } else if (e.key === "Enter" && selectedMessageId) {
      e.preventDefault()
      fetchMessage(selectedMessageId)
    } else if (e.key === "Escape") {
      e.preventDefault()
      setSelectedMessage(null)
    }
  }, [selectedMessageId, emails])

  useEffect(() => {
    if (selectedMessageId) {
      fetchMessage(selectedMessageId)
      setUnreadUpdated(prev => prev + 1)
    } else {
      setSelectedMessage(null)
    }
  }, [selectedMessageId])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex h-full gap-4">
      <Toaster />
      {/* Left Panel - Email List */}
      <EmailList
        emails={emails}
        selectedEmailId={selectedMessageId ?? undefined}
        onSelect={setSelectedMessageId}
        loading={listLoading}
        error={listError}
        snoozeUpdated={snoozeUpdated}
        unreadUpdated={unreadUpdated}
        onUnreadCountChange={handleUnreadCountChange}
      />

      {/* Right Panel - Thread Viewer */}
      {messageLoading ? (
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ) : messageError ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center space-y-2">
            <p className="text-red-500 font-medium">Unable to load email.</p>
            <p className="text-sm text-muted-foreground">Please try again.</p>
          </CardContent>
        </Card>
      ) : selectedMessage ? (
        <ThreadViewer
          subject={selectedMessage.subject}
          sender={selectedMessage.from}
          body={selectedMessage.body}
          messageId={selectedMessage.id}
          onSnooze={handleSnooze}
        />
      ) : (
        <ThreadViewer />
      )}
    </div>
  )
}
