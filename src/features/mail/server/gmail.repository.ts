import { corsair } from "@/corsair/client";

export class GmailRepository {
  private static normalizeMessage(msg: any) {
    const data = msg.data || msg;
    const subject = data.subject || data.payload?.headers?.find((h: any) => h.name === "Subject")?.value || "No Subject";
    const from = data.from || data.payload?.headers?.find((h: any) => h.name === "From")?.value || "Unknown Sender";
    
    let createdAt: Date;
    if (data.internalDate) {
      const parsed = parseInt(data.internalDate);
      if (!isNaN(parsed)) {
        createdAt = new Date(parsed);
      } else {
        createdAt = new Date(data.internalDate);
      }
    } else if (data.createdAt) {
      createdAt = new Date(data.createdAt);
    } else if (msg.created_at) {
      createdAt = new Date(msg.created_at);
    } else {
      createdAt = new Date();
    }

    if (isNaN(createdAt.getTime())) {
      if (msg.created_at) {
        createdAt = new Date(msg.created_at);
      }
      if (isNaN(createdAt.getTime())) {
        createdAt = new Date();
      }
    }

    return {
      id: data.id || msg.entity_id || "",
      threadId: data.threadId || "",
      subject,
      from,
      snippet: data.snippet || "",
      createdAt
    };
  }

  static async getRecentMessages(tenantId: string, limit: number = 20) {
    const tenant = corsair.withTenant(tenantId);
    const recent = await tenant.gmail.db.messages.list({
      limit,
    });
    
    return recent.map((msg: any) => this.normalizeMessage(msg));
  }

  static async getMessage(tenantId: string, messageId: string) {
    const tenant = corsair.withTenant(tenantId);
    
    // 1. Try to find the message in the local synced database
    const dbMsg = await tenant.gmail.db.messages.findByEntityId(messageId);
    const data = dbMsg ? (dbMsg.data || dbMsg) : null;
    
    // 2. If the database record already contains the body/parts, return it (to avoid API reads)
    if (data && (data.body || (data.payload && (data.payload.parts || (data.payload.body && data.payload.body.data))))) {
      return data;
    }
    
    // 3. Since the database only syncs message lists/metadata without bodies, fetch from Gmail API
    try {
      const apiMsg = await tenant.gmail.api.messages.get({ id: messageId, format: "full" });
      return apiMsg;
    } catch (error) {
      console.error("API GET MESSAGE ERROR:", error);
      // Fallback to DB metadata if API call fails
      return data;
    }
  }

  static async getUnreadMessages(tenantId: string, limit: number = 20) {
    const tenant = corsair.withTenant(tenantId);
    const recent = await tenant.gmail.db.messages.list({
      limit: 100,
    });
    
    return recent
      .filter((msg: any) => {
        const data = msg.data || msg;
        return data.labelIds?.includes("UNREAD");
      })
      .slice(0, limit)
      .map((msg: any) => this.normalizeMessage(msg));
  }
}
