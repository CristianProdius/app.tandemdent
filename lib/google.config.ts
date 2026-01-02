import { google } from "googleapis";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export const calendar = google.calendar({ version: "v3" });

export const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

// Generate the authorization URL for doctor calendar connection
export function getGoogleAuthUrl(doctorId: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: doctorId, // Pass doctor ID to identify which doctor is connecting
    prompt: "consent", // Force consent screen to get refresh token
  });
}

// Set credentials from stored tokens
export function setGoogleCredentials(refreshToken: string) {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });
}
