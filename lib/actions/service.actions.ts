"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Service } from "@/types/appwrite.types";

import {
  DATABASE_ID,
  SERVICE_COLLECTION_ID,
  databases,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// Get all active services
export const getServices = async (): Promise<Service[]> => {
  try {
    const services = await databases.listDocuments(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID!,
      [Query.equal("isActive", true), Query.orderAsc("name")]
    );

    return services.documents as unknown as Service[];
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};

// Get all services (including inactive) for admin
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const services = await databases.listDocuments(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID!,
      [Query.orderAsc("name")]
    );

    return services.documents as unknown as Service[];
  } catch (error) {
    console.error("Error fetching all services:", error);
    return [];
  }
};

// Get a single service by ID
export const getService = async (serviceId: string): Promise<Service | null> => {
  try {
    const service = await databases.getDocument(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID!,
      serviceId
    );

    return service as unknown as Service;
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
};

// Get service by name (for backward compatibility with reason field)
export const getServiceByName = async (
  name: string
): Promise<Service | null> => {
  try {
    const services = await databases.listDocuments(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID!,
      [Query.equal("name", name)]
    );

    if (services.total === 0) return null;
    return services.documents[0] as unknown as Service;
  } catch (error) {
    console.error("Error fetching service by name:", error);
    return null;
  }
};

// Create service params
interface CreateServiceParams {
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive?: boolean;
  category?: "medical" | "cosmetic";
}

// Create a new service
export const createService = async (data: CreateServiceParams) => {
  try {
    const service = await databases.createDocument(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID!,
      ID.unique(),
      {
        ...data,
        isActive: data.isActive ?? true,
      }
    );

    revalidatePath("/admin/services");
    return parseStringify(service);
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

// Update a service
export const updateService = async (
  serviceId: string,
  data: Partial<CreateServiceParams>
) => {
  try {
    const service = await databases.updateDocument(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID!,
      serviceId,
      data
    );

    revalidatePath("/admin/services");
    return parseStringify(service);
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

// Delete a service (soft delete - set isActive to false)
export const deleteService = async (serviceId: string) => {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID!,
      serviceId,
      { isActive: false }
    );

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

// Permanently delete a service
export const permanentlyDeleteService = async (serviceId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID!,
      serviceId
    );

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error permanently deleting service:", error);
    throw error;
  }
};
