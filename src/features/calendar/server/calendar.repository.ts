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

  static async getEvent(tenantId: string, eventId: string) {
    const tenant = corsair.withTenant(tenantId);
    try {
      const dbEvent = await tenant.googlecalendar.db.events.findByEntityId(eventId);
      if (dbEvent) {
        return dbEvent.data || dbEvent;
      }
    } catch (e) {
      console.warn("DB Find event error:", e);
    }
    try {
      return await tenant.googlecalendar.api.events.get({
        calendarId: "primary",
        id: eventId,
      });
    } catch (e) {
      console.error("API Get event error:", e);
      return null;
    }
  }

  static async createEvent(tenantId: string, event: any) {
    const tenant = corsair.withTenant(tenantId);
    return await tenant.googlecalendar.api.events.create({
      calendarId: "primary",
      event,
    });
  }

  static async updateEvent(tenantId: string, eventId: string, updates: any) {
    const tenant = corsair.withTenant(tenantId);
    
    // Retrieve existing event details to prevent field loss
    const existing = await this.getEvent(tenantId, eventId);
    
    const mergedEvent: any = {};
    if (existing) {
      if (existing.summary !== undefined) mergedEvent.summary = existing.summary;
      if (existing.description !== undefined) mergedEvent.description = existing.description;
      if (existing.attendees !== undefined) mergedEvent.attendees = existing.attendees;
      if (existing.location !== undefined) mergedEvent.location = existing.location;
      if (existing.start !== undefined) mergedEvent.start = existing.start;
      if (existing.end !== undefined) mergedEvent.end = existing.end;
    }

    // Overwrite with updates (e.g. proposed start/end)
    if (updates.summary !== undefined) mergedEvent.summary = updates.summary;
    if (updates.description !== undefined) mergedEvent.description = updates.description;
    if (updates.attendees !== undefined) mergedEvent.attendees = updates.attendees;
    if (updates.location !== undefined) mergedEvent.location = updates.location;
    if (updates.start !== undefined) mergedEvent.start = updates.start;
    if (updates.end !== undefined) mergedEvent.end = updates.end;

    return await tenant.googlecalendar.api.events.update({
      calendarId: "primary",
      id: eventId,
      event: mergedEvent,
    });
  }
}
