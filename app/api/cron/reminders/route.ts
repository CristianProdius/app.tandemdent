import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

import { sendReminderEmail } from "@/lib/actions/email.actions";
import {
  DATABASE_ID,
  APPOINTMENT_COLLECTION_ID,
  databases,
} from "@/lib/appwrite.config";

// This endpoint should be called by a cron job daily at 9 AM
// Vercel Cron configuration in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/reminders",
//     "schedule": "0 9 * * *"
//   }]
// }

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended for security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Find appointments scheduled for tomorrow that haven't received a reminder
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("status", "scheduled"),
        Query.greaterThanEqual("schedule", tomorrow.toISOString()),
        Query.lessThanEqual("schedule", tomorrowEnd.toISOString()),
        Query.equal("reminderEmailSent", false),
      ]
    );

    const results = {
      total: appointments.documents.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send reminder for each appointment
    for (const appointment of appointments.documents) {
      try {
        await sendReminderEmail(appointment.$id);

        // Mark reminder as sent
        await databases.updateDocument(
          DATABASE_ID!,
          APPOINTMENT_COLLECTION_ID!,
          appointment.$id,
          { reminderEmailSent: true }
        );

        results.sent++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `Appointment ${appointment.$id}: ${error.message}`
        );
        console.error(
          `Failed to send reminder for appointment ${appointment.$id}:`,
          error
        );
      }
    }

    console.log(
      `Reminder cron completed: ${results.sent} sent, ${results.failed} failed`
    );

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} appointments`,
      results,
    });
  } catch (error: any) {
    console.error("Error in reminder cron:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
