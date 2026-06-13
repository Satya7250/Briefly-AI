import { corsair } from "@/corsair/client";
import { processOAuthCallback } from "corsair/oauth";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  const userId = await getTenantId();

  if (!userId) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const redirectUri = new URL(
    "/api/corsair/googlecalendar/callback",
    request.nextUrl.origin
  ).toString();

  await processOAuthCallback(corsair, {
    code,
    state,
    redirectUri,
  });

  return NextResponse.redirect(
    new URL("/dashboard/calendar", request.nextUrl.origin)
  );
}