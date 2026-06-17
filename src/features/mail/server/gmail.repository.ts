import { corsair } from "@/corsair/client";
import { db } from "@/db";
import { corsairAccounts, corsairEntities, corsairIntegrations } from "@/db/schema/corsair";
import { eq, and, desc } from "drizzle-orm";

export class GmailRepository {
  private static isUsableMessage(msg: any): boolean {
    // When stored from corsairEntities, msg.data holds the Gmail JSON.
    // Skip stub rows where data is empty or has no useful headers.
    const data = msg.data;
    if (!data || typeof data !== "object") return false;
    // Must have either direct fields OR a payload with headers
    const hasDirectFields = !!(data.id && (data.subject || data.from));
    const hasPayload = !!(data.payload?.headers?.length);
    return hasDirectFields || hasPayload;
  }

  private static normalizeMessage(msg: any) {
    // For corsairEntities rows: prefer msg.data (JSONB column); fall back to msg itself
    // for Corsair DB objects that embed data at the top level.
    const rawData = (msg.data && typeof msg.data === "object" && msg.data.id) ? msg.data : msg;
    const data = rawData;

    const subject =
      data.subject ||
      data.payload?.headers?.find((h: any) => h.name === "Subject")?.value ||
      "No Subject";

    const from =
      data.from ||
      data.payload?.headers?.find((h: any) => h.name === "From")?.value ||
      "Unknown Sender";

    let createdAt: Date;
    if (data.internalDate) {
      const parsed = parseInt(data.internalDate);
      createdAt = !isNaN(parsed) ? new Date(parsed) : new Date(data.internalDate);
    } else if (data.createdAt) {
      createdAt = new Date(data.createdAt);
    } else if (msg.createdAt) {
      createdAt = new Date(msg.createdAt);
    } else if (msg.created_at) {
      createdAt = new Date(msg.created_at);
    } else {
      createdAt = new Date();
    }

    if (isNaN(createdAt.getTime())) {
      createdAt = new Date();
    }

    return {
      // entityId is the camelCase Drizzle field name for the entity_id column
      id: data.id || msg.entityId || "",
      threadId: data.threadId || "",
      subject,
      from,
      snippet: data.snippet || "",
      createdAt,
    };
  }

  static async syncRecentMessages(tenantId: string, limit: number = 100) {
    const start = Date.now();
    console.log(`[GmailRepository.syncRecentMessages] Starting for tenant: ${tenantId}, limit: ${limit}`);

    try {
      // Wait a bit and retry fetching Gmail account in case it's not created yet
      let gmailAccount: Array<{ id: string }> = [];
      let retries = 0;
      const maxRetries = 5;
      const retryDelay = 200; // ms

      while (retries < maxRetries && gmailAccount.length === 0) {
        gmailAccount = await db
          .select({
            id: corsairAccounts.id,
          })
          .from(corsairAccounts)
          .innerJoin(
            corsairIntegrations,
            eq(corsairAccounts.integrationId, corsairIntegrations.id)
          )
          .where(and(eq(corsairAccounts.tenantId, tenantId), eq(corsairIntegrations.name, "gmail")));

        if (gmailAccount.length === 0) {
          retries++;
          console.log(`[GmailRepository.syncRecentMessages] Gmail account not found yet, retrying (${retries}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      if (!gmailAccount.length) {
        console.error(`[GmailRepository.syncRecentMessages] No Gmail account found for tenant: ${tenantId} after ${maxRetries} retries`);
        return { success: false, synced: 0, duration: 0 };
      }

      const accountId = gmailAccount[0].id;
      const tenant = corsair.withTenant(tenantId);
      const messagesList = await tenant.gmail.api.messages.list({ maxResults: limit });
      const messages = messagesList.messages || [];
      
      // Filter out messages without id and fetch all full messages in parallel
      const validMessages = messages.filter((msg): msg is { id: string } => typeof msg.id === 'string');
      const fullMessages = await Promise.all(
        validMessages.map(msg => tenant.gmail.api.messages.get({ id: msg.id }))
      );

      // Now upsert all valid messages
      let syncedCount = 0;
      for (const fullMessage of fullMessages) {
        // Ensure fullMessage.id exists
        if (typeof fullMessage.id !== 'string') continue;

        const existingEntity = await db
          .select()
          .from(corsairEntities)
          .where(
            and(
              eq(corsairEntities.accountId, accountId),
              eq(corsairEntities.entityId, fullMessage.id),
              eq(corsairEntities.entityType, "messages")
            )
          );

        if (existingEntity.length) {
          await db
            .update(corsairEntities)
            .set({
              data: fullMessage as any,
              updatedAt: new Date(),
            })
            .where(eq(corsairEntities.id, existingEntity[0].id));
        } else {
          await db.insert(corsairEntities).values({
            id: `${accountId}-${fullMessage.id}`,
            accountId,
            entityType: "messages",
            entityId: fullMessage.id,
            version: "1",
            data: fullMessage as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        syncedCount++;
      }

      const duration = Date.now() - start;
      console.log(`[GmailRepository.syncRecentMessages] Success! synced: ${syncedCount}, duration: ${duration}ms, tenantId: ${tenantId}`);
      return { success: true, synced: syncedCount, duration };
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[GmailRepository.syncRecentMessages] Failed! duration: ${duration}ms, tenantId: ${tenantId}`, error);
      return { success: false, synced: 0, duration };
    }
  }

  static async getRecentMessages(tenantId: string, limit: number = 20) {
    // Fetch from our manually synced corsairEntities first
    const gmailAccount = await db
      .select({
        id: corsairAccounts.id,
      })
      .from(corsairAccounts)
      .innerJoin(
        corsairIntegrations,
        eq(corsairAccounts.integrationId, corsairIntegrations.id)
      )
      .where(and(eq(corsairAccounts.tenantId, tenantId), eq(corsairIntegrations.name, "gmail")));

    if (gmailAccount.length) {
      const accountId = gmailAccount[0].id;
      const syncedEntities = await db
        .select()
        .from(corsairEntities)
        .where(
          and(
            eq(corsairEntities.accountId, accountId),
            eq(corsairEntities.entityType, "messages")
          )
        )
        .orderBy(desc(corsairEntities.createdAt))
        .limit(limit);

      if (syncedEntities.length) {
        // Deduplicate by entityId & skip stub rows with no real message data
        const seen = new Set<string>();
        const unique = syncedEntities.filter((entity: any) => {
          if (!this.isUsableMessage(entity)) return false;
          if (seen.has(entity.entityId)) return false;
          seen.add(entity.entityId);
          return true;
        });
        if (unique.length) {
          return unique.map((entity: any) => this.normalizeMessage(entity));
        }
      }
    }

    // Fallback to tenant.gmail.db if no synced entities
    const tenant = corsair.withTenant(tenantId);
    const recent = await tenant.gmail.db.messages.list({ limit });
    return recent.map((msg: any) => this.normalizeMessage(msg));
  }

  static async getMessage(tenantId: string, messageId: string) {
    // Fetch from our manually synced corsairEntities first
    const gmailAccount = await db
      .select({
        id: corsairAccounts.id,
      })
      .from(corsairAccounts)
      .innerJoin(
        corsairIntegrations,
        eq(corsairAccounts.integrationId, corsairIntegrations.id)
      )
      .where(and(eq(corsairAccounts.tenantId, tenantId), eq(corsairIntegrations.name, "gmail")));

    if (gmailAccount.length) {
      const accountId = gmailAccount[0].id;
      const syncedEntity = await db
        .select()
        .from(corsairEntities)
        .where(
          and(
            eq(corsairEntities.accountId, accountId),
            eq(corsairEntities.entityId, messageId),
            eq(corsairEntities.entityType, "messages")
          )
        );

      if (syncedEntity.length) {
        const data = syncedEntity[0].data as any;
        if (data && (data.body || (data.payload && (data.payload.parts || (data.payload.body && data.payload.body.data))))) {
          return data;
        }
      }
    }

    // Fallback to corsair and API
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
    // Fetch from our manually synced corsairEntities first
    const gmailAccount = await db
      .select({
        id: corsairAccounts.id,
      })
      .from(corsairAccounts)
      .innerJoin(
        corsairIntegrations,
        eq(corsairAccounts.integrationId, corsairIntegrations.id)
      )
      .where(and(eq(corsairAccounts.tenantId, tenantId), eq(corsairIntegrations.name, "gmail")));

    if (gmailAccount.length) {
      const accountId = gmailAccount[0].id;
      const syncedEntities = await db
        .select()
        .from(corsairEntities)
        .where(
          and(
            eq(corsairEntities.accountId, accountId),
            eq(corsairEntities.entityType, "messages")
          )
        )
        .orderBy(desc(corsairEntities.createdAt));

      const unreadSynced = syncedEntities
        .filter((entity: any) => {
          const data = entity.data;
          return data?.labelIds?.includes("UNREAD");
        })
        .slice(0, limit);

      if (unreadSynced.length) {
        // Deduplicate by entityId & skip stub rows with no real message data
        const seen = new Set<string>();
        const unique = unreadSynced.filter((entity: any) => {
          if (!this.isUsableMessage(entity)) return false;
          if (seen.has(entity.entityId)) return false;
          seen.add(entity.entityId);
          return true;
        });
        if (unique.length) {
          return unique.map((entity: any) => this.normalizeMessage(entity));
        }
      }
    }

    // Fallback to tenant.gmail.db if no synced entities
    const tenant = corsair.withTenant(tenantId);
    const recent = await tenant.gmail.db.messages.list({ limit: 100 });
    
    return recent
      .filter((msg: any) => {
        const data = msg.data || msg;
        return data.labelIds?.includes("UNREAD");
      })
      .slice(0, limit)
      .map((msg: any) => this.normalizeMessage(msg));
  }

  static async sendEmail(tenantId: string, to: string, subject: string, body: string) {
    const tenant = corsair.withTenant(tenantId);
    
    const rawEmail = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      body
    ].join("\r\n");

    const encodedEmail = Buffer.from(rawEmail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return await tenant.gmail.api.messages.send({
      raw: encodedEmail,
    });
  }
}
