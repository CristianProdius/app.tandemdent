"use server";

import { google } from "googleapis";

import {
  databases,
  DATABASE_ID,
  DOCTOR_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
} from "@/lib/appwrite.config";
import { oauth2Client } from "@/lib/google.config";

import { getAppointment } from "./appointment.actions";
import { getDoctorByName } from "./doctor.actions";

/**
 * Create a Google Calendar event for an appointment
 */
export async function createCalendarEvent(appointmentId: string) {
  try {
    const appointment = await getAppointment(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const doctor = await getDoctorByName(appointment.primaryPhysician);
    if (!doctor || !doctor.googleCalendarConnected || !doctor.googleRefreshToken) {
      console.log("Doctor not connected to Google Calendar");
      return { success: false, reason: "Doctor not connected" };
    }

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: doctor.googleRefreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startTime = new Date(appointment.schedule);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour default

    const event = {
      summary: `Programare: ${appointment.patient.name}`,
      description: `Pacient: ${appointment.patient.name}\nTelefon: ${appointment.patient.phone}\nMotiv: ${appointment.reason}\n\nCreat de Tandem Dent`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "Europe/Chisinau",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "Europe/Chisinau",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 60 }, // 1 hour before
        ],
      },
    };

    const calendarId = doctor.googleCalendarId || "primary";

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    // Store the event ID in the appointment
    await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        googleCalendarEventId: response.data.id,
      }
    );

    console.log(`Created Google Calendar event: ${response.data.id}`);
    return { success: true, eventId: response.data.id };
  } catch (error: any) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a Google Calendar event for an appointment
 */
export async function updateCalendarEvent(appointmentId: string) {
  try {
    const appointment = await getAppointment(appointmentId);
    if (!appointment || !appointment.googleCalendarEventId) {
      console.log("No calendar event to update");
      return { success: false, reason: "No event to update" };
    }

    const doctor = await getDoctorByName(appointment.primaryPhysician);
    if (!doctor || !doctor.googleCalendarConnected || !doctor.googleRefreshToken) {
      console.log("Doctor not connected to Google Calendar");
      return { success: false, reason: "Doctor not connected" };
    }

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: doctor.googleRefreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startTime = new Date(appointment.schedule);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const event = {
      summary: `Programare: ${appointment.patient.name}`,
      description: `Pacient: ${appointment.patient.name}\nTelefon: ${appointment.patient.phone}\nMotiv: ${appointment.reason}\n\nCreat de Tandem Dent`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "Europe/Chisinau",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "Europe/Chisinau",
      },
    };

    const calendarId = doctor.googleCalendarId || "primary";

    await calendar.events.update({
      calendarId,
      eventId: appointment.googleCalendarEventId,
      requestBody: event,
    });

    console.log(`Updated Google Calendar event: ${appointment.googleCalendarEventId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating calendar event:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a Google Calendar event for an appointment
 */
export async function deleteCalendarEvent(appointmentId: string) {
  try {
    const appointment = await getAppointment(appointmentId);
    if (!appointment || !appointment.googleCalendarEventId) {
      console.log("No calendar event to delete");
      return { success: false, reason: "No event to delete" };
    }

    const doctor = await getDoctorByName(appointment.primaryPhysician);
    if (!doctor || !doctor.googleCalendarConnected || !doctor.googleRefreshToken) {
      console.log("Doctor not connected to Google Calendar");
      return { success: false, reason: "Doctor not connected" };
    }

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: doctor.googleRefreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarId = doctor.googleCalendarId || "primary";

    await calendar.events.delete({
      calendarId,
      eventId: appointment.googleCalendarEventId,
    });

    // Clear the event ID from the appointment
    await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        googleCalendarEventId: null,
      }
    );

    console.log(`Deleted Google Calendar event: ${appointment.googleCalendarEventId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting calendar event:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Store Google Calendar tokens for a doctor
 */
export async function storeGoogleTokens(
  doctorId: string,
  refreshToken: string,
  accessToken?: string
) {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      {
        googleCalendarConnected: true,
        googleRefreshToken: refreshToken,
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error storing Google tokens:", error);
    throw error;
  }
}

/**
 * Disconnect Google Calendar for a doctor
 */
export async function disconnectGoogleCalendar(doctorId: string) {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      {
        googleCalendarConnected: false,
        googleRefreshToken: null,
        googleCalendarId: null,
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error disconnecting Google Calendar:", error);
    throw error;
  }
}
