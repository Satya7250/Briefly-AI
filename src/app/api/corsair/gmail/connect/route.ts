import { corsair } from "@/corsair/client";
import { generateOAuthUrl } from "corsair/oauth";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isLoginFlow = searchParams.get("login") === "true";
  const userId = await getTenantId();

  if (!userId && !isLoginFlow) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const tenantId = userId ?? crypto.randomUUID();

  const redirectUri = new URL(
    "/api/corsair/gmail/callback",
    request.nextUrl.origin
  ).toString();

  const { url } = await generateOAuthUrl(corsair, "gmail", {
    tenantId,
    redirectUri,
  });

  return NextResponse.redirect(url);
}