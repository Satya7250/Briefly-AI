"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
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
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon, CalendarIcon, SparklesIcon } from "lucide-react"

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], description: "Command Palette" },
  { keys: ["Alt", "D"], description: "Go to Dashboard" },
  { keys: ["Alt", "I"], description: "Go to Inbox" },
  { keys: ["Alt", "C"], description: "Go to Calendar" },
  { keys: ["Alt", "B"], description: "Go to Briefing" },
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
      title: "Briefing",
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

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <a href="/dashboard">
                  <SparklesIcon className="size-5!" />
                  <span className="text-base font-semibold">Briefing</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
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
    </>
  )
}

