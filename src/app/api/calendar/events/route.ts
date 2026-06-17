import { getCalendarEvents, createEvent } from "@/features/calendar/server/calendar-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({
        success: true,
        data: [],
        integrationRequired: true
      });
    }

    const events = await getCalendarEvents(tenantId);

    const formattedEvents = events.map((event) => ({
      id: event.id,
      summary: event.summary,
      start: event.start?.toISOString(),
      end: event.end?.toISOString(),
      description: event.description,
    }));

    return NextResponse.json({ success: true, data: formattedEvents });
  } catch (error: any) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
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

    // Check integration connection status
    const integrationStatus = await getIntegrationStatus(tenantId);
    if (!integrationStatus.calendarConnected) {
      return NextResponse.json(
        { success: false, error: "Google Calendar integration is not connected. Please connect Google Calendar in Settings." },
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

    const { event } = body;

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Missing event payload" },
        { status: 400 }
      );
    }

    const result = await withTimeout(
      createEvent(tenantId, event),
      12000,
      "Google Calendar API request timed out"
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

