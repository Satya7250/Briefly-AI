"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AssistantMessage } from "@/types/assistant"
import { BriefingRenderer, parseBriefingContent } from "@/components/briefing-renderer"
import { Logo } from "@/components/common/logo"
import { 
  SendIcon, 
  SparklesIcon, 
  MailIcon, 
  AlertCircleIcon, 
  CheckSquareIcon, 
  CalendarIcon, 
  ArrowRightIcon 
} from "lucide-react"

const aiCards = [
  {
    title: "Inbox Summary",
    icon: <MailIcon className="size-4.5 text-[#8B5CF6]" />,
    content: "Get smart summaries of your inbox:\n• Daily recaps\n• Key insights\n• Productivity tips"
  },
  {
    title: "Priority Emails",
    icon: <AlertCircleIcon className="size-4.5 text-red-500" />,
    content: "AI identifies what's important:\n• Key senders\n• Urgent messages\n• Follow-ups"
  },
  {
    title: "Action Items",
    icon: <CheckSquareIcon className="size-4.5 text-amber-500" />,
    content: "Extract tasks from emails:\n• To-dos\n• Deadlines\n• Meetings"
  },
  {
    title: "Today's Schedule",
    icon: <CalendarIcon className="size-4.5 text-blue-500" />,
    content: "Plan your day with AI:\n• Calendar events\n• Email context\n• Prep notes"
  }
]

const suggestionPrompts = [
  { text: "Summarize unread emails", icon: <MailIcon className="size-4 text-[#8B5CF6]" /> },
  { text: "What's on my calendar?", icon: <CalendarIcon className="size-4 text-blue-500" /> },
  { text: "What needs my attention?", icon: <AlertCircleIcon className="size-4 text-red-500" /> }
]

const thinkingStates = [
  "🧠 AI is thinking...",
  "📬 Analyzing inbox...",
  "📅 Reviewing calendar...",
  "⚡ Prioritizing important items...",
  "✍️ Generating briefing..."
]

function ThinkingState() {
  const [thinkingIndex, setThinkingIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % thinkingStates.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-4 p-2 transition-all duration-300">
      <div className="flex items-center gap-3 text-sm font-medium text-foreground/75">
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#8B5CF6]/80 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]"></span>
        </div>
        <span className="font-mono text-xs tracking-wide text-[#8B5CF6] dark:text-[#8B5CF6]/90 font-semibold animate-pulse">
          {thinkingStates[thinkingIndex]}
        </span>
      </div>
      <div className="space-y-3 mt-1.5 max-w-[480px]">
        <div className="h-3 bg-muted rounded-full w-[95%] animate-[pulse_1.5s_infinite_0ms]" />
        <div className="h-3 bg-muted rounded-full w-[85%] animate-[pulse_1.5s_infinite_150ms]" />
        <div className="h-3 bg-muted rounded-full w-[60%] animate-[pulse_1.5s_infinite_300ms]" />
      </div>
    </div>
  )
}

export default function BriefingClient() {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeStreamingId, setActiveStreamingId] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages or content streams
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data?.displayName) {
            const first = json.data.displayName.split(" ")[0]
            setUserName(first)
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile name:", err)
      }
    }
    fetchProfile()
  }, [])

  // Fetch cached briefing instantly on mount if available
  useEffect(() => {
    const loadCachedBriefing = async () => {
      try {
        const response = await fetch("/api/ai/briefing/cached")
        if (response.ok) {
          const data = await response.json()
          if (data.briefing) {
            setMessages([
              {
                id: "cached-briefing",
                role: "assistant",
                content: data.briefing,
                createdAt: new Date().toISOString(),
              }
            ])
          }
        }
      } catch (err) {
        console.error("Failed to load cached briefing on mount:", err)
      }
    }
    loadCachedBriefing()
  }, [])

  // Determine user local hour greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  // Extract dynamic counts from the latest assistant message
  const summaryText = useMemo(() => {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant" && m.content)
    if (lastAssistant) {
      try {
        const { sections } = parseBriefingContent(lastAssistant.content)
        const emailCount = sections.find(s => s.key === "priority")?.items.length || 0
        const followUpCount = sections.find(s => s.key === "follow_ups")?.items.length || 0
        return `You have ${emailCount} priority email${emailCount === 1 ? "" : "s"} and ${followUpCount} follow-up${followUpCount === 1 ? "" : "s"} requiring attention.`
      } catch (e) {
        return "Review your personalized daily brief summary below."
      }
    }
    return "Your dynamic AI-generated summary will load once the briefing is generated."
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantPlaceholder: AssistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, assistantPlaceholder])
    setActiveStreamingId(assistantMessageId)

    try {
      const payloadMessages = messages.map(m => ({ role: m.role, content: m.content }))
        .concat({ role: "user", content: text })

      const response = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages })
      })

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        
        if (chunkValue) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunkValue }
                : msg
            )
          )
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: `I'm sorry, I couldn't generate a response: ${error.message || "Unknown error"}` }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
      setActiveStreamingId(null)
    }
  }

  const handleSendMessage = () => {
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-background p-4 md:p-6 gap-6 transition-all duration-300 text-foreground">
      {/* Dynamic Time-Based Hero Header */}
      <div className="flex flex-col gap-1.5 shrink-0 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground select-none">
              {greeting}, {userName || "there"} 👋
            </h1>
            <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">BETA</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground/80 font-medium">
          {summaryText}
        </p>
      </div>

      {messages.length === 0 ? (
        <>
          {/* AI Feature Cards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 transition-all duration-500 ease-out animate-in fade-in slide-in-from-top-4">
            {aiCards.map((card, idx) => (
              <Card 
                key={card.title} 
                className="flex flex-col border border-border shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#8B5CF6]/30 transition-all duration-300 bg-card rounded-2xl"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <CardHeader className="pb-2 pt-4 px-5 select-none">
                  <CardTitle className="flex items-center gap-2.5 text-[14px] font-bold text-foreground/90 tracking-tight">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#8B5CF6]/10">
                      {card.icon}
                    </span>
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-5 pb-4.5 pt-0">
                  <div className="space-y-1.5 mt-1">
                    {card.content.split("\n").map((line, lIdx) => {
                      if (line.startsWith("•")) {
                        return (
                          <div key={lIdx} className="flex items-center gap-2 text-[12px] text-muted-foreground leading-normal font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/85 shrink-0" />
                            <span>{line.replace("•", "").trim()}</span>
                          </div>
                        )
                      }
                      return (
                        <p key={lIdx} className="text-[12.5px] font-medium text-foreground/75 mb-2.5 leading-snug">
                          {line}
                        </p>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Welcome State Command Center */}
          <Card className="flex flex-col h-[calc(100vh-320px)] min-h-[400px] border border-border shadow-sm overflow-hidden bg-card/30 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-3 pt-4 px-6 border-b border-border shrink-0 select-none">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">AI Workspace</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-6 min-h-0">
                <div className="h-full flex flex-col items-center justify-center py-6 text-center space-y-7">
                  <div className="flex flex-col items-center space-y-3.5 max-w-md animate-in fade-in duration-300">
                    <div className="relative animate-in zoom-in duration-500">
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-indigo-500 opacity-20 blur-md animate-pulse" />
                      <div className="relative p-2.5 rounded-full bg-gradient-to-tr from-[#8B5CF6]/10 to-indigo-600/10 text-[#8B5CF6] shadow-lg border border-[#8B5CF6]/25 bg-card">
                        <Logo width={50} height={50} className="animate-pulse" priority />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Meet Briefly</h2>
                    <p className="text-muted-foreground/85 text-xs md:text-[13px] leading-relaxed">
                      Your intelligent dashboard assistant. Ask to summarize agenda events, review pending action items, draft email responses, or highlight critical notifications.
                    </p>
                  </div>
                  
                  {/* Premium Suggestion Prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-3">
                    {suggestionPrompts.map((prompt, idx) => (
                      <button
                        key={prompt.text}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:bg-[#8B5CF6]/5 hover:border-[#8B5CF6]/35 hover:shadow-sm text-left text-xs md:text-sm transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer"
                        style={{ animationDelay: `${idx * 50}ms` }}
                        onClick={() => sendMessage(prompt.text)}
                      >
                        <div className="flex items-center gap-3 pr-2">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-background group-hover:bg-[#8B5CF6]/10 transition-colors">
                            {prompt.icon}
                          </span>
                          <span className="font-semibold text-foreground/80 group-hover:text-foreground/95 transition-colors text-[12.5px] tracking-tight">{prompt.text}</span>
                        </div>
                        <ArrowRightIcon className="size-3.5 text-muted-foreground/0 group-hover:text-[#8B5CF6] group-hover:translate-x-0.5 transition-all duration-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {/* Chat Input Field pinned to bottom */}
              <div className="p-4.5 border-t border-border bg-card shrink-0">
                <div className="relative flex items-center w-full max-w-3xl mx-auto rounded-2xl border border-border bg-background shadow-md focus-within:ring-2 focus-within:ring-[#8B5CF6]/15 focus-within:border-[#8B5CF6]/40 transition-all duration-200 p-1.5">
                  <SparklesIcon className="size-4 text-[#8B5CF6]/60 ml-3.5 shrink-0" />
                  <input
                    placeholder="Ask Briefing AI to summarize, plan or draft..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-3 py-2 text-[13.5px] placeholder:text-muted-foreground/60 text-foreground"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !input.trim()}
                    className="h-8.5 w-8.5 rounded-xl p-0 bg-[#8B5CF6] hover:bg-[#7c4dff] text-white shadow-sm transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <SendIcon className="size-3.5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // Chat Workspace - Chat messages
        <Card className="flex flex-col h-[calc(100vh-140px)] min-h-[400px] border border-border shadow-sm overflow-hidden bg-card/30 backdrop-blur-sm rounded-2xl animate-in fade-in duration-300">
          <CardHeader className="pb-3 pt-4 px-6 border-b border-border shrink-0 select-none">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Scroll Area */}
            <ScrollArea className="flex-1 p-4 md:p-6 min-h-0">
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3.5 items-start ${
                      message.role === "user" ? "justify-end animate-in slide-in-from-right-3" : "justify-start animate-in slide-in-from-left-3"
                    } duration-300`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="size-8 shrink-0 shadow-sm border border-[#8B5CF6]/20 bg-gradient-to-tr from-[#8B5CF6] to-indigo-500 text-white select-none">
                        <AvatarFallback className="bg-transparent text-white font-bold flex items-center justify-center">
                          <SparklesIcon className="size-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`p-4.5 rounded-2xl transition-all duration-300 ${
                        message.role === "user"
                          ? "bg-[#8B5CF6] text-white border border-transparent rounded-tr-none max-w-[85%] shadow-md shadow-[#8B5CF6]/10 text-[13.5px] leading-relaxed font-semibold"
                          : "bg-card text-card-foreground border border-border rounded-tl-none w-full max-w-none shadow-[0_2px_12px_-5px_rgba(0,0,0,0.03)]"
                      }`}
                    >
                      {message.role === "assistant" && message.content === "" && isLoading ? (
                        <ThinkingState />
                      ) : (
                        <>
                          {message.role === "assistant" ? (
                            <BriefingRenderer
                              content={message.content}
                              createdAt={message.createdAt}
                              isStreaming={message.id === activeStreamingId}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          )}
                          
                          {message.role === "assistant" && message.id === activeStreamingId && (
                            <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-[#27272A] text-[9px] text-muted-foreground/80 animate-pulse font-bold tracking-widest uppercase select-none">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }} />
                                <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }} />
                                <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce" />
                              </div>
                              <span>Streaming Live Insights...</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="size-8 shrink-0 shadow-sm border border-border select-none">
                        <AvatarFallback className="font-bold bg-muted text-muted-foreground/90 text-[11px]">U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input field pinned to bottom */}
            <div className="p-4.5 border-t border-border bg-card shrink-0">
              <div className="relative flex items-center w-full max-w-3xl mx-auto rounded-2xl border border-border bg-background shadow-md focus-within:ring-2 focus-within:ring-[#8B5CF6]/15 focus-within:border-[#8B5CF6]/40 transition-all duration-200 p-1.5">
                <SparklesIcon className="size-4 text-[#8B5CF6]/60 ml-3.5 shrink-0" />
                <input
                  placeholder="Ask Briefing AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-3 py-2 text-[13.5px] placeholder:text-muted-foreground/60 text-foreground"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !input.trim()}
                  className="h-8.5 w-8.5 rounded-xl p-0 bg-[#8B5CF6] hover:bg-[#7c4dff] text-white shadow-sm transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                >
                  <SendIcon className="size-3.5" />
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
