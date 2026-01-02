/**
 * Appwrite Schema Update Script
 *
 * This script updates the Appwrite database schema to add new fields
 * required for the admin booking system, patient portal, and email notifications.
 *
 * Usage:
 *   npx ts-node scripts/update-schema.ts
 *
 * Or add to package.json scripts:
 *   "update-schema": "ts-node scripts/update-schema.ts"
 */

import * as sdk from "node-appwrite";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const {
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
} = process.env;

// Validate required environment variables
if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID) {
  console.error("Missing required environment variables:");
  console.error("  NEXT_PUBLIC_ENDPOINT, PROJECT_ID, API_KEY, DATABASE_ID");
  process.exit(1);
}

// Initialize Appwrite client
const client = new sdk.Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const databases = new sdk.Databases(client);

// Collection IDs
const DOCTOR_COLLECTION_ID = process.env.DOCTOR_COLLECTION_ID || "doctors";
const SERVICE_COLLECTION_ID = process.env.SERVICE_COLLECTION_ID || "services";

// ===========================================
// YOUR DOCTORS DATA
// ===========================================
const DOCTORS = [
  {
    name: "Capatina Vitalie",
    email: "vitalie.capatina@tandemdent.md",
    phone: "+373 22 123 456",
    specialty: "Stomatologie generală",
  },
  {
    name: "Iliev Olesea",
    email: "olesea.iliev@tandemdent.md",
    phone: "+373 22 123 456",
    specialty: "Ortodonție",
  },
  {
    name: "Stoica Cristina",
    email: "cristina.stoica@tandemdent.md",
    phone: "+373 22 123 456",
    specialty: "Stomatologie generală",
  },
];

// ===========================================
// YOUR SERVICES DATA
// ===========================================
const SERVICES = [
  { name: "Consultație", description: "Consultație stomatologică", duration: 30, price: 0 },
  { name: "Obturare carie", description: "Tratament carie dentară cu obturat", duration: 45, price: 0 },
  { name: "Extracție", description: "Extracție dentară", duration: 30, price: 0 },
  { name: "Intervenție chirurgicală", description: "Intervenție chirurgicală stomatologică", duration: 60, price: 0 },
  { name: "Amprentare", description: "Amprentare dentară pentru lucrări protetice", duration: 30, price: 0 },
  { name: "Probă coroniță", description: "Probă și ajustare coroniță dentară", duration: 30, price: 0 },
  { name: "Fixare coroniță", description: "Cimentare și fixare coroniță definitivă", duration: 30, price: 0 },
  { name: "Activare breketă", description: "Activare și ajustare aparat ortodontic", duration: 30, price: 0 },
  { name: "Fixare breketă", description: "Montare aparat ortodontic fix", duration: 60, price: 0 },
  { name: "Scoatere breketă", description: "Îndepărtare aparat ortodontic", duration: 45, price: 0 },
];

async function createAttribute(
  collectionId: string,
  attributeType: string,
  key: string,
  options: any = {}
) {
  try {
    switch (attributeType) {
      case "string":
        await databases.createStringAttribute(
          DATABASE_ID!,
          collectionId,
          key,
          options.size || 255,
          options.required || false,
          options.default,
          options.array || false
        );
        break;
      case "integer":
        await databases.createIntegerAttribute(
          DATABASE_ID!,
          collectionId,
          key,
          options.required || false,
          options.min,
          options.max,
          options.default
        );
        break;
      case "boolean":
        await databases.createBooleanAttribute(
          DATABASE_ID!,
          collectionId,
          key,
          options.required || false,
          options.default
        );
        break;
      case "datetime":
        await databases.createDatetimeAttribute(
          DATABASE_ID!,
          collectionId,
          key,
          options.required || false,
          options.default
        );
        break;
      case "email":
        await databases.createEmailAttribute(
          DATABASE_ID!,
          collectionId,
          key,
          options.required || false,
          options.default
        );
        break;
      case "url":
        await databases.createUrlAttribute(
          DATABASE_ID!,
          collectionId,
          key,
          options.required || false,
          options.default
        );
        break;
    }
    console.log(`  ✓ Created ${attributeType} attribute: ${key}`);
  } catch (error: any) {
    if (error.code === 409) {
      console.log(`  - Attribute already exists: ${key}`);
    } else {
      console.error(`  ✗ Error creating ${key}:`, error.message);
    }
  }
}

async function createDoctorCollection() {
  console.log("\n📋 Creating Doctor Collection...");

  try {
    // Try to create the collection
    await databases.createCollection(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID,
      "Doctors",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users()),
      ]
    );
    console.log("  ✓ Created Doctor collection");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("  - Doctor collection already exists");
    } else {
      console.error("  ✗ Error creating Doctor collection:", error.message);
      return;
    }
  }

  // Add attributes
  const attributes = [
    { type: "string", key: "name", options: { size: 255, required: true } },
    { type: "email", key: "email", options: { required: true } },
    { type: "string", key: "phone", options: { size: 50 } },
    { type: "string", key: "specialty", options: { size: 255 } },
    { type: "url", key: "image", options: {} },
    { type: "boolean", key: "googleCalendarConnected", options: { default: false } },
    { type: "string", key: "googleRefreshToken", options: { size: 2000 } },
    { type: "string", key: "googleCalendarId", options: { size: 255 } },
  ];

  for (const attr of attributes) {
    await createAttribute(DOCTOR_COLLECTION_ID, attr.type, attr.key, attr.options);
    // Wait a bit between attribute creations to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Create index for name search
  try {
    await databases.createIndex(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID,
      "name_search",
      sdk.IndexType.Fulltext,
      ["name"]
    );
    console.log("  ✓ Created fulltext index on name");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("  - Index already exists: name_search");
    }
  }
}

async function updatePatientCollection() {
  console.log("\n📋 Updating Patient Collection...");

  if (!PATIENT_COLLECTION_ID) {
    console.error("  ✗ PATIENT_COLLECTION_ID not set in environment");
    return;
  }

  // New attributes for patient portal auth
  const attributes = [
    { type: "string", key: "magicLinkToken", options: { size: 255 } },
    { type: "datetime", key: "magicLinkExpiresAt", options: {} },
    { type: "string", key: "sessionToken", options: { size: 255 } },
    { type: "datetime", key: "sessionExpiresAt", options: {} },
    { type: "string", key: "appwriteAuthId", options: { size: 255 } },
  ];

  for (const attr of attributes) {
    await createAttribute(PATIENT_COLLECTION_ID, attr.type, attr.key, attr.options);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Create indexes for session lookups
  const indexes = [
    { key: "magicLinkToken_idx", type: sdk.IndexType.Key, attributes: ["magicLinkToken"] },
    { key: "sessionToken_idx", type: sdk.IndexType.Key, attributes: ["sessionToken"] },
    { key: "name_search", type: sdk.IndexType.Fulltext, attributes: ["name"] },
  ];

  for (const index of indexes) {
    try {
      await databases.createIndex(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID,
        index.key,
        index.type,
        index.attributes
      );
      console.log(`  ✓ Created index: ${index.key}`);
    } catch (error: any) {
      if (error.code === 409) {
        console.log(`  - Index already exists: ${index.key}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function updateAppointmentCollection() {
  console.log("\n📋 Updating Appointment Collection...");

  if (!APPOINTMENT_COLLECTION_ID) {
    console.error("  ✗ APPOINTMENT_COLLECTION_ID not set in environment");
    return;
  }

  // New attributes for email/calendar integration
  const attributes = [
    { type: "string", key: "googleCalendarEventId", options: { size: 255 } },
    { type: "boolean", key: "confirmationEmailSent", options: { default: false } },
    { type: "boolean", key: "reminderEmailSent", options: { default: false } },
    { type: "string", key: "doctorId", options: { size: 255 } },
    { type: "string", key: "createdBy", options: { size: 255 } },
  ];

  for (const attr of attributes) {
    await createAttribute(APPOINTMENT_COLLECTION_ID, attr.type, attr.key, attr.options);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Create index for reminder email cron
  try {
    await databases.createIndex(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID,
      "reminder_lookup",
      sdk.IndexType.Key,
      ["status", "reminderEmailSent", "schedule"]
    );
    console.log("  ✓ Created index: reminder_lookup");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("  - Index already exists: reminder_lookup");
    }
  }
}

async function createServiceCollection() {
  console.log("\n📋 Creating Service Collection...");

  try {
    // Try to create the collection
    await databases.createCollection(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID,
      "Services",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users()),
      ]
    );
    console.log("  ✓ Created Service collection");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("  - Service collection already exists");
    } else {
      console.error("  ✗ Error creating Service collection:", error.message);
      return;
    }
  }

  // Add attributes
  const attributes = [
    { type: "string", key: "name", options: { size: 255, required: true } },
    { type: "string", key: "description", options: { size: 1000 } },
    { type: "integer", key: "duration", options: { min: 5, max: 480, default: 30 } },
    { type: "integer", key: "price", options: { min: 0, default: 0 } },
    { type: "boolean", key: "isActive", options: { default: true } },
  ];

  for (const attr of attributes) {
    await createAttribute(SERVICE_COLLECTION_ID, attr.type, attr.key, attr.options);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Create index for name search
  try {
    await databases.createIndex(
      DATABASE_ID!,
      SERVICE_COLLECTION_ID,
      "name_search",
      sdk.IndexType.Fulltext,
      ["name"]
    );
    console.log("  ✓ Created fulltext index on name");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("  - Index already exists: name_search");
    }
  }
}

async function seedDoctors() {
  console.log("\n👨‍⚕️ Seeding Doctors...");

  for (const doctor of DOCTORS) {
    try {
      // Check if doctor already exists by email
      const existing = await databases.listDocuments(
        DATABASE_ID!,
        DOCTOR_COLLECTION_ID,
        [sdk.Query.equal("email", doctor.email)]
      );

      if (existing.total > 0) {
        console.log(`  - Doctor already exists: ${doctor.name}`);
        continue;
      }

      await databases.createDocument(
        DATABASE_ID!,
        DOCTOR_COLLECTION_ID,
        sdk.ID.unique(),
        {
          ...doctor,
          googleCalendarConnected: false,
        }
      );
      console.log(`  ✓ Created doctor: ${doctor.name}`);
    } catch (error: any) {
      console.error(`  ✗ Error creating doctor ${doctor.name}:`, error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

async function seedServices() {
  console.log("\n🦷 Seeding Services...");

  for (const service of SERVICES) {
    try {
      // Check if service already exists by name
      const existing = await databases.listDocuments(
        DATABASE_ID!,
        SERVICE_COLLECTION_ID,
        [sdk.Query.equal("name", service.name)]
      );

      if (existing.total > 0) {
        console.log(`  - Service already exists: ${service.name}`);
        continue;
      }

      await databases.createDocument(
        DATABASE_ID!,
        SERVICE_COLLECTION_ID,
        sdk.ID.unique(),
        {
          ...service,
          isActive: true,
        }
      );
      console.log(`  ✓ Created service: ${service.name}`);
    } catch (error: any) {
      console.error(`  ✗ Error creating service ${service.name}:`, error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

async function main() {
  console.log("🚀 Appwrite Schema Update Script");
  console.log("================================");
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Database: ${DATABASE_ID}`);

  try {
    // Verify connection
    const db = await databases.get(DATABASE_ID!);
    console.log(`\n✓ Connected to database: ${db.name}`);
  } catch (error: any) {
    console.error("\n✗ Failed to connect to database:", error.message);
    process.exit(1);
  }

  // Create/update collections
  await createDoctorCollection();
  await createServiceCollection();
  await updatePatientCollection();
  await updateAppointmentCollection();

  // Wait for attributes to be ready before seeding
  console.log("\n⏳ Waiting for attributes to be ready...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Seed data
  await seedDoctors();
  await seedServices();

  console.log("\n================================");
  console.log("✅ Schema update complete!");
  console.log("\nNote: Some attributes may take a few seconds to be fully available.");
  console.log("You can verify the changes in the Appwrite Console.");
}

main().catch(console.error);
