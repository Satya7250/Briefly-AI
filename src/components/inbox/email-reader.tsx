"use client"

import DOMPurify from "isomorphic-dompurify"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MapPinIcon, PackageIcon, GlobeIcon } from "lucide-react"

interface EmailReaderProps {
  html: string
  plainText?: string
  subject?: string
  sender?: string
}

interface StructuredInfo {
  label: string
  value: string
  icon?: React.ReactNode
}

interface ActionLink {
  text: string
  href: string
}

function isHTML(content: string): boolean {
  if (!content) return false
  const doc = new DOMParser().parseFromString(content, "text/html")
  return doc.body.childNodes.length > 0 && Array.from(doc.body.childNodes).some(node => 
    node.nodeType === 1
  )
}

function isValidMetadataValue(value: string): boolean {
  if (!value) return false
  const trimmed = value.trim()
  if (trimmed.length > 80) return false
  if (trimmed.includes("\n") || trimmed.includes("\r")) return false
  if (trimmed.includes(". ") || trimmed.includes("! ") || trimmed.includes("? ")) {
    const sentences = trimmed.split(/[.!?]\s+/).filter(s => s.length > 0)
    if (sentences.length > 1) return false
  }
  return true
}

function extractStructuredInfo(doc: Document): StructuredInfo[] {
  const info: StructuredInfo[] = []
  const textContent = doc.body.textContent || ""
  const priorityPatterns = [
    { regex: /(?:^|[ \n])(date|sent|received)\s*:\s*(.+?)(?=[ \n]|$)/i, label: "Date", icon: <CalendarIcon className="size-3" /> },
    { regex: /(?:^|[ \n])(location|venue|place)\s*:\s*(.+?)(?=[ \n]|$)/i, label: "Location", icon: <MapPinIcon className="size-3" /> },
    { regex: /(?:^|[ \n])(device|browser)\s*:\s*(.+?)(?=[ \n]|$)/i, label: "Device", icon: <GlobeIcon className="size-3" /> },
    { regex: /(?:^|[ \n])(order|confirmation)\s*(?:number|#|no\.?)\s*:\s*(.+?)(?=[ \n]|$)/i, label: "Order", icon: <PackageIcon className="size-3" /> },
    { regex: /(?:^|[ \n])(tracking|track)\s*(?:number|#|no\.?)\s*:\s*(.+?)(?=[ \n]|$)/i, label: "Tracking", icon: <PackageIcon className="size-3" /> },
  ]

  for (const { regex, label, icon } of priorityPatterns) {
    const match = textContent.match(regex)
    if (match) {
      const value = match[2] || ""
      if (isValidMetadataValue(value)) {
        info.push({ label, value: value.trim(), icon })
        if (info.length >= 4) break
      }
    }
  }

  return info
}

function extractActionLinks(doc: Document): ActionLink[] {
  const actions: ActionLink[] = []
  const actionTexts = [
    "verify", "confirm", "approve", "reset password", "view invoice", 
    "join meeting", "track package", "view receipt", "download", "sign up",
    "activate", "accept", "reject", "login", "sign in", "update"
  ]

  doc.querySelectorAll("a").forEach(a => {
    const text = a.textContent?.toLowerCase() || ""
    if (actionTexts.some(action => text.includes(action))) {
      const href = a.getAttribute("href")
      if (href) {
        actions.push({
          text: a.textContent || href,
          href: href
        })
      }
    }
  })

  return actions
}

function cleanEmailHTML(html: string): { html: string; doc: Document } {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "dl", "dt", "dd",
      "a", "strong", "em", "b", "i", "u", "s",
      "blockquote", "code", "pre", "br", "hr",
      "table", "tr", "td", "th", "thead", "tbody", "tfoot",
      "span"
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
    FORCE_BODY: true,
    WHOLE_DOCUMENT: false
  })

  const parser = new DOMParser()
  const doc = parser.parseFromString(clean, "text/html")

  doc.querySelectorAll("*").forEach(el => {
    el.removeAttribute("style")
    el.removeAttribute("bgcolor")
    el.removeAttribute("color")
    el.removeAttribute("font")
    el.removeAttribute("face")
    el.removeAttribute("size")
    el.removeAttribute("align")
  })

  doc.querySelectorAll("img").forEach(img => {
    const width = parseInt(img.getAttribute("width") || "0")
    const height = parseInt(img.getAttribute("height") || "0")
    const src = img.getAttribute("src") || ""
    const style = img.getAttribute("style") || ""
    const isHidden = style.includes("display:none") ||
      style.includes("visibility:hidden") ||
      (width === 1 && height === 1) ||
      src.toLowerCase().includes("track") ||
      src.toLowerCase().includes("pixel")

    if (isHidden) {
      img.remove()
    }
  })

  doc.querySelectorAll("a").forEach(a => {
    a.setAttribute("target", "_blank")
    a.setAttribute("rel", "noopener noreferrer")
  })

  return { html: doc.body.innerHTML, doc }
}

export function EmailReader({ html, plainText, subject, sender }: EmailReaderProps) {
  const [renderContent, setRenderContent] = useState<string>("")
  const [structuredInfo, setStructuredInfo] = useState<StructuredInfo[]>([])
  const [actionLinks, setActionLinks] = useState<ActionLink[]>([])

  useEffect(() => {
    if (html && isHTML(html)) {
      const { html: cleaned, doc } = cleanEmailHTML(html)
      setRenderContent(cleaned)
      setStructuredInfo(extractStructuredInfo(doc))
      setActionLinks(extractActionLinks(doc))
    } else if (plainText) {
      const plainHtml = plainText
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br/>")
      const doc = new DOMParser().parseFromString(`<p>${plainHtml}</p>`, "text/html")
      setRenderContent(doc.body.innerHTML)
      setStructuredInfo(extractStructuredInfo(doc))
    } else if (html) {
      const { html: cleaned, doc } = cleanEmailHTML(html)
      setRenderContent(cleaned)
      setStructuredInfo(extractStructuredInfo(doc))
    }
  }, [html, plainText])

  const metadataSection = useMemo(() => {
    if (structuredInfo.length === 0) return null

    return (
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm border border-border rounded-lg p-3 bg-muted/30">
        {structuredInfo.map((info, index) => (
          <div key={index} className="flex items-center gap-2">
            {info.icon && <span className="text-muted-foreground">{info.icon}</span>}
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{info.label}</span>
            <span className="text-sm font-medium">{info.value}</span>
          </div>
        ))}
      </div>
    )
  }, [structuredInfo])

  const actionButtons = useMemo(() => {
    if (actionLinks.length === 0) return null

    return (
      <div className="mb-6 flex flex-wrap gap-2">
        {actionLinks.slice(0, 3).map((action, index) => (
          <Button key={index} variant="default" size="sm" asChild>
            <a href={action.href} target="_blank" rel="noopener noreferrer">
              {action.text}
            </a>
          </Button>
        ))}
      </div>
    )
  }, [actionLinks])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {metadataSection}
          {actionButtons}
          <div className="prose prose-sm md:prose-base max-w-none">
            {renderContent ? (
              <div dangerouslySetInnerHTML={{ __html: renderContent }} />
            ) : (
              <p className="text-muted-foreground">No content available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
