"use server";

import { AppointmentCancellationEmail } from "@/emails/templates/AppointmentCancellation";
import { AppointmentConfirmationEmail } from "@/emails/templates/AppointmentConfirmation";
import { AppointmentReminderEmail } from "@/emails/templates/AppointmentReminder";
import { resend, EMAIL_FROM } from "@/lib/resend.config";
import { formatDateTime } from "@/lib/utils";
import {
  generateCalendarLinks,
  createAppointmentDetails,
} from "@/lib/utils/calendar-links";

import { getAppointment } from "./appointment.actions";
import { getDoctorByName } from "./doctor.actions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://tandemdent.md";

/**
 * Send appointment confirmation email to patient
 */
export async function sendConfirmationEmail(appointmentId: string) {
  try {
    const appointment = await getAppointment(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const patient = appointment.patient;
    const doctor = await getDoctorByName(appointment.primaryPhysician);
    const { dateOnly, timeOnly } = formatDateTime(appointment.schedule);

    // Generate calendar links
    const appointmentDetails = createAppointmentDetails(
      appointmentId,
      patient.name,
      appointment.primaryPhysician,
      new Date(appointment.schedule),
      appointment.reason
    );
    const calendarLinks = generateCalendarLinks(appointmentDetails, BASE_URL);

    // Send to patient
    const { data: patientEmail, error: patientError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: patient.email,
      subject: `Confirmare programare - ${dateOnly}`,
      react: AppointmentConfirmationEmail({
        patientName: patient.name,
        doctorName: appointment.primaryPhysician,
        appointmentDate: dateOnly,
        appointmentTime: timeOnly,
        reason: appointment.reason,
        calendarLinks,
      }),
    });

    if (patientError) {
      console.error("Error sending patient confirmation email:", patientError);
      throw patientError;
    }

    // Send to doctor if email exists
    if (doctor?.email) {
      const { error: doctorError } = await resend.emails.send({
        from: EMAIL_FROM,
        to: doctor.email,
        subject: `Programare nouă: ${patient.name} - ${dateOnly}`,
        react: AppointmentConfirmationEmail({
          patientName: patient.name,
          doctorName: appointment.primaryPhysician,
          appointmentDate: dateOnly,
          appointmentTime: timeOnly,
          reason: appointment.reason,
          calendarLinks,
        }),
      });

      if (doctorError) {
        console.error("Error sending doctor confirmation email:", doctorError);
      }
    }

    return { success: true, messageId: patientEmail?.id };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
}

/**
 * Send appointment reminder email to patient
 */
export async function sendReminderEmail(appointmentId: string) {
  try {
    const appointment = await getAppointment(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const patient = appointment.patient;
    const doctor = await getDoctorByName(appointment.primaryPhysician);
    const { dateOnly, timeOnly } = formatDateTime(appointment.schedule);

    // Send to patient
    const { data: patientEmail, error: patientError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: patient.email,
      subject: `Reminder: Programare mâine - ${timeOnly}`,
      react: AppointmentReminderEmail({
        patientName: patient.name,
        doctorName: appointment.primaryPhysician,
        appointmentDate: dateOnly,
        appointmentTime: timeOnly,
        reason: appointment.reason,
      }),
    });

    if (patientError) {
      console.error("Error sending patient reminder email:", patientError);
      throw patientError;
    }

    // Send to doctor if email exists
    if (doctor?.email) {
      const { error: doctorError } = await resend.emails.send({
        from: EMAIL_FROM,
        to: doctor.email,
        subject: `Reminder: ${patient.name} mâine - ${timeOnly}`,
        react: AppointmentReminderEmail({
          patientName: patient.name,
          doctorName: appointment.primaryPhysician,
          appointmentDate: dateOnly,
          appointmentTime: timeOnly,
          reason: appointment.reason,
        }),
      });

      if (doctorError) {
        console.error("Error sending doctor reminder email:", doctorError);
      }
    }

    return { success: true, messageId: patientEmail?.id };
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw error;
  }
}

/**
 * Send appointment cancellation email to patient
 */
export async function sendCancellationEmail(
  appointmentId: string,
  cancellationReason?: string
) {
  try {
    const appointment = await getAppointment(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const patient = appointment.patient;
    const doctor = await getDoctorByName(appointment.primaryPhysician);
    const { dateOnly, timeOnly } = formatDateTime(appointment.schedule);

    // Send to patient
    const { data: patientEmail, error: patientError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: patient.email,
      subject: `Programare anulată - ${dateOnly}`,
      react: AppointmentCancellationEmail({
        patientName: patient.name,
        doctorName: appointment.primaryPhysician,
        appointmentDate: dateOnly,
        appointmentTime: timeOnly,
        cancellationReason,
      }),
    });

    if (patientError) {
      console.error("Error sending patient cancellation email:", patientError);
      throw patientError;
    }

    // Send to doctor if email exists
    if (doctor?.email) {
      const { error: doctorError } = await resend.emails.send({
        from: EMAIL_FROM,
        to: doctor.email,
        subject: `Programare anulată: ${patient.name} - ${dateOnly}`,
        react: AppointmentCancellationEmail({
          patientName: patient.name,
          doctorName: appointment.primaryPhysician,
          appointmentDate: dateOnly,
          appointmentTime: timeOnly,
          cancellationReason,
        }),
      });

      if (doctorError) {
        console.error("Error sending doctor cancellation email:", doctorError);
      }
    }

    return { success: true, messageId: patientEmail?.id };
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw error;
  }
}
