import { corsair } from "@/corsair/client";

export interface InboxMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  createdAt: Date;
}

export interface FullGmailMessage {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  body: string;
  snippet: string;
  createdAt: Date;
}

interface GmailHeader {
  name?: string;
  value?: string;
}

interface GmailBody {
  data?: string;
  [key: string]: unknown;
}

interface GmailPayloadPart {
  mimeType?: string;
  body?: GmailBody;
  parts?: GmailPayloadPart[];
  [key: string]: unknown;
}

interface GmailPayload {
  mimeType?: string;
  body?: GmailBody;
  parts?: GmailPayloadPart[];
  headers?: GmailHeader[];
  [key: string]: unknown;
}

function decodeBase64(data?: string): string {
  if (!data) return "";

  try {
    return Buffer.from(
      data.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf-8");
  } catch {
    return "";
  }
}

function findHtmlPart(payload?: GmailPayloadPart): string | null {
  if (!payload) return null;

  if (
    payload.mimeType === "text/html" &&
    payload.body?.data
  ) {
    return decodeBase64(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = findHtmlPart(part);

      if (result) {
        return result;
      }
    }
  }

  return null;
}

function findTextPart(payload?: GmailPayloadPart): string | null {
  if (!payload) return null;

  if (
    payload.mimeType === "text/plain" &&
    payload.body?.data
  ) {
    return decodeBase64(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = findTextPart(part);

      if (result) {
        return result;
      }
    }
  }

  return null;
}

function extractBody(payload?: GmailPayload): string {
  if (!payload) return "";
  
  const htmlBody = findHtmlPart(payload);

  if (htmlBody) {
    return htmlBody;
  }

  const textBody = findTextPart(payload);

  if (textBody) {
    return textBody;
  }

  if (payload?.body?.data) {
    return decodeBase64(payload.body.data);
  }

  return "";
}

export async function getInboxMessages(tenantId: string): Promise<InboxMessage[]> {
  try {
    const tenant = corsair.withTenant(tenantId);
    const result = await tenant.gmail.api.messages.list({ maxResults: 20 });
    
    if (!result.messages) return [];
    
    // Fetch message details to get subject, from, etc.
    const messages = await Promise.all(
      result.messages
        .filter((msg): msg is { id: string; [key: string]: unknown } => msg.id !== undefined)
        .map(async (msg) => {
          const message = await tenant.gmail.api.messages.get({ id: msg.id, format: "metadata" });
          
          const subject = message.payload?.headers?.find((h: GmailHeader) => h.name === "Subject")?.value || "No Subject";
          const from = message.payload?.headers?.find((h: GmailHeader) => h.name === "From")?.value || "Unknown Sender";
          const createdAt = new Date(parseInt(message.internalDate as string));
          
          return {
            id: message.id as string,
            threadId: message.threadId as string,
            subject,
            from,
            snippet: message.snippet as string,
            createdAt,
          };
        })
    );
    
    // Sort by date descending
    return messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    if (
      error instanceof Error && 
      error.message.includes("Account not found")
    ) {
      return [];
    }
    console.error("GMAIL SERVICE ERROR:", error);
    throw error;
  }
}

export async function getMessageById(tenantId: string, messageId: string): Promise<FullGmailMessage> {
  const tenant = corsair.withTenant(tenantId);
  const message = await tenant.gmail.api.messages.get({ id: messageId, format: "full" });
  
  const subject = message.payload?.headers?.find(
    (h: GmailHeader) => h.name === "Subject"
  )?.value ?? "No Subject";
  
  const sender = message.payload?.headers?.find(
    (h: GmailHeader) => h.name === "From"
  )?.value ?? "Unknown Sender";
  
  const body = extractBody(message.payload as GmailPayload);

  return {
    id: message.id as string,
    threadId: message.threadId as string,
    subject,
    sender,
    body,
    snippet: message.snippet as string,
    createdAt: new Date(parseInt(message.internalDate as string)),
  };
}

export async function getUnreadEmails(tenantId: string): Promise<InboxMessage[]> {
  try {
    const tenant = corsair.withTenant(tenantId);
    const response = await tenant.gmail.api.messages.list({
      maxResults: 20,
      q: "is:unread",
    });

    if (!response.messages) return [];

    const messages = await Promise.all(
      response.messages
        .filter((msg): msg is { id: string; [key: string]: unknown } => msg.id !== undefined)
        .map(async (msg) => {
          const message = await tenant.gmail.api.messages.get({ id: msg.id, format: "metadata" });
          
          const subject = message.payload?.headers?.find((h: GmailHeader) => h.name === "Subject")?.value || "No Subject";
          const from = message.payload?.headers?.find((h: GmailHeader) => h.name === "From")?.value || "Unknown Sender";
          const createdAt = new Date(parseInt(message.internalDate as string));
          
          return {
            id: message.id as string,
            threadId: message.threadId as string,
            subject,
            from,
            snippet: message.snippet as string,
            createdAt,
          };
        })
    );

    return messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    if (
      error instanceof Error && 
      error.message.includes("Account not found")
    ) {
      return [];
    }
    console.error("GET UNREAD EMAILS ERROR:", error);
    throw error;
  }
}

export async function getUserProfile(tenantId: string): Promise<{ email: string; displayName?: string } | null> {
  try {
    const tenant = corsair.withTenant(tenantId);
    // Manually call Gmail's users.getProfile API
    const gmailKeys = tenant.gmail.keys;
    const accessToken = await gmailKeys.get_access_token();
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`);
    }
    
    const profile = await response.json();
    if (profile.emailAddress) {
      return {
        email: profile.emailAddress as string,
        displayName: (profile as any).displayName,
      };
    }
    return null;
  } catch (error) {
    if (
      error instanceof Error && 
      (error.message.includes("Account not found") || error.message.includes("Cannot read properties"))
    ) {
      return null;
    }
    console.error("GET USER PROFILE ERROR:", error);
    return null;
  }
}
