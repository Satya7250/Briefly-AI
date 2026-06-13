import { corsair } from "@/corsair/client";
import { generateOAuthUrl } from "corsair/oauth";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const tenantId = await getTenantId();

  if (!tenantId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const redirectUri = new URL(
    "/api/corsair/googlecalendar/callback",
    request.nextUrl.origin
  ).toString();

  const { url } = await generateOAuthUrl(
    corsair,
    "googlecalendar",
    {
      tenantId,
      redirectUri,
    }
  );

  return NextResponse.redirect(url);
}