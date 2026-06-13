"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface InboxMessage {
  id: string
  threadId: string
  subject: string
  from: string
  snippet: string
  createdAt: string
  priority: "high" | "normal"
  isUnread: boolean
}

interface NeedsAttentionProps {
  emails: InboxMessage[]
}

export function NeedsAttention({ emails }: NeedsAttentionProps) {
  return (
    <div className="lg:col-span-2">
      <h2 className="text-lg font-semibold mb-4">Needs Attention</h2>
      <Card>
        <CardContent className="p-0">
          {emails.length === 0 ? (
            <div className="p-6 text-center space-y-1">
              <p className="text-muted-foreground">No emails need attention</p>
              <p className="text-sm text-muted-foreground">Great job staying on top of things!</p>
            </div>
          ) : (
            emails.map((email) => (
              <div key={email.id} className="p-4 border-b last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{email.from}</div>
                    {email.isUnread && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(email.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 truncate">{email.subject}</div>
                  <Badge variant={email.priority === "high" ? "destructive" : "secondary"}>
                    {email.priority === "high" ? "HIGH" : "NORMAL"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
