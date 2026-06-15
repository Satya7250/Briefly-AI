"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useIntegrationStatus } from "@/hooks/use-integration-status"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Logo } from "@/components/common/logo"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon, CalendarIcon, SparklesIcon } from "lucide-react"

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], description: "Command Palette" },
  { keys: ["Alt", "D"], description: "Go to Dashboard" },
  { keys: ["Alt", "I"], description: "Go to Inbox" },
  { keys: ["Alt", "C"], description: "Go to Calendar" },
  { keys: ["Alt", "B"], description: "Go to Briefly" },
  { keys: ["J"], description: "Next Email" },
  { keys: ["K"], description: "Previous Email" },
  { keys: ["Enter"], description: "Open Email" },
  { keys: ["Esc"], description: "Close Email" },
]

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Inbox",
      url: "/dashboard/inbox",
      icon: <FileTextIcon />,
    },
    {
      title: "Calendar",
      url: "/dashboard/calendar",
      icon: <CalendarIcon />,
    },
    {
      title: "Briefly",
      url: "/dashboard/briefing",
      icon: <SparklesIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: (
        <Settings2Icon
        />
      ),
    },
  ],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false)
  const [isConnectOpen, setIsConnectOpen] = React.useState(false)
  const { status, loading } = useIntegrationStatus()

  // Open connection dialog on first dashboard visit if integrations missing
  React.useEffect(() => {
    if (!loading && status && (!status.gmailConnected || !status.calendarConnected)) {
      const prompted = window.localStorage.getItem('integrationPrompted')
      if (!prompted) {
        setIsConnectOpen(true)
        window.localStorage.setItem('integrationPrompted', 'true')
      }
    }
  }, [loading, status])

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5! transition-all duration-300"
              >
                <a href="/dashboard" className="flex items-center gap-2">
                  <Logo width={22} height={22} className="shrink-0 transition-transform duration-300 hover:scale-110" />
                  <span className="text-base font-semibold tracking-tight text-foreground transition-opacity duration-300">Briefly</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        {/* Auto-open connection dialog if integrations missing */}
        {/* Side-effect moved to useEffect */}
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavDocuments items={data.documents} />
          <div className="mt-auto">
            <NavSecondary items={data.navSecondary} />
            <div className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setIsHelpOpen(true)}>
                    <CircleHelpIcon />
                    <span>Get Help</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {SHORTCUTS.map((shortcut, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm font-medium">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, j) => (
                    <kbd
                      key={j}
                      className="px-2 py-0.5 text-xs font-medium bg-muted rounded border border-border"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {/* Connection Prompt Dialog */}
      <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Integrations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!status?.gmailConnected && (
              <Button variant="outline" onClick={() => window.location.href = "/api/corsair/gmail/connect"} className="w-full">
                Connect Email (Gmail)
              </Button>
            )}
            {!status?.calendarConnected && (
              <Button variant="outline" onClick={() => window.location.href = "/api/corsair/googlecalendar/connect"} className="w-full">
                Connect Calendar (Google)
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

