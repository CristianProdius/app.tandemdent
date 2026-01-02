import { Models } from "node-appwrite";

export interface Patient extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
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
  // Patient portal auth fields
  appwriteAuthId?: string;
  magicLinkToken?: string;
  magicLinkExpiresAt?: string;
  sessionToken?: string;
  sessionExpiresAt?: string;
}

export interface Doctor extends Models.Document {
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  image?: string;
  // Google Calendar integration
  googleCalendarConnected: boolean;
  googleRefreshToken?: string;
  googleCalendarId?: string;
}

export interface Appointment extends Models.Document {
  patient: Patient;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  userId: string;
  cancellationReason: string | null;
  // New fields for notifications and calendar
  doctorId?: string;
  googleCalendarEventId?: string;
  confirmationEmailSent?: boolean;
  reminderEmailSent?: boolean;
  createdBy?: string; // Admin who created the appointment
}

export interface EmailLog extends Models.Document {
  appointmentId: string;
  recipientEmail: string;
  recipientType: "patient" | "doctor";
  emailType: "confirmation" | "reminder" | "cancellation";
  resendMessageId?: string;
  status: "sent" | "delivered" | "failed";
  sentAt: Date;
  errorMessage?: string;
}

export interface Service extends Models.Document {
  name: string;
  description?: string;
  duration: number; // Duration in minutes
  price: number;
  isActive: boolean;
  category?: "medical" | "cosmetic";
}

// Tooth condition types
export type ToothCondition =
  | "healthy"
  | "caries"
  | "decay"
  | "fracture"
  | "missing"
  | "filled"
  | "crown"
  | "root_canal"
  | "implant";

// Treatment types
export type TreatmentType =
  | "examination"
  | "cleaning"
  | "tooth_filling"
  | "root_canal"
  | "crown"
  | "extraction"
  | "whitening"
  | "implant"
  | "scaling"
  | "polishing";

// Treatment status
export type TreatmentStatus = "pending" | "in_progress" | "done";

// Treatment interface
export interface Treatment extends Models.Document {
  patientId: string;
  toothNumber: number; // FDI notation: 11-18, 21-28, 31-38, 41-48
  condition: ToothCondition;
  treatment: TreatmentType;
  status: TreatmentStatus;
  doctorId: string;
  doctorName?: string;
  appointmentId?: string;
  notes?: string;
  date: string;
}
