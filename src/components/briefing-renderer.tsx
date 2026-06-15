"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SparklesIcon, CalendarIcon, MailIcon, ClockIcon, AlertCircleIcon, CheckSquareIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BriefingItem {
  title: string;
  meta: string;
  explanation: string;
  raw: string;
}

interface BriefingSection {
  title: string;
  icon: string;
  key: string;
  items: BriefingItem[];
  textLines: string[];
}

const sectionHeaders = [
  { keywords: ["priority emails", "needs attention", "priority"], title: "Priority Emails", icon: "🔥", key: "priority" },
  { keywords: ["upcoming meetings", "calendar events", "schedule", "meetings", "preparing you for"], title: "Upcoming Meetings", icon: "📅", key: "meetings" },
  { keywords: ["important follow-ups", "follow-ups", "follow-up", "important", "low priority"], title: "Important Follow-Ups", icon: "⏳", key: "follow_ups" },
  { keywords: ["suggested focus", "suggested", "focus"], title: "Suggested Focus", icon: "🎯", key: "focus" }
]

const sectionConfig: Record<string, {
  border: string;
  glow: string;
  badge: string;
  badgeBg: string;
  iconBg: string;
  topAccent: string;
}> = {
  priority: {
    border: "border-border hover:border-red-500/40",
    glow: "hover:shadow-[0_0_22px_-4px_rgba(239,68,68,0.1)]",
    badge: "text-red-400 border-red-500/20 bg-red-500/10",
    badgeBg: "bg-red-500/10 text-red-400",
    iconBg: "bg-red-500/10 text-red-400",
    topAccent: "from-red-500 to-rose-600",
  },
  meetings: {
    border: "border-border hover:border-blue-500/40",
    glow: "hover:shadow-[0_0_22px_-4px_rgba(59,130,246,0.1)]",
    badge: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    badgeBg: "bg-blue-500/10 text-blue-400",
    iconBg: "bg-blue-500/10 text-blue-400",
    topAccent: "from-blue-500 to-indigo-600",
  },
  follow_ups: {
    border: "border-border hover:border-amber-500/40",
    glow: "hover:shadow-[0_0_22px_-4px_rgba(245,158,11,0.1)]",
    badge: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    badgeBg: "bg-amber-500/10 text-amber-400",
    iconBg: "bg-amber-500/10 text-amber-400",
    topAccent: "from-amber-500 to-yellow-600",
  },
  focus: {
    border: "border-border hover:border-[#8B5CF6]/40",
    glow: "hover:shadow-[0_0_22px_-4px_rgba(139,92,246,0.1)]",
    badge: "text-[#8B5CF6] border-[#8B5CF6]/20 bg-[#8B5CF6]/10",
    badgeBg: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
    iconBg: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
    topAccent: "from-[#8B5CF6] to-purple-600",
  }
}

// Custom parser that processes inline markdown like **bold** and `code` without leaving raw markers
function renderInlineMarkdown(text: string) {
  if (!text) return ""
  
  const parts: React.ReactNode[] = []
  let currentIndex = 0
  
  while (currentIndex < text.length) {
    const boldIndex = text.indexOf("**", currentIndex)
    const codeIndex = text.indexOf("`", currentIndex)
    
    let nextMarkerIndex = -1
    let markerType: 'bold' | 'code' | null = null
    
    if (boldIndex !== -1 && (codeIndex === -1 || boldIndex < codeIndex)) {
      nextMarkerIndex = boldIndex
      markerType = 'bold'
    } else if (codeIndex !== -1) {
      nextMarkerIndex = codeIndex
      markerType = 'code'
    }
    
    if (nextMarkerIndex === -1) {
      parts.push(text.substring(currentIndex))
      break
    }
    
    if (nextMarkerIndex > currentIndex) {
      parts.push(text.substring(currentIndex, nextMarkerIndex))
    }
    
    if (markerType === 'bold') {
      const boldEndIndex = text.indexOf("**", nextMarkerIndex + 2)
      if (boldEndIndex === -1) {
        parts.push(
          <strong key={`bold-${nextMarkerIndex}`} className="font-semibold text-foreground dark:text-white">
            {text.substring(nextMarkerIndex + 2)}
          </strong>
        )
        break
      }
      parts.push(
        <strong key={`bold-${nextMarkerIndex}`} className="font-semibold text-foreground dark:text-white">
          {text.substring(nextMarkerIndex + 2, boldEndIndex)}
        </strong>
      )
      currentIndex = boldEndIndex + 2
    } else if (markerType === 'code') {
      const codeEndIndex = text.indexOf("`", nextMarkerIndex + 1)
      if (codeEndIndex === -1) {
        parts.push(
          <code key={`code-${nextMarkerIndex}`} className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-indigo-600 dark:text-indigo-350">
            {text.substring(nextMarkerIndex + 1)}
          </code>
        )
        break
      }
      parts.push(
        <code key={`code-${nextMarkerIndex}`} className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-indigo-600 dark:text-indigo-350">
          {text.substring(nextMarkerIndex + 1, codeEndIndex)}
        </code>
      )
      currentIndex = codeEndIndex + 1
    }
  }
  
  return parts
}

export function parseBriefingContent(content: string) {
  const lines = content.split("\n")
  let mainTitle = ""
  const sections: BriefingSection[] = []
  let currentSection: BriefingSection | null = null

  for (let line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Check for main title ##
    const mainHeaderMatch = trimmed.match(/^##\s+(.*)/)
    if (mainHeaderMatch) {
      mainTitle = mainHeaderMatch[1].replace(/\*\*|##|###/g, "").trim()
      continue
    }

    // Check for sub-section header ### or custom headers
    const subHeaderMatch = trimmed.match(/^###\s+(.*)/)
    let isHeading = false
    let headingText = ""

    if (subHeaderMatch) {
      isHeading = true
      headingText = subHeaderMatch[1].replace(/\*\*|##|###/g, "").trim()
    } else {
      const isCustomHeader = [
        "🔴 needs attention",
        "🟡 important",
        "⚪ low priority",
        "today's briefing",
        "today's schedule",
        "unread emails",
        "preparing you for today's meetings"
      ].some(h => trimmed.toLowerCase().includes(h))

      if (isCustomHeader && !trimmed.startsWith("*") && !trimmed.startsWith("•") && !trimmed.startsWith("-")) {
        isHeading = true
        headingText = trimmed.replace(/^(🔴|🟡|⚪)\s*/, "")
      }
    }

    if (isHeading) {
      const textLower = headingText.toLowerCase()
      const matchedConfig = sectionHeaders.find(sh =>
        sh.keywords.some(kw => textLower.includes(kw))
      )

      if (matchedConfig) {
        currentSection = {
          title: matchedConfig.title,
          icon: matchedConfig.icon,
          key: matchedConfig.key,
          items: [],
          textLines: []
        }
      } else {
        currentSection = {
          title: headingText,
          icon: "🧠",
          key: "focus", // Default to focus for styling purposes if unrecognized
          items: [],
          textLines: []
        }
      }
      sections.push(currentSection)
      continue
    }

    if (!currentSection) {
      currentSection = {
        title: "Suggested Focus",
        icon: "🎯",
        key: "focus",
        items: [],
        textLines: []
      }
      sections.push(currentSection)
    }

    const isBullet = trimmed.startsWith("*") || trimmed.startsWith("•") || trimmed.startsWith("-") || /^\d+\.\s+/.test(trimmed)

    if (isBullet) {
      const itemText = trimmed.replace(/^([*•-]\s*|\d+\.\s*)/, "")
      
      let boldMatch = itemText.match(/^\*\*([^*]+)\*\*(.*)/)
      if (!boldMatch && itemText.startsWith("**")) {
        boldMatch = [itemText, itemText.substring(2), ""] as any
      }

      if (boldMatch) {
        const title = boldMatch[1].trim()
        const remaining = boldMatch[2].trim()
        
        let meta = ""
        let explanation = remaining
        
        const fromAtMatch = remaining.match(/^(?:from|at|in)\s+([^\s-–—]+(?:[^\s-–—]*\s+[^\s-–—]+){0,2})/i)
        if (fromAtMatch) {
          meta = fromAtMatch[0].trim()
          explanation = remaining.substring(fromAtMatch[0].length).trim()
        }
        
        explanation = explanation.replace(/^[-–—:\s]+/, "").trim()
        
        currentSection.items.push({
          title,
          meta,
          explanation,
          raw: trimmed
        })
      } else {
        const parts = itemText.split(/\s*[-–—:]\s+/)
        if (parts.length > 1 && parts[0].length < 40) {
          currentSection.items.push({
            title: parts[0].trim(),
            meta: "",
            explanation: parts.slice(1).join(" - ").trim(),
            raw: trimmed
          })
        } else {
          currentSection.items.push({
            title: "",
            meta: "",
            explanation: itemText,
            raw: trimmed
          })
        }
      }
    } else {
      currentSection.textLines.push(trimmed)
    }
  }

  return { mainTitle, sections }
}

interface BriefingRendererProps {
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
}

export function BriefingRenderer({ content, createdAt, isStreaming }: BriefingRendererProps) {
  // Memoize parsing structure
  const { mainTitle, sections } = React.useMemo(() => {
    return parseBriefingContent(content)
  }, [content])

  const cursor = React.useMemo(() => {
    if (!isStreaming) return null
    return (
      <span className="inline-block w-[3px] h-[15px] ml-1 bg-[#8B5CF6] rounded-full animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)] align-middle" />
    )
  }, [isStreaming])

  // Format creation time
  const formattedTime = React.useMemo(() => {
    if (!createdAt) return ""
    try {
      const date = new Date(createdAt)
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    } catch {
      return ""
    }
  }, [createdAt])

  // Verify if content parsed matches expected briefing dashboard structure
  const isStructured = React.useMemo(() => {
    return sections.length > 1 || (sections.length === 1 && sections[0].key !== "detail" && sections[0].items.length > 0)
  }, [sections])

  // Find exact cursor location index
  const cursorLoc = React.useMemo(() => {
    if (!isStreaming) return null
    if (sections.length === 0) return { type: "main_title" }
    
    const lastSecIdx = sections.length - 1
    const lastSec = sections[lastSecIdx]
    
    if (lastSec.items.length > 0) {
      return {
        type: "item",
        sectionIdx: lastSecIdx,
        itemIdx: lastSec.items.length - 1
      }
    } else if (lastSec.textLines.length > 0) {
      return {
        type: "line",
        sectionIdx: lastSecIdx,
        lineIdx: lastSec.textLines.length - 1
      }
    } else {
      return {
        type: "section_title",
        sectionIdx: lastSecIdx
      }
    }
  }, [sections, isStreaming])

  // 11. Fallback Handling: Render premium text document layout
  if (!isStructured) {
    const textLines = content.split("\n")
    const nonBlankLines = textLines.filter(l => l.trim())
    const textLinesCount = nonBlankLines.length

    return (
      <div className="flex flex-col w-full font-sans transition-all duration-300">
        {/* Premium AI Metadata Banner */}
        <div className="relative overflow-hidden rounded-xl border border-[#8B5CF6]/25 bg-gradient-to-r from-[#8B5CF6]/10 via-[#8B5CF6]/2 to-transparent p-4 mb-5 select-none flex items-center justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/3" />
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6]">
              <span className="text-sm">🧠</span>
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground tracking-tight block">Generated by Briefly AI</span>
              <p className="text-[10px] text-muted-foreground/80">Premium Executive Assistant Insights</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold tracking-wide text-[#8B5CF6] dark:text-[#8B5CF6]/90 bg-[#8B5CF6]/15 border border-[#27272A] px-2.5 py-0.5 rounded-full select-none">
            {formattedTime ? `Generated at ${formattedTime}` : "Generated just now"}
          </span>
        </div>

        {mainTitle && (
          <h2 className="text-xl font-bold tracking-tight text-foreground/95 mb-4 animate-in fade-in duration-300">
            {mainTitle}
            {cursorLoc?.type === "main_title" && cursor}
          </h2>
        )}

        <div className="space-y-4 text-[14px] leading-relaxed text-foreground/85 max-w-none">
          {textLines.map((line, idx) => {
            const trimmed = line.trim()
            if (!trimmed) return null

            const lineIdxInNonBlank = nonBlankLines.indexOf(line)
            const showCursorHere = isStreaming && lineIdxInNonBlank === textLinesCount - 1

            // Headings
            const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)/)
            if (headerMatch) {
              const level = headerMatch[1].length
              const text = headerMatch[2].replace(/\*\*/g, "")
              const classes = 
                level === 1 ? "text-lg font-extrabold tracking-tight mt-5 mb-2 text-foreground/95" :
                level === 2 ? "text-base font-bold tracking-tight mt-4 mb-2 text-foreground/90" :
                "text-sm font-semibold mt-3 mb-1.5 text-foreground/80"
              
              return (
                <div key={idx} className={cn(classes, "animate-in fade-in duration-300")}>
                  {text}
                  {showCursorHere && cursor}
                </div>
              )
            }

            // Bullet Lists
            const isBullet = trimmed.startsWith("*") || trimmed.startsWith("•") || trimmed.startsWith("-") || /^\d+\.\s+/.test(trimmed)
            if (isBullet) {
              const itemText = trimmed.replace(/^([*•-]\s*|\d+\.\s*)/, "")
              let boldMatch = itemText.match(/^\*\*([^*]+)\*\*(.*)/)
              if (!boldMatch && itemText.startsWith("**")) {
                boldMatch = [itemText, itemText.substring(2), ""] as any
              }

              if (boldMatch) {
                const title = boldMatch[1].trim()
                const remaining = boldMatch[2].replace(/^[-–—:\s]+/, "").trim()
                
                return (
                  <div key={idx} className="flex items-start gap-3 pl-1 py-1 group rounded-xl hover:bg-muted/30 transition-colors duration-200 animate-in fade-in duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/85 mt-2 shrink-0 group-hover:scale-125 transition-transform duration-200" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm text-foreground/90 leading-tight">
                        {title}
                        {showCursorHere && !remaining && cursor}
                      </span>
                      {remaining && (
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                          {renderInlineMarkdown(remaining)}
                          {showCursorHere && cursor}
                        </p>
                      )}
                    </div>
                  </div>
                )
              }

              const parts = itemText.split(/\s*[-–—:]\s+/)
              if (parts.length > 1 && parts[0].length < 40) {
                const title = parts[0].trim()
                const remaining = parts.slice(1).join(" - ").trim()
                return (
                  <div key={idx} className="flex items-start gap-3 pl-1 py-1 group rounded-xl hover:bg-muted/30 transition-colors duration-200 animate-in fade-in duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/85 mt-2 shrink-0 group-hover:scale-125 transition-transform duration-200" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm text-foreground/90 leading-tight">
                        {title}
                        {showCursorHere && !remaining && cursor}
                      </span>
                      {remaining && (
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                          {renderInlineMarkdown(remaining)}
                          {showCursorHere && cursor}
                        </p>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <div key={idx} className="flex items-start gap-3 pl-1 py-1 group rounded-xl hover:bg-muted/30 transition-colors duration-200 animate-in fade-in duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/85 mt-2 shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  <p className="flex-1 text-[13px] text-foreground/80 leading-relaxed">
                    {renderInlineMarkdown(itemText)}
                    {showCursorHere && cursor}
                  </p>
                </div>
              )
            }

            // Paragraphs
            return (
              <p key={idx} className="text-[13.5px] text-foreground/80 leading-relaxed animate-in fade-in duration-300">
                {renderInlineMarkdown(trimmed)}
                {showCursorHere && cursor}
              </p>
            )
          })}
        </div>
      </div>
    )
  }

  // Structured rendering: Redesigned premium cards dashboard
  return (
    <div className="flex flex-col w-full font-sans transition-all duration-300 gap-2">
      {/* Premium AI Metadata Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#8B5CF6]/25 bg-gradient-to-r from-[#8B5CF6]/10 via-[#8B5CF6]/2 to-transparent p-4 mb-5 select-none flex items-center justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/3" />
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6]">
            <span className="text-sm">🧠</span>
          </div>
          <div>
            <span className="font-semibold text-xs text-foreground tracking-tight block">Generated by Briefly AI</span>
            <p className="text-[10px] text-muted-foreground/80">Premium Executive Assistant Insights</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold tracking-wide text-[#8B5CF6] dark:text-[#8B5CF6]/90 bg-[#8B5CF6]/15 border border-[#27272A] px-2.5 py-0.5 rounded-full select-none">
          {formattedTime ? `Generated at ${formattedTime}` : "Generated just now"}
        </span>
      </div>

      {mainTitle && (
        <h2 className="text-xl font-extrabold tracking-tight text-foreground/95 mb-4 animate-in fade-in duration-300">
          {mainTitle}
        </h2>
      )}

      {/* Redesigned 4-Section Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {sections.map((section, idx) => {
          if (section.items.length === 0 && section.textLines.length === 0) return null

          const config = sectionConfig[section.key] || sectionConfig.focus
          const showTitleCursor = cursorLoc?.type === "section_title" && cursorLoc.sectionIdx === idx

          return (
            <Card 
              key={section.key + idx} 
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-card border-border text-card-foreground transition-all duration-300 hover:-translate-y-0.5 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-md",
                config.border,
                config.glow
              )}
            >
              {/* Colored top gradient border accent line */}
              <div className={cn("absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r", config.topAccent)} />
              
              <CardHeader className="pb-3 pt-5 px-5 select-none flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-[14.5px] font-bold text-foreground/90 tracking-tight">
                  <span className={cn("flex items-center justify-center text-base w-7 h-7 rounded-lg shadow-sm font-normal", config.iconBg)}>
                    {section.icon}
                  </span>
                  <span>
                    {section.title}
                    {showTitleCursor && cursor}
                  </span>
                </CardTitle>
                
                {/* 5. Upcoming Meetings Count Badge */}
                {section.key === "meetings" && section.items.length > 0 && (
                  <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded">
                    {section.items.length}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 px-5 pb-5 pt-0">
                {/* 4. Priority Email Card Layout */}
                {section.key === "priority" && (
                  <div className="space-y-3">
                    {section.items.map((item, itemIdx) => {
                      const showItemCursor = cursorLoc?.type === "item" && 
                        cursorLoc.sectionIdx === idx && 
                        cursorLoc.itemIdx === itemIdx

                      const avatarLetter = item.title ? item.title.charAt(0) : "E"
                      
                      return (
                        <div 
                          key={itemIdx} 
                          className="flex gap-3.5 p-3.5 rounded-xl border border-border bg-background/30 hover:bg-background/60 hover:border-red-500/25 transition-all duration-200 group/email"
                        >
                          <Avatar className="size-8.5 shrink-0 rounded-xl border border-border bg-muted/50 select-none">
                            <AvatarFallback className="bg-transparent text-xs text-red-400 font-bold uppercase flex items-center justify-center">
                              {avatarLetter}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2.5 flex-wrap">
                              <span className="font-semibold text-[13px] text-card-foreground leading-tight truncate">
                                {item.title}
                                {showItemCursor && !item.explanation && cursor}
                              </span>
                              <span className="text-[8px] md:text-[9px] font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 shrink-0 select-none tracking-wider uppercase">
                                HIGH
                              </span>
                            </div>
                            {item.explanation && (
                              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                                {renderInlineMarkdown(item.explanation)}
                                {showItemCursor && cursor}
                              </p>
                            )}
                            {item.meta && (
                              <div className="flex items-center gap-1 mt-1.5 text-[9px] text-muted-foreground/60 select-none font-medium">
                                <ClockIcon className="size-3" />
                                <span>{item.meta}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 5. Upcoming Meetings Card Layout */}
                {section.key === "meetings" && (
                  section.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-7 text-center select-none">
                      <div className="p-3 rounded-full bg-blue-500/5 text-blue-500/40 mb-2 border border-blue-500/10">
                        <CalendarIcon className="size-5.5" />
                      </div>
                      <p className="text-xs text-muted-foreground/80 font-medium">No meetings scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {section.items.map((item, itemIdx) => {
                        const showItemCursor = cursorLoc?.type === "item" && 
                          cursorLoc.sectionIdx === idx && 
                          cursorLoc.itemIdx === itemIdx

                        const rawTime = item.meta ? item.meta.replace(/^(at|in)\s+/i, "").trim() : "Today"

                        return (
                          <div 
                            key={itemIdx} 
                            className="flex gap-3.5 p-3 rounded-xl border border-border bg-background/30 hover:bg-background/60 hover:border-blue-500/25 transition-all duration-200"
                          >
                            <div className="flex flex-col items-center justify-center px-2 py-1 bg-blue-500/10 text-blue-450 border border-blue-500/15 rounded-lg shrink-0 text-[10px] font-extrabold min-w-[70px] select-none text-center">
                              {rawTime}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-[13px] text-card-foreground leading-tight block truncate">
                                {item.title}
                                {showItemCursor && !item.explanation && cursor}
                              </span>
                              {item.explanation && (
                                <p className="text-[12px] text-muted-foreground mt-0.5 leading-normal truncate">
                                  {item.explanation}
                                  {showItemCursor && cursor}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                )}

                {/* 6. Important Follow-Ups Card Tasks Layout */}
                {section.key === "follow_ups" && (
                  <div className="space-y-3">
                    {section.items.map((item, itemIdx) => {
                      const showItemCursor = cursorLoc?.type === "item" && 
                        cursorLoc.sectionIdx === idx && 
                        cursorLoc.itemIdx === itemIdx

                      return (
                        <div 
                          key={itemIdx} 
                          className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-background/30 hover:bg-background/60 hover:border-amber-500/25 transition-all duration-200 group/task"
                        >
                          <div className="flex items-center justify-center w-4.5 h-4.5 rounded-md border border-border bg-background group-hover/task:border-amber-500/40 text-amber-500 shrink-0 mt-0.5 transition-colors select-none">
                            <div className="w-1.5 h-1.5 rounded-sm bg-transparent group-hover/task:bg-amber-500/80 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {item.title ? (
                              <>
                                <span className="font-semibold text-[13px] text-card-foreground leading-tight block">
                                  {item.title}
                                  {showItemCursor && !item.explanation && cursor}
                                </span>
                                {item.explanation && (
                                  <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                                    {renderInlineMarkdown(item.explanation)}
                                    {showItemCursor && cursor}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-[12.5px] text-foreground/95 leading-relaxed">
                                {renderInlineMarkdown(item.explanation)}
                                {showItemCursor && cursor}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 7. Suggested Focus Recommendations Layout */}
                {section.key === "focus" && (
                  <div className="space-y-3">
                    {section.textLines.length > 0 && (
                      <div className="p-4 rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.02] text-foreground/90 leading-relaxed space-y-2.5">
                        {section.textLines.map((line, lIdx) => {
                          const showLineCursor = cursorLoc?.type === "line" && 
                            cursorLoc.sectionIdx === idx && 
                            cursorLoc.lineIdx === lIdx

                          return (
                            <p key={lIdx} className="text-[12.5px] text-foreground/80">
                              {renderInlineMarkdown(line)}
                              {showLineCursor && cursor}
                            </p>
                          )
                        })}
                      </div>
                    )}
                    {section.items.length > 0 && (
                      <div className="space-y-2.5">
                        {section.items.map((item, itemIdx) => {
                          const showItemCursor = cursorLoc?.type === "item" && 
                            cursorLoc.sectionIdx === idx && 
                            cursorLoc.itemIdx === itemIdx

                          return (
                            <div key={itemIdx} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#8B5CF6]/10 bg-background/30 hover:bg-background/60 hover:border-[#8B5CF6]/25 transition-all duration-200">
                              <span className="text-[#8B5CF6] mt-0.5 select-none text-xs shrink-0">🎯</span>
                              <div className="flex-1 min-w-0 text-[12.5px] leading-relaxed">
                                {item.title && <strong className="font-semibold text-card-foreground mr-1.5">{item.title}</strong>}
                                <span className="text-muted-foreground">{renderInlineMarkdown(item.explanation)}</span>
                                {showItemCursor && cursor}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
