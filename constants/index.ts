// Gender options - values in English, for display use the labels from GENDER_LABELS
export const GenderOptions = ["male", "female", "other"];

// Gender labels for display in Romanian
export const GENDER_LABELS: Record<string, string> = {
  male: "Masculin",
  female: "Feminin",
  other: "Altul",
};

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "male" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const IdentificationTypes = [
  "Certificat de naștere",
  "Permis de conducere",
  "Card/Poliță de asigurare medicală",
  "Legitimație militară",
  "Buletin de identitate",
  "Pașaport",
  "Permis de ședere",
  "Card de asigurări sociale",
  "Carte de identitate",
  "Legitimație de student",
  "Carte de alegător",
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};

// ===== DENTAL CHART (ODONTOGRAM) CONSTANTS =====

// FDI World Dental Federation notation
// Upper Right: 18-11, Upper Left: 21-28
// Lower Left: 31-38, Lower Right: 48-41
export const TOOTH_NUMBERS = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
};

// Tooth names in Romanian
export const TOOTH_NAMES: Record<number, string> = {
  // Upper Right (18-11)
  18: "Molar 3 superior drept",
  17: "Molar 2 superior drept",
  16: "Molar 1 superior drept",
  15: "Premolar 2 superior drept",
  14: "Premolar 1 superior drept",
  13: "Canin superior drept",
  12: "Incisiv lateral superior drept",
  11: "Incisiv central superior drept",
  // Upper Left (21-28)
  21: "Incisiv central superior stâng",
  22: "Incisiv lateral superior stâng",
  23: "Canin superior stâng",
  24: "Premolar 1 superior stâng",
  25: "Premolar 2 superior stâng",
  26: "Molar 1 superior stâng",
  27: "Molar 2 superior stâng",
  28: "Molar 3 superior stâng",
  // Lower Left (31-38)
  31: "Incisiv central inferior stâng",
  32: "Incisiv lateral inferior stâng",
  33: "Canin inferior stâng",
  34: "Premolar 1 inferior stâng",
  35: "Premolar 2 inferior stâng",
  36: "Molar 1 inferior stâng",
  37: "Molar 2 inferior stâng",
  38: "Molar 3 inferior stâng",
  // Lower Right (41-48)
  41: "Incisiv central inferior drept",
  42: "Incisiv lateral inferior drept",
  43: "Canin inferior drept",
  44: "Premolar 1 inferior drept",
  45: "Premolar 2 inferior drept",
  46: "Molar 1 inferior drept",
  47: "Molar 2 inferior drept",
  48: "Molar 3 inferior drept",
};

// Tooth conditions labels in Romanian
export const TOOTH_CONDITIONS = {
  healthy: { label: "Sănătos", color: "bg-white" },
  caries: { label: "Carie", color: "bg-yellow-100" },
  decay: { label: "Carie avansată", color: "bg-yellow-200" },
  fracture: { label: "Fractură", color: "bg-orange-100" },
  missing: { label: "Lipsă", color: "bg-gray-200" },
  filled: { label: "Plombat", color: "bg-blue-100" },
  crown: { label: "Coroană", color: "bg-gold-200" },
  root_canal: { label: "Canal radicular", color: "bg-purple-100" },
  implant: { label: "Implant", color: "bg-teal-100" },
};

// Treatment types labels in Romanian
export const TREATMENT_TYPES = {
  examination: { label: "Examinare", icon: "Stethoscope" },
  cleaning: { label: "Curățare profesională", icon: "Sparkles" },
  tooth_filling: { label: "Plombare", icon: "Square" },
  root_canal: { label: "Tratament de canal", icon: "Syringe" },
  crown: { label: "Coroană dentară", icon: "Crown" },
  extraction: { label: "Extracție", icon: "Minus" },
  whitening: { label: "Albire", icon: "Sun" },
  implant: { label: "Implant", icon: "Pin" },
  scaling: { label: "Detartraj", icon: "Eraser" },
  polishing: { label: "Lustruire", icon: "Sparkle" },
};

// Treatment status labels in Romanian
export const TREATMENT_STATUS = {
  pending: { label: "În așteptare", color: "bg-gold-500/20 text-gold-700" },
  in_progress: { label: "În desfășurare", color: "bg-blue-500/20 text-blue-700" },
  done: { label: "Finalizat", color: "bg-teal-500/20 text-teal-700" },
};
