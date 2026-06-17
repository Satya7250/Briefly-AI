"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function ComposeDialog() {
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ to?: string; subject?: string; body?: string }>
      if (customEvent.detail) {
        setTo(customEvent.detail.to || "")
        setSubject(customEvent.detail.subject || "")
        setBody(customEvent.detail.body || "")
      } else {
        setTo("")
        setSubject("")
        setBody("")
      }
      setOpen(true)
    }

    window.addEventListener("open-compose-email", handleOpen)
    return () => window.removeEventListener("open-compose-email", handleOpen)
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!to || !subject || !body) {
      toast.error("Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send email")
      }

      toast.success("Email sent successfully!")
      setOpen(false)
      // Reset form
      setTo("")
      setSubject("")
      setBody("")
      
      // Emit event to refresh inbox list
      window.dispatchEvent(new CustomEvent("refresh-inbox"))
    } catch (err: any) {
      toast.error(err.message || "An error occurred while sending the email.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px] p-6 rounded-2xl bg-card border border-border text-foreground shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Compose Email</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Send a message to anyone using your integrated Gmail account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="to" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">To</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={loading}
              required
              className="bg-background border-border text-foreground rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Subject</Label>
            <Input
              id="subject"
              type="text"
              placeholder="What's this about?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              required
              className="bg-background border-border text-foreground rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Body</Label>
            <Textarea
              id="body"
              placeholder="Write your email here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
              required
              rows={6}
              className="bg-background border-border text-foreground rounded-xl min-h-[150px] resize-y"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#8B5CF6] hover:bg-[#7c4dff] text-white font-semibold rounded-xl min-w-[80px]"
            >
              {loading ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
