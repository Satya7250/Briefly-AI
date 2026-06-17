import { getCalendarEvents, createEvent } from "@/features/calendar/server/calendar-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
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
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
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

    const body = await request.json();
    const { event } = body;

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Missing event payload" },
        { status: 400 }
      );
    }

    const result = await createEvent(tenantId, event);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
