"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { EmailList, InboxMessage as ListInboxMessage } from "@/components/inbox/email-list"
import { ThreadViewer } from "@/components/inbox/thread-viewer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { useUnreadCount } from "@/components/unread-context"
import { useIntegrationStatus } from "@/hooks/use-integration-status"
import { Logo } from "@/components/common/logo"
import { Mail, RefreshCw } from "lucide-react"

interface FullMessage {
  id: string
  threadId: string
  subject: string
  from: string
  body: string
  snippet: string
  createdAt: string
}

export default function InboxClient() {
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
  const { status: integrationStatus, loading: integrationLoading } = useIntegrationStatus()

  // Ref to protect against React state race conditions when quickly switching selected threads
  const latestSelectedIdRef = useRef<string | null>(null)

  useEffect(() => {
    latestSelectedIdRef.current = selectedMessageId
  }, [selectedMessageId])

  const fetchMessages = async () => {
    try {
      const hasCache = typeof window !== "undefined" && !!sessionStorage.getItem("inbox-cache-v1")
      if (!hasCache) {
        setListLoading(true)
      }
      setListError(null)
      
      const res = await fetch("/api/mail/messages")
      if (!res.ok) throw new Error("Failed to fetch messages")
      
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Failed to fetch messages")

      setEmails(result.data)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("inbox-cache-v1", JSON.stringify(result.data))
      }
    } catch (err) {
      const hasCache = typeof window !== "undefined" && !!sessionStorage.getItem("inbox-cache-v1")
      if (!hasCache) {
        setListError(err instanceof Error ? err.message : "An error occurred")
      } else {
        console.error("Failed to silently refresh inbox in background:", err)
      }
    } finally {
      setListLoading(false)
    }
  }

  const fetchMessage = useCallback(async (id: string) => {
    const threadCacheKey = `thread-cache-v1:${id}`
    let hasCache = false

    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(threadCacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (latestSelectedIdRef.current === id) {
            setSelectedMessage(parsed)
          }
          hasCache = true
        } catch (e) {
          // ignore parse error
        }
      }
    }

    try {
      if (!hasCache && latestSelectedIdRef.current === id) {
        setMessageLoading(true)
      }
      if (latestSelectedIdRef.current === id) {
        setMessageError(null)
      }
      
      const res = await fetch(`/api/mail/messages/${id}`)
      if (!res.ok) throw new Error("Failed to fetch message")
      
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Failed to fetch message")

      if (latestSelectedIdRef.current === id) {
        setSelectedMessage(result.data)
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem(threadCacheKey, JSON.stringify(result.data))
      }
    } catch (err) {
      if (latestSelectedIdRef.current === id) {
        if (!hasCache) {
          setMessageError(err instanceof Error ? err.message : "An error occurred")
        } else {
          console.error("Failed to silently refresh thread details:", err)
        }
      }
    } finally {
      if (latestSelectedIdRef.current === id) {
        setMessageLoading(false)
      }
    }
  }, [])

  const handleSnooze = useCallback(() => {
    setSnoozeUpdated(prev => prev + 1)
    setSelectedMessageId(null)
    setSelectedMessage(null)
  }, [])

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count)
  }, [setUnreadCount])

  useEffect(() => {
    const cached = sessionStorage.getItem("inbox-cache-v1")
    if (cached) {
      try {
        setEmails(JSON.parse(cached))
        setListLoading(false)
      } catch (e) {
        // ignore parse error
      }
    }
    fetchMessages()
  }, [])

  useEffect(() => {
    const handleRefresh = () => { fetchMessages() }
    window.addEventListener("refresh-inbox", handleRefresh)
    return () => window.removeEventListener("refresh-inbox", handleRefresh)
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "j") {
      e.preventDefault()
      const currentIndex = selectedMessageId ? emails.findIndex(email => email.id === selectedMessageId) : -1
      const nextIndex = Math.min(currentIndex + 1, emails.length - 1)
      if (nextIndex >= 0 && emails[nextIndex]) setSelectedMessageId(emails[nextIndex].id)
    } else if (e.key === "k") {
      e.preventDefault()
      const currentIndex = selectedMessageId ? emails.findIndex(email => email.id === selectedMessageId) : emails.length
      const prevIndex = Math.max(currentIndex - 1, 0)
      if (prevIndex >= 0 && emails[prevIndex]) setSelectedMessageId(emails[prevIndex].id)
    } else if (e.key === "Enter" && selectedMessageId) {
      e.preventDefault()
      fetchMessage(selectedMessageId)
    } else if (e.key === "Escape") {
      e.preventDefault()
      setSelectedMessage(null)
    }
  }, [selectedMessageId, emails, fetchMessage])

  useEffect(() => {
    if (selectedMessageId) {
      fetchMessage(selectedMessageId)
      setUnreadUpdated(prev => prev + 1)
    } else {
      setSelectedMessage(null)
    }
  }, [selectedMessageId, fetchMessage])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Show Gmail connection prompt if not connected
  if (!integrationLoading && integrationStatus && !integrationStatus.gmailConnected) {
    return (
      <div className="flex h-full gap-4">
        <Toaster />
        <Card className="w-full flex flex-col items-center justify-center border-dashed min-h-[400px]">
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-8 pb-8 max-w-sm mx-auto">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-md" />
              <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="size-7 text-primary/60" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold tracking-tight">Connect Gmail to get started</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your Gmail account to read emails, view threads, and use AI features.
              </p>
            </div>
            <Button onClick={() => window.location.href = "/api/corsair/gmail/connect"}>
              Connect Gmail
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-full gap-4">
      <Toaster />

      {/* Left Panel - Email List: hidden on mobile when a thread is open */}
      <div className={`
        w-full md:w-auto md:block
        ${selectedMessage || messageLoading || messageError ? "hidden md:block" : "block"}
      `}>
        <EmailList
          emails={emails}
          selectedEmailId={selectedMessageId ?? undefined}
          onSelect={setSelectedMessageId}
          loading={listLoading}
          error={listError}
          snoozeUpdated={snoozeUpdated}
          unreadUpdated={unreadUpdated}
          onUnreadCountChange={handleUnreadCountChange}
          onRetry={fetchMessages}
        />
      </div>

      {/* Right Panel - Thread Viewer: full-screen on mobile when open */}
      <div className={`
        flex-1 flex flex-col min-w-0
        ${selectedMessage || messageLoading || messageError ? "flex" : "hidden md:flex"}
      `}>
        {/* Mobile back button */}
        <div className="md:hidden mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => {
              setSelectedMessageId(null)
              setSelectedMessage(null)
            }}
          >
            ← Back to Inbox
          </Button>
        </div>

        {messageLoading ? (
          <Card className="flex-1 flex flex-col items-center justify-center p-8">
            <Logo width={64} height={64} className="animate-pulse mb-4" />
            <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading email details...</p>
          </Card>
        ) : messageError ? (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center space-y-3 pt-6">
              <p className="text-red-500 font-medium">Unable to load email.</p>
              <p className="text-sm text-muted-foreground">{messageError}</p>
              <Button variant="outline" size="sm" onClick={() => selectedMessageId && fetchMessage(selectedMessageId)} className="gap-2">
                <RefreshCw className="size-3.5" />
                Try Again
              </Button>
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
    </div>
  )
}
