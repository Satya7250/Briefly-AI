import { db } from "@/db";
import { corsairAccounts, corsairIntegrations } from "@/db/schema/corsair";
import { eq, and } from "drizzle-orm";

export async function getIntegrationStatus(tenantId: string) {
  const accounts = await db
    .select({
      integrationName: corsairIntegrations.name,
      createdAt: corsairAccounts.createdAt,
    })
    .from(corsairAccounts)
    .innerJoin(
      corsairIntegrations,
      eq(corsairAccounts.integrationId, corsairIntegrations.id)
    )
    .where(eq(corsairAccounts.tenantId, tenantId));

  const gmailAccount = accounts.find((a) => a.integrationName === "gmail");
  const calendarAccount = accounts.find(
    (a) => a.integrationName === "googlecalendar"
  );

  return {
    gmailConnected: !!gmailAccount,
    calendarConnected: !!calendarAccount,
    gmailConnectedAt: gmailAccount?.createdAt || null,
    calendarConnectedAt: calendarAccount?.createdAt || null,
  };
}
