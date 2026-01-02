import * as sdk from "node-appwrite";
import * as fs from "fs";
import * as path from "path";

// Load .env file manually
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};

envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join("=").trim();
    }
  }
});

const ENDPOINT = envVars.NEXT_PUBLIC_ENDPOINT;
const PROJECT_ID = envVars.PROJECT_ID;
const API_KEY = envVars.API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error("❌ Missing environment variables in .env file:");
  if (!ENDPOINT) console.error("   - NEXT_PUBLIC_ENDPOINT is missing");
  if (!PROJECT_ID) console.error("   - PROJECT_ID is missing");
  if (!API_KEY) console.error("   - API_KEY is missing (get this from AppWrite Console → Settings → API Keys)");
  process.exit(1);
}

const client = new sdk.Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

async function setup() {
  console.log("🚀 Starting AppWrite setup...\n");

  try {
    // 1. Create Database
    console.log("📦 Creating database...");
    const database = await databases.create(sdk.ID.unique(), "TandemDent");
    console.log(`   ✅ Database created: ${database.$id}`);

    // 2. Create Patients Collection
    console.log("\n👤 Creating patients collection...");
    const patientsCollection = await databases.createCollection(
      database.$id,
      sdk.ID.unique(),
      "patients",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );
    console.log(`   ✅ Patients collection created: ${patientsCollection.$id}`);

    // Create patient attributes
    console.log("   📝 Adding patient attributes...");
    const patientAttributes = [
      { name: "userId", type: "string", size: 255, required: true },
      { name: "name", type: "string", size: 255, required: true },
      { name: "email", type: "email", required: true },
      { name: "phone", type: "string", size: 50, required: true },
      { name: "birthDate", type: "datetime", required: true },
      { name: "gender", type: "enum", elements: ["male", "female", "other"], required: true },
      { name: "address", type: "string", size: 500, required: false },
      { name: "occupation", type: "string", size: 255, required: false },
      { name: "emergencyContactName", type: "string", size: 255, required: true },
      { name: "emergencyContactNumber", type: "string", size: 50, required: true },
      { name: "primaryPhysician", type: "string", size: 255, required: true },
      { name: "insuranceProvider", type: "string", size: 255, required: false },
      { name: "insurancePolicyNumber", type: "string", size: 255, required: false },
      { name: "allergies", type: "string", size: 1000, required: false },
      { name: "currentMedication", type: "string", size: 1000, required: false },
      { name: "familyMedicalHistory", type: "string", size: 1000, required: false },
      { name: "pastMedicalHistory", type: "string", size: 1000, required: false },
      { name: "identificationType", type: "string", size: 255, required: false },
      { name: "identificationNumber", type: "string", size: 255, required: false },
      { name: "identificationDocumentId", type: "string", size: 255, required: false },
      { name: "identificationDocumentUrl", type: "url", required: false },
      { name: "privacyConsent", type: "boolean", required: true },
    ];

    for (const attr of patientAttributes) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            database.$id,
            patientsCollection.$id,
            attr.name,
            attr.size!,
            attr.required
          );
        } else if (attr.type === "email") {
          await databases.createEmailAttribute(
            database.$id,
            patientsCollection.$id,
            attr.name,
            attr.required
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            database.$id,
            patientsCollection.$id,
            attr.name,
            attr.required
          );
        } else if (attr.type === "enum") {
          await databases.createEnumAttribute(
            database.$id,
            patientsCollection.$id,
            attr.name,
            attr.elements!,
            attr.required
          );
        } else if (attr.type === "url") {
          await databases.createUrlAttribute(
            database.$id,
            patientsCollection.$id,
            attr.name,
            attr.required
          );
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            database.$id,
            patientsCollection.$id,
            attr.name,
            attr.required
          );
        }
        console.log(`      ✓ ${attr.name}`);
      } catch (e: any) {
        console.log(`      ⚠ ${attr.name}: ${e.message}`);
      }
    }

    // 3. Create Appointments Collection
    console.log("\n📅 Creating appointments collection...");
    const appointmentsCollection = await databases.createCollection(
      database.$id,
      sdk.ID.unique(),
      "appointments",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );
    console.log(`   ✅ Appointments collection created: ${appointmentsCollection.$id}`);

    // Create appointment attributes
    console.log("   📝 Adding appointment attributes...");
    const appointmentAttributes = [
      { name: "userId", type: "string", size: 255, required: true },
      { name: "schedule", type: "datetime", required: true },
      { name: "status", type: "enum", elements: ["pending", "scheduled", "cancelled"], required: true },
      { name: "primaryPhysician", type: "string", size: 255, required: true },
      { name: "reason", type: "string", size: 1000, required: true },
      { name: "note", type: "string", size: 1000, required: false },
      { name: "cancellationReason", type: "string", size: 1000, required: false },
    ];

    for (const attr of appointmentAttributes) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            database.$id,
            appointmentsCollection.$id,
            attr.name,
            attr.size!,
            attr.required
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            database.$id,
            appointmentsCollection.$id,
            attr.name,
            attr.required
          );
        } else if (attr.type === "enum") {
          await databases.createEnumAttribute(
            database.$id,
            appointmentsCollection.$id,
            attr.name,
            attr.elements!,
            attr.required
          );
        }
        console.log(`      ✓ ${attr.name}`);
      } catch (e: any) {
        console.log(`      ⚠ ${attr.name}: ${e.message}`);
      }
    }

    // Create relationship between appointments and patients
    console.log("   🔗 Creating patient relationship...");
    try {
      await databases.createRelationshipAttribute(
        database.$id,
        appointmentsCollection.$id,
        patientsCollection.$id,
        sdk.RelationshipType.ManyToOne,
        false,
        "patient",
        "appointments",
        sdk.RelationMutate.Cascade
      );
      console.log("      ✓ patient relationship");
    } catch (e: any) {
      console.log(`      ⚠ patient relationship: ${e.message}`);
    }

    // 4. Create Storage Bucket
    console.log("\n📁 Creating storage bucket...");
    const bucket = await storage.createBucket(
      sdk.ID.unique(),
      "patient-documents",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );
    console.log(`   ✅ Storage bucket created: ${bucket.$id}`);

    // Output environment variables
    console.log("\n" + "=".repeat(60));
    console.log("✅ SETUP COMPLETE! Add these to your .env file:\n");
    console.log(`DATABASE_ID=${database.$id}`);
    console.log(`PATIENT_COLLECTION_ID=${patientsCollection.$id}`);
    console.log(`APPOINTMENT_COLLECTION_ID=${appointmentsCollection.$id}`);
    console.log(`NEXT_PUBLIC_BUCKET_ID=${bucket.$id}`);
    console.log("=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setup();
