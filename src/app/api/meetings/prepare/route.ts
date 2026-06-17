import { prepareMeetingBriefing } from "@/features/meetings/server/meeting-prep-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check integration connection status for both Gmail and Calendar
    const integrationStatus = await getIntegrationStatus(tenantId);
    const missing = [];
    if (!integrationStatus.calendarConnected) missing.push("Google Calendar");
    if (!integrationStatus.gmailConnected) missing.push("Gmail");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Please connect your ${missing.join(" and ")} integration${missing.length > 1 ? "s" : ""} in Settings to prepare meetings.`
        },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload" },
        { status: 400 }
      );
    }

    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Missing eventId" },
        { status: 400 }
      );
    }

    const briefing = await withTimeout(
      prepareMeetingBriefing(tenantId, eventId),
      25000,
      "Meeting preparation request timed out"
    );

    return NextResponse.json({ success: true, data: briefing });
  } catch (error: any) {
    console.error("Error preparing meeting:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to prepare meeting briefing" },
      { status: 500 }
    );
  }
}

