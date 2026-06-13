"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"

const CONNECTED_KEY = "briefing:connected"
const AUTH_KEY = "briefing:auth"

export default function Home() {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY)
    const saved = localStorage.getItem(CONNECTED_KEY)

    if (!auth) {
      redirect("/login")
    }

    if (saved) {
      const { onboarded } = JSON.parse(saved)
      if (onboarded) {
        redirect("/dashboard")
      } else {
        redirect("/onboarding")
      }
    } else {
      redirect("/onboarding")
    }
    setChecking(false)
  }, [])

  if (checking) {
    return null
  }

  return null
}
