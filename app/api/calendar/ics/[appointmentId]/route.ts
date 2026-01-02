import { NextRequest, NextResponse } from "next/server";

import { getAppointment } from "@/lib/actions/appointment.actions";
import {
  createAppointmentDetails,
  generateICSContent,
} from "@/lib/utils/calendar-links";

export async function GET(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const { appointmentId } = params;

    // Get appointment details
    const appointment = await getAppointment(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Create appointment details for ICS
    const appointmentDetails = createAppointmentDetails(
      appointmentId,
      appointment.patient.name,
      appointment.primaryPhysician,
      new Date(appointment.schedule),
      appointment.reason
    );

    // Generate ICS content
    const icsContent = generateICSContent(appointmentDetails);

    // Return ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="tandemdent-appointment-${appointmentId}.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating ICS file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
