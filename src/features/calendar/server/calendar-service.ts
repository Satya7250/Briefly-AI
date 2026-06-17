import { CalendarRepository } from "./calendar.repository";

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
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const nowPlus30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Give it a range

    const events = await CalendarRepository.getUpcomingEvents(tenantId, thirtyDaysAgo, nowPlus30);

    return events.map((event: any) => ({
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
    console.error("CALENDAR SERVICE ERROR:", error);
    return [];
  }
}

export async function createEvent(tenantId: string, event: any): Promise<any> {
  return await CalendarRepository.createEvent(tenantId, event);
}

export async function updateEvent(tenantId: string, eventId: string, updates: any): Promise<any> {
  return await CalendarRepository.updateEvent(tenantId, eventId, updates);
}