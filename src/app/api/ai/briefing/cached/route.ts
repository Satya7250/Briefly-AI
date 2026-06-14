import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { briefingCache } from "@/lib/briefing-cache";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const cached = briefingCache.get(tenantId);
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
      console.log(`[CACHE] Served cached briefing for tenant: ${tenantId}`);
      return NextResponse.json({ briefing: cached.briefing });
    }

    return NextResponse.json({ briefing: null });
  } catch (error) {
    console.error("Error fetching cached briefing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
