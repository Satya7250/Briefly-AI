import { getCalendarEvents } from "@/features/calendar/server/calendar-service";
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
