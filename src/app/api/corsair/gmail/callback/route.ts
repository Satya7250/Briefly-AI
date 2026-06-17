import { corsair } from "@/corsair/client"
import { processOAuthCallback } from "corsair/oauth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { user as users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getUserProfile } from "@/features/mail/server/gmail-service"
import { GmailRepository } from "@/features/mail/server/gmail.repository"

export async function GET(request: NextRequest) {
  console.log("\n========== [GMAIL_CALLBACK] START ==========")
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  console.log("[GMAIL_CALLBACK] Code present:", !!code, "State present:", !!state)

  if (!code || !state) {
    console.log("[GMAIL_CALLBACK] Missing code/state")
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    )
  }

  const redirectUri = new URL(
    "/api/corsair/gmail/callback",
    request.nextUrl.origin
  ).toString()

  console.log("[GMAIL_CALLBACK] Processing OAuth callback with redirectUri:", redirectUri)
  const oauthResult = await processOAuthCallback(corsair, {
    code,
    state,
    redirectUri,
  })
  console.log("[GMAIL_CALLBACK] OAuth success, oauthResult:", JSON.stringify(oauthResult, null, 2))

  // Use existing getUserProfile function!
  let email: string | null = null
  let name: string | null = null
  try {
    console.log("[GMAIL_CALLBACK] Calling getUserProfile with tenant id:", oauthResult.tenantId)
    const profile = await getUserProfile(oauthResult.tenantId)
    console.log("[GMAIL_CALLBACK] getUserProfile returned:", profile)
    if (profile) {
      email = profile.email
      name = profile.displayName ?? null
    }
  } catch (err) {
    console.error("[GMAIL_CALLBACK] Error calling getUserProfile:", err)
  }

  console.log("[GMAIL_CALLBACK] Final email to use:", email)
  // If we got email, create/update user
  if (email) {
    console.log("[GMAIL_CALLBACK] Checking for existing user with email:", email)
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1)
    console.log("[GMAIL_CALLBACK] existingUsers found:", existingUsers)

    if (existingUsers.length === 0) {
      console.log("[GMAIL_CALLBACK] No existing user, creating new user with tenantId:", oauthResult.tenantId)
      await db.insert(users).values({
        id: oauthResult.tenantId,
        email,
        name: name ?? "User",
      })
      console.log("[GMAIL_CALLBACK] User created successfully")
    } else {
      const existingUser = existingUsers[0]
      console.log("[GMAIL_CALLBACK] User exists, updating. Current id:", existingUser.id, "New tenant id:", oauthResult.tenantId)
      await db.update(users).set({
        id: oauthResult.tenantId,
        updatedAt: new Date(),
      }).where(eq(users.email, email))
      console.log("[GMAIL_CALLBACK] User updated successfully")
    }
  } else {
    console.warn("[GMAIL_CALLBACK] NO EMAIL FOUND - CANNOT CREATE/UPDATE USER!")
  }

  const destination = "/dashboard"
  console.log("[GMAIL_CALLBACK] Determined destination:", destination)

  // Start automatic initial Gmail sync (fire-and-forget, don't block redirect)
  console.log("[GMAIL_CALLBACK] Starting automatic initial Gmail sync...")
  GmailRepository.syncRecentMessages(oauthResult.tenantId, 100).catch(err => {
    console.error("[GMAIL_CALLBACK] Auto sync failed:", err)
  })

  const response = NextResponse.redirect(
    new URL(destination, request.nextUrl.origin)
  )

  // Legacy setTenantId cookie setter removed (session is now managed by Better Auth)

  console.log("========== [GMAIL_CALLBACK] END ==========\n")
  return response
}
