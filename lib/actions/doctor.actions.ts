"use server";

import { ID, Query } from "node-appwrite";

import {
  DATABASE_ID,
  DOCTOR_COLLECTION_ID,
  databases,
} from "@/lib/appwrite.config";
import { parseStringify } from "@/lib/utils";
import { Doctor } from "@/types/appwrite.types";

// Get all doctors
export const getDoctors = async (): Promise<Doctor[]> => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      [Query.orderAsc("name")]
    );

    return parseStringify(doctors.documents) as Doctor[];
  } catch (error) {
    console.error("Error getting doctors:", error);
    return [];
  }
};

// Get a single doctor by ID
export const getDoctor = async (doctorId: string): Promise<Doctor | null> => {
  try {
    const doctor = await databases.getDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId
    );

    return parseStringify(doctor) as Doctor;
  } catch (error) {
    console.error("Error getting doctor:", error);
    return null;
  }
};

// Get doctor by name (for backwards compatibility with existing appointments)
export const getDoctorByName = async (name: string): Promise<Doctor | null> => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      [Query.equal("name", name)]
    );

    if (doctors.documents.length === 0) {
      return null;
    }

    return parseStringify(doctors.documents[0]) as Doctor;
  } catch (error) {
    console.error("Error getting doctor by name:", error);
    return null;
  }
};

// Create a new doctor
export const createDoctor = async (
  doctor: CreateDoctorParams
): Promise<Doctor | null> => {
  try {
    const newDoctor = await databases.createDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      ID.unique(),
      {
        ...doctor,
        googleCalendarConnected: false,
      }
    );

    return parseStringify(newDoctor) as Doctor;
  } catch (error) {
    console.error("Error creating doctor:", error);
    return null;
  }
};

// Update a doctor
export const updateDoctor = async (
  doctorId: string,
  data: UpdateDoctorParams
): Promise<Doctor | null> => {
  try {
    const updatedDoctor = await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      data
    );

    return parseStringify(updatedDoctor) as Doctor;
  } catch (error) {
    console.error("Error updating doctor:", error);
    return null;
  }
};

// Store Google Calendar tokens for a doctor
export const storeGoogleCalendarTokens = async (
  doctorId: string,
  tokens: {
    refreshToken: string;
    calendarId?: string;
  }
): Promise<boolean> => {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      {
        googleCalendarConnected: true,
        googleRefreshToken: tokens.refreshToken,
        googleCalendarId: tokens.calendarId || "primary",
      }
    );

    return true;
  } catch (error) {
    console.error("Error storing Google Calendar tokens:", error);
    return false;
  }
};

// Disconnect Google Calendar from a doctor
export const disconnectGoogleCalendar = async (
  doctorId: string
): Promise<boolean> => {
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

    return true;
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    return false;
  }
};

// Delete a doctor
export const deleteDoctor = async (doctorId: string): Promise<boolean> => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId
    );

    return true;
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return false;
  }
};
