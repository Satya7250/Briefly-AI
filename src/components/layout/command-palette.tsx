"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useKeyboardShortcuts({
    commandKey: () => setOpen(true),
    goToInbox: () => router.push("/dashboard/inbox"),
    goToCalendar: () => router.push("/dashboard/calendar"),
    goToDashboard: () => router.push("/dashboard"),
    goToBriefing: () => router.push("/dashboard/briefing"),
  })

  const runCommand = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/inbox"))}>
            Go to Inbox
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/calendar"))}>
            Go to Calendar
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            Go to Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/briefing"))}>
            Go to Briefly
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
