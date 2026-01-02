import { NextRequest, NextResponse } from "next/server";

import { storeGoogleTokens } from "@/lib/actions/calendar.actions";
import { oauth2Client } from "@/lib/google.config";

/**
 * Handle Google OAuth callback
 * GET /api/calendar/google/callback?code=xxx&state=doctorId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // doctorId
    const error = searchParams.get("error");

    // Handle user denied access
    if (error) {
      console.log("User denied Google access:", error);
      return NextResponse.redirect(
        new URL(
          `/admin/doctors/${state}?error=access_denied`,
          process.env.NEXT_PUBLIC_BASE_URL || request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing authorization code or state" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      // This can happen if the user has already authorized the app before
      // In production, you might want to handle this differently
      console.warn("No refresh token received - user may need to re-authorize");
    }

    // Store the tokens for the doctor
    if (tokens.refresh_token) {
      await storeGoogleTokens(
        state,
        tokens.refresh_token,
        tokens.access_token || undefined
      );
    }

    // Redirect back to doctor page with success message
    return NextResponse.redirect(
      new URL(
        `/admin/doctors/${state}?success=calendar_connected`,
        process.env.NEXT_PUBLIC_BASE_URL || request.url
      )
    );
  } catch (error: any) {
    console.error("Error in Google OAuth callback:", error);

    // Redirect to doctor page with error
    const state = new URL(request.url).searchParams.get("state");
    if (state) {
      return NextResponse.redirect(
        new URL(
          `/admin/doctors/${state}?error=connection_failed`,
          process.env.NEXT_PUBLIC_BASE_URL || request.url
        )
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to complete authentication" },
      { status: 500 }
    );
  }
}
