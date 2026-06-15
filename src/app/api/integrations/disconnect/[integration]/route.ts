import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { db } from "@/db";
import { corsairAccounts, corsairIntegrations, corsairEntities, corsairEvents } from "@/db/schema/corsair";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ integration: string }> }
) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { integration: integrationName } = await params;

    // First, get the integration ID for the given integration name
    const integration = await db
      .select({ id: corsairIntegrations.id })
      .from(corsairIntegrations)
      .where(eq(corsairIntegrations.name, integrationName))
      .limit(1);

    if (!integration.length) {
      return NextResponse.json(
        { success: false, error: "Integration not found" },
        { status: 404 }
      );
    }

    const integrationId = integration[0].id;

    // Delete the account for this tenant and integration
    // Fetch account IDs for the tenant & integration
    const accounts = await db
      .select({ id: corsairAccounts.id })
      .from(corsairAccounts)
      .where(
        and(
          eq(corsairAccounts.tenantId, tenantId),
          eq(corsairAccounts.integrationId, integrationId)
        )
      );

    // Delete related entities and events for each account
    for (const acc of accounts) {
      await db.delete(corsairEntities).where(eq(corsairEntities.accountId, acc.id));
      await db.delete(corsairEvents).where(eq(corsairEvents.accountId, acc.id));
    }

    // Delete the account(s)
    await db
      .delete(corsairAccounts)
      .where(
        and(
          eq(corsairAccounts.tenantId, tenantId),
          eq(corsairAccounts.integrationId, integrationId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}
