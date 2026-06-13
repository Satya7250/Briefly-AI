export function clearAppStorage() {
  const keysToRemove = [
    "email-unread",
    "email-snoozes",
    "briefing:onboarding",
    "briefing:auth",
    "briefing:connected",
    "briefing:onboarded"
  ]
  keysToRemove.forEach(key => localStorage.removeItem(key))
  
  // Notify other tabs
  localStorage.setItem("briefing:logout", "logout")
  setTimeout(() => localStorage.removeItem("briefing:logout"), 100)
}
