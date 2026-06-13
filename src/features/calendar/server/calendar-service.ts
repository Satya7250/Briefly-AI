import { corsair } from "@/corsair/client";

export interface CalendarEvent {
  id: string;
  summary?: string;
  start?: Date;
  end?: Date;
  description?: string;
}

export async function getCalendarEvents(
  tenantId: string
): Promise<CalendarEvent[]> {
  try {
    const tenant = corsair.withTenant(tenantId);

    const response =
      await tenant.googlecalendar.api.events.getMany({
        calendarId: "primary",
        singleEvents: true,
        timeMin: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // last 30 days
      });

    return (response.items ?? []).map((event) => ({
      id: event.id ?? "",
      summary: event.summary,
      start: event.start?.dateTime
        ? new Date(event.start.dateTime)
        : event.start?.date
        ? new Date(event.start.date)
        : undefined,
      end: event.end?.dateTime
        ? new Date(event.end.dateTime)
        : event.end?.date
        ? new Date(event.end.date)
        : undefined,
      description: event.description,
    }));
  } catch (error) {
    if (
      error instanceof Error && 
      error.message.includes("Account not found")
    ) {
      return [];
    }
    console.error("CALENDAR SERVICE ERROR:", error);
    throw error;
  }
}