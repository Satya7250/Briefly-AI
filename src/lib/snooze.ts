const SNOOZE_KEY = "email-snoozes"

export interface SnoozeData {
  [messageId: string]: number
}

export function getSnoozes(): SnoozeData {
  if (typeof window === "undefined") return {}
  try {
    const data = localStorage.getItem(SNOOZE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function setSnooze(messageId: string, snoozedUntil: number): void {
  if (typeof window === "undefined") return
  const snoozes = getSnoozes()
  snoozes[messageId] = snoozedUntil
  localStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozes))
}

export function isSnoozed(messageId: string): boolean {
  const snoozes = getSnoozes()
  const snoozedUntil = snoozes[messageId]
  if (!snoozedUntil) return false
  return Date.now() < snoozedUntil
}

export function getSnoozeTime(option: "tonight" | "tomorrow" | "nextWeek"): number {
  const now = new Date()
  const target = new Date()

  switch (option) {
    case "tonight":
      target.setHours(20, 0, 0, 0)
      if (target <= now) {
        target.setDate(target.getDate() + 1)
      }
      break
    case "tomorrow":
      target.setDate(now.getDate() + 1)
      target.setHours(9, 0, 0, 0)
      break
    case "nextWeek":
      target.setDate(now.getDate() + 7)
      target.setHours(9, 0, 0, 0)
      break
  }

  return target.getTime()
}

export function getSnoozeLabel(option: "tonight" | "tomorrow" | "nextWeek"): string {
  switch (option) {
    case "tonight":
      return "tonight"
    case "tomorrow":
      return "tomorrow"
    case "nextWeek":
      return "next week"
  }
}
