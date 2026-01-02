"use server";

import { cookies } from "next/headers";
import { ID, Query } from "node-appwrite";

import { MagicLinkEmail } from "@/emails/templates/MagicLink";
import {
  databases,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
} from "@/lib/appwrite.config";
import { resend, EMAIL_FROM } from "@/lib/resend.config";

const SESSION_COOKIE_NAME = "patient_session";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://tandemdent.md";

/**
 * Find patient by email
 */
export async function getPatientByEmail(email: string) {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("email", email)]
    );

    return (patients.documents[0] as unknown as import("@/types/appwrite.types").Patient) || null;
  } catch (error) {
    console.error("Error finding patient by email:", error);
    return null;
  }
}

/**
 * Generate and send magic link to patient email
 */
export async function sendPatientMagicLink(email: string) {
  try {
    // First, check if patient exists
    const patient = await getPatientByEmail(email);

    if (!patient) {
      // Return success anyway to prevent email enumeration
      return { success: true };
    }

    // Generate a secure token
    const token = ID.unique();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the token in patient record (or a separate tokens collection)
    await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patient.$id,
      {
        magicLinkToken: token,
        magicLinkExpiresAt: expiresAt.toISOString(),
      }
    );

    // Send the magic link email
    const magicLink = `${BASE_URL}/portal/verify?token=${token}`;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Autentificare Tandem Dent",
      react: MagicLinkEmail({
        patientName: patient.name,
        magicLink,
        expiresInMinutes: 15,
      }),
    });

    if (error) {
      console.error("Error sending magic link email:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending magic link:", error);
    throw error;
  }
}

/**
 * Verify magic link token and create session
 */
export async function verifyMagicLink(token: string) {
  try {
    // Find patient with this token
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("magicLinkToken", token)]
    );

    if (patients.documents.length === 0) {
      return { success: false, error: "Token invalid" };
    }

    const patient = patients.documents[0] as unknown as import("@/types/appwrite.types").Patient;

    // Check if token is expired
    const expiresAt = new Date(patient.magicLinkExpiresAt!);
    if (expiresAt < new Date()) {
      return { success: false, error: "Token expirat" };
    }

    // Clear the token
    await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patient.$id,
      {
        magicLinkToken: null,
        magicLinkExpiresAt: null,
      }
    );

    // Create session token
    const sessionToken = ID.unique();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session token in patient record
    await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patient.$id,
      {
        sessionToken,
        sessionExpiresAt: sessionExpiresAt.toISOString(),
      }
    );

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: sessionExpiresAt,
      path: "/",
    });

    return { success: true, patientId: patient.$id };
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return { success: false, error: "Eroare de verificare" };
  }
}

/**
 * Get current patient session
 */
export async function getPatientSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    // Find patient with this session token
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("sessionToken", sessionToken)]
    );

    if (patients.documents.length === 0) {
      return null;
    }

    const patient = patients.documents[0] as unknown as import("@/types/appwrite.types").Patient;

    // Check if session is expired
    const expiresAt = new Date(patient.sessionExpiresAt!);
    if (expiresAt < new Date()) {
      // Clear expired session
      await logoutPatient();
      return null;
    }

    return {
      $id: patient.$id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
    };
  } catch (error) {
    console.error("Error getting patient session:", error);
    return null;
  }
}

/**
 * Logout patient and clear session
 */
export async function logoutPatient() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      // Find and clear patient session
      const patients = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        [Query.equal("sessionToken", sessionToken)]
      );

      if (patients.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID!,
          PATIENT_COLLECTION_ID!,
          patients.documents[0].$id,
          {
            sessionToken: null,
            sessionExpiresAt: null,
          }
        );
      }
    }

    // Clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);

    return { success: true };
  } catch (error) {
    console.error("Error logging out patient:", error);
    throw error;
  }
}

/**
 * Get patient's appointments
 */
export async function getPatientAppointments(patientId: string) {
  try {
    const { APPOINTMENT_COLLECTION_ID } = await import("@/lib/appwrite.config");

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("patient", patientId),
        Query.orderDesc("schedule"),
      ]
    );

    return appointments.documents;
  } catch (error) {
    console.error("Error getting patient appointments:", error);
    return [];
  }
}
