import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";

export async function GET() {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const status = await getIntegrationStatus(tenantId);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user accounts" }, { status: 500 });
  }
}
