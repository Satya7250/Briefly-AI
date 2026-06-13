const UNREAD_KEY = "email-unread"

export function getUnreadState(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const data = localStorage.getItem(UNREAD_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function setUnreadState(state: Record<string, boolean>): void {
  if (typeof window === "undefined") return
  localStorage.setItem(UNREAD_KEY, JSON.stringify(state))
}

export function isEmailUnread(messageId: string): boolean {
  return getUnreadState()[messageId] ?? true
}

export function markEmailAsRead(messageId: string): void {
  const state = getUnreadState()
  state[messageId] = false
  setUnreadState(state)
}

export function initializeUnreadState(emails: { id: string }[]): void {
  const currentState = getUnreadState()
  let updated = false
  emails.forEach((email) => {
    if (!(email.id in currentState)) {
      currentState[email.id] = true
      updated = true
    }
  })
  if (updated) {
    setUnreadState(currentState)
  }
}
