import { getIntegrationStatus } from "@/lib/integrations";
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
    const status = await getIntegrationStatus(tenantId);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error("Error getting integration status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get integration status" },
      { status: 500 }
    );
  }
}
