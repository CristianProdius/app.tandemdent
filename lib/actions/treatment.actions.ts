"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import {
  ToothCondition,
  Treatment,
  TreatmentStatus,
  TreatmentType,
} from "@/types/appwrite.types";

import {
  DATABASE_ID,
  TREATMENT_COLLECTION_ID,
  databases,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// Create treatment params
interface CreateTreatmentParams {
  patientId: string;
  toothNumber: number;
  condition: ToothCondition;
  treatment: TreatmentType;
  status: TreatmentStatus;
  doctorId: string;
  doctorName?: string;
  appointmentId?: string;
  notes?: string;
  date: string;
}

// CREATE TREATMENT
export const createTreatment = async (data: CreateTreatmentParams) => {
  try {
    const treatment = await databases.createDocument(
      DATABASE_ID!,
      TREATMENT_COLLECTION_ID!,
      ID.unique(),
      data
    );

    revalidatePath("/admin/treatments");
    revalidatePath(`/admin/patients/${data.patientId}`);
    return parseStringify(treatment);
  } catch (error) {
    console.error("Error creating treatment:", error);
    throw error;
  }
};

// GET TREATMENTS BY PATIENT
export const getTreatmentsByPatient = async (patientId: string) => {
  try {
    const treatments = await databases.listDocuments(
      DATABASE_ID!,
      TREATMENT_COLLECTION_ID!,
      [
        Query.equal("patientId", patientId),
        Query.orderDesc("date"),
      ]
    );

    return parseStringify(treatments.documents) as Treatment[];
  } catch (error) {
    console.error("Error getting treatments by patient:", error);
    return [];
  }
};

// GET TREATMENTS BY TOOTH
export const getTreatmentsByTooth = async (
  patientId: string,
  toothNumber: number
) => {
  try {
    const treatments = await databases.listDocuments(
      DATABASE_ID!,
      TREATMENT_COLLECTION_ID!,
      [
        Query.equal("patientId", patientId),
        Query.equal("toothNumber", toothNumber),
        Query.orderDesc("date"),
      ]
    );

    return parseStringify(treatments.documents) as Treatment[];
  } catch (error) {
    console.error("Error getting treatments by tooth:", error);
    return [];
  }
};

// GET SINGLE TREATMENT
export const getTreatment = async (treatmentId: string) => {
  try {
    const treatment = await databases.getDocument(
      DATABASE_ID!,
      TREATMENT_COLLECTION_ID!,
      treatmentId
    );

    return parseStringify(treatment) as Treatment;
  } catch (error) {
    console.error("Error getting treatment:", error);
    return null;
  }
};

// UPDATE TREATMENT
export const updateTreatment = async (
  treatmentId: string,
  data: Partial<CreateTreatmentParams>
) => {
  try {
    const treatment = await databases.updateDocument(
      DATABASE_ID!,
      TREATMENT_COLLECTION_ID!,
      treatmentId,
      data
    );

    revalidatePath("/admin/treatments");
    if (data.patientId) {
      revalidatePath(`/admin/patients/${data.patientId}`);
    }
    return parseStringify(treatment);
  } catch (error) {
    console.error("Error updating treatment:", error);
    throw error;
  }
};

// DELETE TREATMENT
export const deleteTreatment = async (treatmentId: string, patientId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      TREATMENT_COLLECTION_ID!,
      treatmentId
    );

    revalidatePath("/admin/treatments");
    revalidatePath(`/admin/patients/${patientId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting treatment:", error);
    throw error;
  }
};

// GET ALL TREATMENTS (with pagination and filters)
export const getTreatments = async (filters?: {
  status?: TreatmentStatus;
  doctorId?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const queries: string[] = [Query.orderDesc("date")];

    if (filters?.status) {
      queries.push(Query.equal("status", filters.status));
    }
    if (filters?.doctorId) {
      queries.push(Query.equal("doctorId", filters.doctorId));
    }
    if (filters?.limit) {
      queries.push(Query.limit(filters.limit));
    }
    if (filters?.offset) {
      queries.push(Query.offset(filters.offset));
    }

    const treatments = await databases.listDocuments(
      DATABASE_ID!,
      TREATMENT_COLLECTION_ID!,
      queries
    );

    return {
      documents: parseStringify(treatments.documents) as Treatment[],
      total: treatments.total,
    };
  } catch (error) {
    console.error("Error getting treatments:", error);
    return { documents: [], total: 0 };
  }
};

// GET TREATMENT STATS
export const getTreatmentStats = async () => {
  try {
    const [pending, inProgress, done, all] = await Promise.all([
      databases.listDocuments(DATABASE_ID!, TREATMENT_COLLECTION_ID!, [
        Query.equal("status", "pending"),
        Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID!, TREATMENT_COLLECTION_ID!, [
        Query.equal("status", "in_progress"),
        Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID!, TREATMENT_COLLECTION_ID!, [
        Query.equal("status", "done"),
        Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID!, TREATMENT_COLLECTION_ID!, [
        Query.limit(1),
      ]),
    ]);

    return {
      pendingCount: pending.total,
      inProgressCount: inProgress.total,
      doneCount: done.total,
      totalCount: all.total,
    };
  } catch (error) {
    console.error("Error getting treatment stats:", error);
    return {
      pendingCount: 0,
      inProgressCount: 0,
      doneCount: 0,
      totalCount: 0,
    };
  }
};

// GET PATIENT TOOTH CONDITIONS (for odontogram)
export const getPatientToothConditions = async (patientId: string) => {
  try {
    const treatments = await databases.listDocuments(
      DATABASE_ID!,
      TREATMENT_COLLECTION_ID!,
      [
        Query.equal("patientId", patientId),
        Query.orderDesc("date"),
      ]
    );

    // Group by tooth number and get the latest condition for each tooth
    const toothConditions: Record<number, ToothCondition> = {};

    for (const treatment of treatments.documents as Treatment[]) {
      // Only set if we haven't seen this tooth yet (since sorted by date desc)
      if (!toothConditions[treatment.toothNumber]) {
        toothConditions[treatment.toothNumber] = treatment.condition;
      }
    }

    return toothConditions;
  } catch (error) {
    console.error("Error getting tooth conditions:", error);
    return {};
  }
};
