"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AssistantMessage } from "@/types/assistant"
import { SendIcon, SparklesIcon, MailIcon, AlertCircleIcon, CheckSquareIcon, CalendarIcon } from "lucide-react"

const aiCards = [
  {
    title: "Inbox Summary",
    icon: <MailIcon className="size-5" />,
    content: "Get smart summaries of your inbox:\n• Daily recaps\n• Key insights\n• Productivity tips"
  },
  {
    title: "Priority Emails",
    icon: <AlertCircleIcon className="size-5" />,
    content: "AI identifies what's important:\n• Key senders\n• Urgent messages\n• Follow-ups"
  },
  {
    title: "Action Items",
    icon: <CheckSquareIcon className="size-5" />,
    content: "Extract tasks from emails:\n• To-dos\n• Deadlines\n• Meetings"
  },
  {
    title: "Today's Schedule",
    icon: <CalendarIcon className="size-5" />,
    content: "Plan your day with AI:\n• Calendar events\n• Email context\n• Prep notes"
  }
]

export default function BriefingPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Call the API
    try {
      const response = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content }))
            .concat({ role: "user", content: input })
        })
      })
      
      const data = await response.json()
      
      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.error || "I'm sorry, something went wrong.",
        createdAt: new Date().toISOString(),
      }
      
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't generate a response. Please try again.",
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex items-center gap-2 shrink-0">
        <SparklesIcon className="size-6" />
        <h1 className="text-2xl font-bold">Briefing AI</h1>
        <Badge variant="secondary">BETA</Badge>
      </div>

      {messages.length === 0 ? (
        <>
          {/* AI Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            {aiCards.map((card) => (
              <Card key={card.title} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {card.icon}
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground whitespace-pre-line text-sm">
                    {card.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chat Workspace - Welcome State */}
          <Card className="flex flex-col h-[calc(100vh-320px)] min-h-[400px]">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-lg">Chat Workspace</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Welcome State */}
              <ScrollArea className="flex-1 p-6 min-h-0">
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="size-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Start a conversation with Briefing AI
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-6">
                    <Button
                      variant="secondary"
                      className="justify-start text-left"
                      onClick={() => setInput("Summarize today's emails")}
                    >
                      Summarize today's emails
                    </Button>
                    <Button
                      variant="secondary"
                      className="justify-start text-left"
                      onClick={() => setInput("What needs my attention?")}
                    >
                      What needs my attention?
                    </Button>
                    <Button
                      variant="secondary"
                      className="justify-start text-left"
                      onClick={() => setInput("What meetings do I have today?")}
                    >
                      What meetings do I have today?
                    </Button>
                    <Button
                      variant="secondary"
                      className="justify-start text-left"
                      onClick={() => setInput("Show unread emails")}
                    >
                      Show unread emails
                    </Button>
                    <Button
                      variant="secondary"
                      className="justify-start text-left"
                      onClick={() => setInput("Show priority emails")}
                    >
                      Show priority emails
                    </Button>
                    <Button
                      variant="secondary"
                      className="justify-start text-left"
                      onClick={() => setInput("Draft a reply to the latest email")}
                    >
                      Draft reply to latest email
                    </Button>
                    <Button
                      variant="secondary"
                      className="justify-start text-left"
                      onClick={() => setInput("Prepare me for today's meetings")}
                    >
                      Prepare me for today's meetings
                    </Button>
                    <Button
                      variant="secondary"
                      className="justify-start text-left"
                      onClick={() => setInput("What are my action items?")}
                    >
                      What are my action items?
                    </Button>
                  </div>
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask Briefing AI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button onClick={handleSendMessage}>
                    <SendIcon className="size-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // Chat Workspace - Chat State
        <Card className="flex flex-col h-[calc(100vh-120px)] min-h-[400px]">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-lg">Chat Workspace</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6 min-h-0">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Briefing AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button onClick={handleSendMessage}>
                  <SendIcon className="size-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
