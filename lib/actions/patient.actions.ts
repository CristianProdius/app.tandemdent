"use server";

import { ID, InputFile, Query } from "node-appwrite";

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    // Check existing user
    if (error && error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      return existingUser.users[0];
    }
    console.error("An error occurred while creating a new user:", error);
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);

    return parseStringify(user);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error
    );
  }
};

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
    let file;
    if (identificationDocument) {
      const inputFile =
        identificationDocument &&
        InputFile.fromBlob(
          identificationDocument?.get("blobFile") as Blob,
          identificationDocument?.get("fileName") as string
        );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    // Create new patient document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ? file.$id : null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view??project=${PROJECT_ID}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("An error occurred while creating a new patient:", error);
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );
  }
};

// GET PATIENT BY ID (document ID)
export const getPatientById = async (patientId: string) => {
  try {
    const patient = await databases.getDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId
    );

    return parseStringify(patient);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );
  }
};

// SEARCH PATIENTS by name, email, or phone
export const searchPatients = async (query: string) => {
  try {
    // Search using Appwrite's search query
    // Note: This requires a fulltext index on the fields in Appwrite
    const results = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.search("name", query), Query.limit(20)]
    );

    // If no results by name, try exact match on email
    if (results.documents.length === 0 && query.includes("@")) {
      const emailResults = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        [Query.equal("email", query), Query.limit(20)]
      );
      return parseStringify(emailResults.documents);
    }

    // If no results and query looks like a phone number, try phone
    if (results.documents.length === 0 && /^\+?\d+$/.test(query.replace(/\s/g, ""))) {
      const phoneResults = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        [Query.equal("phone", query), Query.limit(20)]
      );
      return parseStringify(phoneResults.documents);
    }

    return parseStringify(results.documents);
  } catch (error) {
    console.error("An error occurred while searching patients:", error);
    return [];
  }
};

// GET ALL PATIENTS with pagination
export const getPatients = async (page: number = 1, limit: number = 25) => {
  try {
    const offset = (page - 1) * limit;

    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt"), Query.limit(limit), Query.offset(offset)]
    );

    return {
      patients: parseStringify(patients.documents),
      total: patients.total,
      totalPages: Math.ceil(patients.total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("An error occurred while getting patients:", error);
    return { patients: [], total: 0, totalPages: 0, currentPage: 1 };
  }
};

// UPDATE PATIENT
export const updatePatient = async (patientId: string, data: Partial<RegisterUserParams>) => {
  try {
    const updatedPatient = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId,
      data
    );

    return parseStringify(updatedPatient);
  } catch (error) {
    console.error("An error occurred while updating the patient:", error);
  }
};

// CREATE PATIENT (admin flow - simplified, without self-service)
export const createPatientAdmin = async (patient: {
  name: string;
  email: string;
  phone: string;
  birthDate?: Date;
  gender?: Gender;
  primaryPhysician?: string;
}) => {
  try {
    // First create the Appwrite user
    const newUser = await createUser({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
    });

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    // Then create the patient document
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        userId: newUser.$id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        birthDate: patient.birthDate || new Date(),
        gender: patient.gender || "Masculin",
        primaryPhysician: patient.primaryPhysician || "",
        privacyConsent: true,
        address: "",
        occupation: "",
        emergencyContactName: "",
        emergencyContactNumber: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("An error occurred while creating the patient:", error);
    throw error;
  }
};
