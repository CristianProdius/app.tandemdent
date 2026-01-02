"use server";

import { Query } from "node-appwrite";

import { Service } from "@/types/appwrite.types";

import {
  DATABASE_ID,
  SERVICE_COLLECTION_ID,
  databases,
} from "../appwrite.config";

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
