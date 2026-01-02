"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { parseStringify } from "../utils";

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      {
        ...appointment,
        confirmationEmailSent: false,
        reminderEmailSent: false,
      }
    );

    // Send confirmation email and create calendar event if scheduled
    if (appointment.status === "scheduled") {
      try {
        const { sendConfirmationEmail } = await import("./email.actions");
        const { createCalendarEvent } = await import("./calendar.actions");

        // Send confirmation email
        await sendConfirmationEmail(newAppointment.$id);
        await databases.updateDocument(
          DATABASE_ID!,
          APPOINTMENT_COLLECTION_ID!,
          newAppointment.$id,
          { confirmationEmailSent: true }
        );

        // Create Google Calendar event
        await createCalendarEvent(newAppointment.$id);
      } catch (emailError) {
        console.error("Error sending confirmation email or creating calendar event:", emailError);
      }
    }

    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    // const scheduledAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "scheduled");

    // const pendingAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "pending");

    // const cancelledAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "cancelled");

    // const data = {
    //   totalCount: appointments.total,
    //   scheduledCount: scheduledAppointments.length,
    //   pendingCount: pendingAppointments.length,
    //   cancelledCount: cancelledAppointments.length,
    //   documents: appointments.documents,
    // };

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;
          case "pending":
            acc.pendingCount++;
            break;
          case "cancelled":
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    // https://appwrite.io/docs/references/1.5.x/server-nodejs/messaging#createSms
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("An error occurred while sending sms:", error);
  }
};

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    // Update appointment to scheduled -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#updateDocument
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    ) as unknown as Appointment;

    if (!updatedAppointment) throw Error;

    // Handle email and calendar based on type
    try {
      const { sendConfirmationEmail, sendCancellationEmail } = await import("./email.actions");
      const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = await import("./calendar.actions");

      if (type === "schedule") {
        // Send confirmation email if not already sent
        if (!updatedAppointment.confirmationEmailSent) {
          await sendConfirmationEmail(appointmentId);
          await databases.updateDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,
            { confirmationEmailSent: true }
          );
        }

        // Create or update Google Calendar event
        if (updatedAppointment.googleCalendarEventId) {
          await updateCalendarEvent(appointmentId);
        } else {
          await createCalendarEvent(appointmentId);
        }
      } else if (type === "cancel") {
        // Send cancellation email
        await sendCancellationEmail(appointmentId, appointment.cancellationReason);

        // Delete Google Calendar event
        await deleteCalendarEvent(appointmentId);
      }
    } catch (emailError) {
      console.error("Error handling email/calendar:", emailError);
    }

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing patient:",
      error
    );
  }
};

// GET APPOINTMENTS BY DATE RANGE (for calendar view)
export const getAppointmentsByDateRange = async (
  startDate: string,
  endDate: string,
  doctorId?: string
) => {
  try {
    const queries = [
      Query.greaterThanEqual("schedule", startDate),
      Query.lessThanEqual("schedule", endDate),
      Query.orderAsc("schedule"),
      Query.limit(500), // Increase limit for calendar view
    ];

    // Filter by doctor if specified
    if (doctorId) {
      queries.push(Query.equal("doctorId", doctorId));
    }

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    return parseStringify(appointments.documents) as Appointment[];
  } catch (error) {
    console.error("Error getting appointments by date range:", error);
    return [];
  }
};

// GET ALL APPOINTMENTS (with optional filters)
export const getAllAppointments = async (filters?: {
  status?: string;
  doctorId?: string;
  patientId?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const queries = [Query.orderDesc("schedule")];

    if (filters?.status) {
      queries.push(Query.equal("status", filters.status));
    }
    if (filters?.doctorId) {
      queries.push(Query.equal("doctorId", filters.doctorId));
    }
    if (filters?.patientId) {
      queries.push(Query.equal("userId", filters.patientId));
    }
    if (filters?.limit) {
      queries.push(Query.limit(filters.limit));
    }
    if (filters?.offset) {
      queries.push(Query.offset(filters.offset));
    }

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      queries
    );

    return {
      appointments: parseStringify(appointments.documents) as Appointment[],
      total: appointments.total,
    };
  } catch (error) {
    console.error("Error getting all appointments:", error);
    return { appointments: [], total: 0 };
  }
};

// Time slot interface for availability
export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
  available: boolean;
  appointmentId?: string;
  patientName?: string;
  reason?: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0-6 (Sunday = 0)
  isClosed: boolean; // true for Sundays
  slots: TimeSlot[];
}

// Working hours configuration
const WORKING_HOURS = {
  startHour: 8, // 08:00
  endHour: 20, // 20:00
  slotDuration: 30, // 30 minutes
};

// GET DOCTOR AVAILABILITY (for smart booking)
export const getDoctorAvailability = async (
  doctorId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string, // YYYY-MM-DD
  requiredDuration: number = 30 // minutes needed for the appointment
): Promise<DayAvailability[]> => {
  try {
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch existing appointments for this doctor in the date range
    const startISO = new Date(startDate + "T00:00:00").toISOString();
    const endISO = new Date(endDate + "T23:59:59").toISOString();

    const existingAppointments = await getAppointmentsByDateRange(
      startISO,
      endISO,
      doctorId
    );

    // Filter out cancelled appointments
    const activeAppointments = existingAppointments.filter(
      (apt) => apt.status !== "cancelled"
    );

    // Create a map of occupied time ranges
    const occupiedSlots = new Map<string, Appointment>();
    activeAppointments.forEach((apt) => {
      const aptDate = new Date(apt.schedule);
      // Create keys for each 30-min slot the appointment occupies
      // Default to 60 min if no duration info available
      const duration = 60; // TODO: Get from appointment/services
      const slots = Math.ceil(duration / WORKING_HOURS.slotDuration);

      for (let i = 0; i < slots; i++) {
        const slotTime = new Date(aptDate.getTime() + i * WORKING_HOURS.slotDuration * 60000);
        const key = slotTime.toISOString();
        occupiedSlots.set(key, apt);
      }
    });

    // Generate availability for each day
    const availability: DayAvailability[] = [];

    // Calculate number of days in range
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let dayIndex = 0; dayIndex < daysDiff; dayIndex++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + dayIndex);

      const dateStr = currentDate.toISOString().split("T")[0];
      const dayOfWeek = currentDate.getDay();
      const isSunday = dayOfWeek === 0;
      const isPastDay = currentDate < new Date(new Date().toDateString());

      const daySlots: TimeSlot[] = [];

      // Generate time slots for this day
      for (let hour = WORKING_HOURS.startHour; hour < WORKING_HOURS.endHour; hour++) {
        for (let min = 0; min < 60; min += WORKING_HOURS.slotDuration) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, min, 0, 0);

          const slotEnd = new Date(slotStart.getTime() + WORKING_HOURS.slotDuration * 60000);

          // Check if this slot is in the past
          const isPastSlot = slotStart < new Date();

          // Check if this slot is occupied
          const slotKey = slotStart.toISOString();
          const occupyingAppointment = occupiedSlots.get(slotKey);

          // Check if there's enough consecutive time for the required duration
          let hasEnoughTime = true;
          if (!isSunday && !isPastSlot && !occupyingAppointment) {
            const slotsNeeded = Math.ceil(requiredDuration / WORKING_HOURS.slotDuration);
            for (let i = 1; i < slotsNeeded; i++) {
              const futureSlot = new Date(slotStart.getTime() + i * WORKING_HOURS.slotDuration * 60000);
              // Check if future slot is still within working hours
              if (futureSlot.getHours() >= WORKING_HOURS.endHour) {
                hasEnoughTime = false;
                break;
              }
              // Check if future slot is occupied
              if (occupiedSlots.has(futureSlot.toISOString())) {
                hasEnoughTime = false;
                break;
              }
            }
          }

          daySlots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: !isSunday && !isPastSlot && !isPastDay && !occupyingAppointment && hasEnoughTime,
            appointmentId: occupyingAppointment?.$id,
            patientName: occupyingAppointment?.patient?.name,
            reason: occupyingAppointment?.reason,
          });
        }
      }

      availability.push({
        date: dateStr,
        dayOfWeek,
        isClosed: isSunday,
        slots: daySlots,
      });
    }

    return availability;
  } catch (error) {
    console.error("Error getting doctor availability:", error);
    return [];
  }
};
