"use client"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { CirclePlusIcon, MailIcon, RocketIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import GettingStartedDrawer from "@/components/getting-started-drawer"
import { usePathname } from "next/navigation"
import { useUnreadCount } from "./unread-context"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const { count: unreadCount } = useUnreadCount()
  const pathname = usePathname()
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(false)

  return (
    <SidebarGroup>
      <GettingStartedDrawer
        open={isGettingStartedOpen}
        onOpenChange={setIsGettingStartedOpen}
      />
      <SidebarGroupContent className="flex flex-col gap-3">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Getting Started"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              onClick={() => setIsGettingStartedOpen(true)}
            >
              <RocketIcon />
              <span>Getting Started</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon
              />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.title === "Inbox" && unreadCount > 0 && (
                <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
