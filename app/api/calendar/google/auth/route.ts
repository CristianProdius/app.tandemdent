import { NextRequest, NextResponse } from "next/server";

import { getGoogleAuthUrl } from "@/lib/google.config";

/**
 * Start Google OAuth flow for a doctor
 * GET /api/calendar/google/auth?doctorId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    const authUrl = getGoogleAuthUrl(doctorId);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Error starting Google auth:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start authentication" },
      { status: 500 }
    );
  }
}
