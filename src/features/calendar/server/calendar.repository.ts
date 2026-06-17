import { corsair } from "@/corsair/client";

export class CalendarRepository {
  static async getUpcomingEvents(tenantId: string, timeMin: Date, timeMax: Date, limit: number = 50) {
    const tenant = corsair.withTenant(tenantId);
    const events = await tenant.googlecalendar.db.events.list({
      limit: 100,
    });

    return events
      .filter((event: any) => {
        const data = event.data || event;
        if (!data.start) return false;
        const eventStart = data.start.dateTime ? new Date(data.start.dateTime) : new Date(data.start.date);
        return eventStart >= timeMin && eventStart <= timeMax;
      })
      .map((event: any) => event.data || event)
      .slice(0, limit);
  }
}
