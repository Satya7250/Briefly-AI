import { updateEvent } from "@/features/calendar/server/calendar-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getTenantId();
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check integration connection status
    const integrationStatus = await getIntegrationStatus(tenantId);
    if (!integrationStatus.calendarConnected) {
      return NextResponse.json(
        { success: false, error: "Google Calendar integration is not connected. Please connect Google Calendar in Settings." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing event id" },
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

    const { updates } = body;

    if (!updates) {
      return NextResponse.json(
        { success: false, error: "Missing updates payload" },
        { status: 400 }
      );
    }

    const result = await withTimeout(
      updateEvent(tenantId, id, updates),
      12000,
      "Google Calendar API request timed out"
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

