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
