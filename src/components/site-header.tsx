"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/common/logo"

export function SiteHeader() {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()

  // Dynamic Page Title
  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard/inbox")) return "Inbox"
    if (path.startsWith("/dashboard/calendar")) return "Calendar"
    if (path.startsWith("/dashboard/briefing")) return "Briefing AI"
    if (path.startsWith("/dashboard/settings")) return "Settings"
    return "Dashboard"
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2 animate-in fade-in duration-200">
          <Logo width={22} height={22} className="rounded" />
          <h1 className="text-base font-semibold text-foreground tracking-tight">{pageTitle}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
