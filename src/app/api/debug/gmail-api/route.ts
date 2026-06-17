import { corsair } from "@/corsair/client";
import { getTenantId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tenantId = await getTenantId();

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const tenant = corsair.withTenant(tenantId);

    // Log what's on tenant.gmail
    console.log("Debug tenant.gmail keys:", Object.keys(tenant.gmail));

    // Try any sync methods
    const result = await tenant.gmail.api.messages.list({
      maxResults: 20,
    });

    console.log("Debug Gmail API:");
    console.log("- tenantId:", tenantId);
    console.log("- messages count:", result.messages?.length || 0);
    console.log("- resultSizeEstimate:", result.resultSizeEstimate);

    return NextResponse.json({
      success: true,
      data: result,
      gmailKeys: Object.keys(tenant.gmail)
    });
  } catch (error: any) {
    console.error("Debug Gmail API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
