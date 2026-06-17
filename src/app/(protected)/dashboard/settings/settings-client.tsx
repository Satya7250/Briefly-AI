"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIntegrationStatus } from "@/hooks/use-integration-status";
import { useState } from "react";
import { Logo } from "@/components/common/logo";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Clear only safe client-side data caches — does NOT touch auth or session data
function clearIntegrationCaches(type: "gmail" | "googlecalendar" | "all") {
  if (typeof window === "undefined") return;
  if (type === "gmail" || type === "all") {
    sessionStorage.removeItem("dashboard-emails-v1");
    sessionStorage.removeItem("inbox-cache-v1");
    // Also clear per-thread caches
    const keys = Object.keys(sessionStorage);
    keys.forEach(k => { if (k.startsWith("thread-cache-v1:")) sessionStorage.removeItem(k); });
  }
  if (type === "googlecalendar" || type === "all") {
    sessionStorage.removeItem("dashboard-events-v1");
    sessionStorage.removeItem("calendar-events-v1");
  }
}

export default function SettingsClient() {
  const { status, loading, refreshStatus } = useIntegrationStatus();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [gmailDialogOpen, setGmailDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

  const handleDisconnect = async (integration: "gmail" | "googlecalendar") => {
    try {
      setDisconnecting(integration);
      const res = await fetch(`/api/integrations/disconnect/${integration}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to disconnect");
      }

      // Clear related cache data
      clearIntegrationCaches(integration);

      // Close dialog
      if (integration === "gmail") setGmailDialogOpen(false);
      if (integration === "googlecalendar") setCalendarDialogOpen(false);

      await refreshStatus();
      toast.success(`${integration === "gmail" ? "Gmail" : "Google Calendar"} disconnected successfully.`);
    } catch (err: any) {
      console.error("Error disconnecting integration:", err);
      toast.error(err.message || "Failed to disconnect integration.");
    } finally {
      setDisconnecting(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
        <Logo width={64} height={64} className="animate-pulse" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Toaster />
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Connected Integrations</h2>

        {/* Gmail Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gmail</CardTitle>
                <CardDescription>Connect your Gmail account to read and send emails</CardDescription>
              </div>
              <Badge variant={status?.gmailConnected ? "default" : "secondary"}>
                {status?.gmailConnected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {status?.gmailConnected ? (
              <div className="space-y-4">
                {status.gmailConnectedAt && (
                  <p className="text-sm text-muted-foreground">
                    Connected on: {new Date(status.gmailConnectedAt).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => window.location.href = "/api/corsair/gmail/connect"}>
                    Reconnect
                  </Button>
                  <Dialog open={gmailDialogOpen} onOpenChange={setGmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" disabled={disconnecting === "gmail"}>
                        {disconnecting === "gmail" ? "Disconnecting..." : "Disconnect"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disconnect Gmail?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to disconnect your Gmail account? You will need to reconnect to access your emails.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="secondary" onClick={() => setGmailDialogOpen(false)}>Cancel</Button>
                        <Button
                          variant="destructive"
                          disabled={disconnecting === "gmail"}
                          onClick={() => handleDisconnect("gmail")}
                        >
                          {disconnecting === "gmail" ? "Disconnecting..." : "Disconnect"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <Button onClick={() => window.location.href = "/api/corsair/gmail/connect"}>
                Connect Gmail
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Google Calendar Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>Connect your Google Calendar to view and manage events</CardDescription>
              </div>
              <Badge variant={status?.calendarConnected ? "default" : "secondary"}>
                {status?.calendarConnected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {status?.calendarConnected ? (
              <div className="space-y-4">
                {status.calendarConnectedAt && (
                  <p className="text-sm text-muted-foreground">
                    Connected on: {new Date(status.calendarConnectedAt).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => window.location.href = "/api/corsair/googlecalendar/connect"}>
                    Reconnect
                  </Button>
                  <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" disabled={disconnecting === "googlecalendar"}>
                        {disconnecting === "googlecalendar" ? "Disconnecting..." : "Disconnect"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disconnect Google Calendar?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to disconnect your Google Calendar account? You will need to reconnect to access your calendar.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="secondary" onClick={() => setCalendarDialogOpen(false)}>Cancel</Button>
                        <Button
                          variant="destructive"
                          disabled={disconnecting === "googlecalendar"}
                          onClick={() => handleDisconnect("googlecalendar")}
                        >
                          {disconnecting === "googlecalendar" ? "Disconnecting..." : "Disconnect"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <Button onClick={() => window.location.href = "/api/corsair/googlecalendar/connect"}>
                Connect Calendar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
