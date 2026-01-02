/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type Gender = "Masculin" | "Feminin" | "Altul";
declare type Status = "pending" | "scheduled" | "cancelled";

declare interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
}
declare interface User extends CreateUserParams {
  $id: string;
}

declare interface RegisterUserParams extends CreateUserParams {
  userId: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}

declare type CreateAppointmentParams = {
  userId: string;
  patient: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  status: Status;
  note: string | undefined;
};

declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  timeZone?: string;
  appointment: Appointment;
  type: string;
};

// Doctor params
declare interface CreateDoctorParams {
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  image?: string;
}

declare interface UpdateDoctorParams extends Partial<CreateDoctorParams> {
  googleCalendarConnected?: boolean;
  googleRefreshToken?: string;
  googleCalendarId?: string;
}

// Admin appointment creation (with patient search/select)
declare type CreateAppointmentAdminParams = {
  patientId: string;
  doctorId: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  note?: string;
  createdBy: string;
};

// Calendar link types
declare interface CalendarLinks {
  google: string;
  outlook: string;
  icsUrl: string;
}

// Email types
declare type EmailRecipientType = "patient" | "doctor";
declare type EmailType = "confirmation" | "reminder" | "cancellation";
declare type EmailStatus = "sent" | "delivered" | "failed";
