"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (isLoading) return
    setIsLoading(true)
    window.location.href = "/api/corsair/gmail/connect?login=true"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="size-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Briefing</CardTitle>
          </div>
          <CardDescription className="text-base text-muted-foreground">
            Your AI-powered email workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
