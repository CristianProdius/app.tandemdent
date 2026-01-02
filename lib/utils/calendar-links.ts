/**
 * Generate calendar links for adding appointments to various calendar apps
 */

interface AppointmentDetails {
  appointmentId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export interface CalendarLinks {
  google: string;
  outlook: string;
  icsUrl: string;
}

/**
 * Format date for Google Calendar URL (YYYYMMDDTHHmmssZ)
 */
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Format date for Outlook URL (ISO format)
 */
function formatOutlookDate(date: Date): string {
  return date.toISOString();
}

/**
 * Generate all calendar links for an appointment
 */
export function generateCalendarLinks(
  appointment: AppointmentDetails,
  baseUrl: string
): CalendarLinks {
  const { appointmentId, title, description, startDate, endDate, location } =
    appointment;

  // Google Calendar link
  const googleParams = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: description,
    ...(location && { location }),
  });
  const google = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

  // Outlook Web link
  const outlookParams = new URLSearchParams({
    subject: title,
    startdt: formatOutlookDate(startDate),
    enddt: formatOutlookDate(endDate),
    body: description,
    ...(location && { location }),
  });
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;

  // ICS file download URL
  const icsUrl = `${baseUrl}/api/calendar/ics/${appointmentId}`;

  return { google, outlook, icsUrl };
}

/**
 * Generate ICS file content for calendar import
 */
export function generateICSContent(appointment: AppointmentDetails): string {
  const { title, description, startDate, endDate, location } = appointment;

  // Format date for ICS (YYYYMMDDTHHmmssZ)
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const uid = `${appointment.appointmentId}@tandemdent.md`;
  const dtstamp = formatICSDate(new Date());
  const dtstart = formatICSDate(startDate);
  const dtend = formatICSDate(endDate);

  // Escape special characters in text fields
  const escapeICS = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tandem Dent//Appointment System//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    ...(location ? [`LOCATION:${escapeICS(location)}`] : []),
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Appointment tomorrow",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Appointment in 1 hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

/**
 * Create appointment details object from appointment data
 */
export function createAppointmentDetails(
  appointmentId: string,
  patientName: string,
  doctorName: string,
  schedule: Date,
  reason: string,
  durationMinutes: number = 60
): AppointmentDetails {
  const startDate = new Date(schedule);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return {
    appointmentId,
    title: `Programare Tandem Dent - Dr. ${doctorName}`,
    description: `Pacient: ${patientName}\nMotiv: ${reason}\n\nContact: +373 22 123 456`,
    startDate,
    endDate,
    location: "Tandem Dent, Chișinău",
  };
}
