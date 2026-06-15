"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MailIcon, CalendarIcon, CheckCircleIcon } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

const ONBOARDED_KEY = "briefing:onboarded"

export default function OnboardingPage() {
  const [gmailConnected, setGmailConnected] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if already onboarded
  useEffect(() => {
    const saved = localStorage.getItem(ONBOARDED_KEY)
    if (saved === "true") {
      redirect("/dashboard/inbox")
    }
  }, [])

  // Fetch connected accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/user/accounts")
        if (res.ok) {
          const data = await res.json()
          setGmailConnected(data.data.gmailConnected)
          setCalendarConnected(data.data.calendarConnected)
        }
      } catch (error) {
        console.error("Error fetching accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, "true")
    redirect("/dashboard/inbox")
  }

  const handleGmailConnect = () => {
    window.location.href = "/api/corsair/gmail/connect"
  }

  const handleCalendarConnect = () => {
    window.location.href = "/api/corsair/googlecalendar/connect"
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  const handleContinue = () => {
    completeOnboarding()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center justify-center gap-3">
            <Logo width={96} height={96} priority className="animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Briefly</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect your accounts to unlock:
          </p>
          <ul className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground">
            <li className="bg-background px-3 py-1.5 rounded-full border shadow-sm">• Inbox intelligence</li>
            <li className="bg-background px-3 py-1.5 rounded-full border shadow-sm">• Calendar insights</li>
            <li className="bg-background px-3 py-1.5 rounded-full border shadow-sm">• Briefly AI</li>
            <li className="bg-background px-3 py-1.5 rounded-full border shadow-sm">• Productivity analytics</li>
          </ul>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gmail Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MailIcon className="size-5" />
                    Gmail
                    {gmailConnected && (
                      <Badge variant="default" className="ml-auto">Connected</Badge>
                    )}
                    {!gmailConnected && (
                      <Badge variant="secondary" className="ml-auto">Not Connected</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleGmailConnect} 
                    className="w-full"
                    variant={gmailConnected ? "secondary" : "default"}
                  >
                    {gmailConnected ? (
                      <>
                        <CheckCircleIcon className="size-4 mr-2" />
                        Reconnect Gmail
                      </>
                    ) : (
                      "Connect Gmail"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Calendar Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="size-5" />
                    Calendar
                    {calendarConnected && (
                      <Badge variant="default" className="ml-auto">Connected</Badge>
                    )}
                    {!calendarConnected && (
                      <Badge variant="secondary" className="ml-auto">Not Connected</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCalendarConnect} 
                      className="flex-1"
                      variant={calendarConnected ? "secondary" : "default"}
                    >
                      {calendarConnected ? (
                        <>
                          <CheckCircleIcon className="size-4 mr-2" />
                          Reconnect Calendar
                        </>
                      ) : (
                        "Connect Calendar"
                      )}
                    </Button>
                    <Button onClick={handleSkip} variant="ghost">
                      Skip For Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleContinue}
                size="lg"
                disabled={!gmailConnected}
                className="min-w-[200px]"
              >
                Go To Inbox
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
