
export enum UserRole {
  PATIENT = 'PATIENT',
  CAREGIVER = 'CAREGIVER',
  DOCTOR = 'DOCTOR'
}

export enum MetricType {
  BP_SYSTOLIC = 'BP_SYSTOLIC',
  BP_DIASTOLIC = 'BP_DIASTOLIC',
  HEART_RATE = 'HEART_RATE',
  GLUCOSE = 'GLUCOSE',
  WEIGHT = 'WEIGHT',
  TEMP = 'TEMP'
}

export interface HealthMetric {
  id: string;
  memberId?: string; // Added to link metrics to specific users
  type: MetricType;
  value: number;
  unit: string;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'symptom' | 'medication' | 'note' | 'vitals' | 'report' | 'appointment';
  author: string; // e.g., "Dad", "Helios AI", "Mom"
  severity?: 'low' | 'medium' | 'high';
  isCareNote?: boolean; // If true, it's a family annotation
  relatedId?: string; // Links to a Report or Medication ID
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface InsurancePolicy {
  id: string;
  provider: string; // 'Acıbadem Sigorta', 'Allianz', etc.
  policyNumber: string;
  startDate: string;
  endDate: string;
  coverageDetails?: string;
  notes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  isActive: boolean;
  isPrimary: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatarUrl: string;
  status: 'stable' | 'attention' | 'critical';
  lastUpdate: string;
  // Emergency Profile Fields
  age?: number;
  bloodType?: string;
  chronicConditions?: string[];
  allergies?: string[];
  contactPhone?: string;
  // Biometrics for Wellness Whispers
  height?: number; // cm
  weight?: number; // kg
  insurancePolicies?: InsurancePolicy[];
}

// --- New Types for Medications ---

export interface Medication {
  id: string;
  memberId?: string; // Link to specific family member
  name: string;
  dosage: string;
  form: string; // Tablet, Syrup, etc.
  frequency: string; // "1x Daily", "As needed"
  instructions: string; // Natural language: "After breakfast"
  times?: string[]; // 'morning', 'noon', 'evening', 'bedtime'
  prescribedBy?: string;
  startDate: string;
  adherence: {
    [date: string]: 'taken' | 'skipped' | 'pending'; // Key is YYYY-MM-DD
  };
  category: 'medication' | 'supplement';
  // Supplement specific fields
  purpose?: string; // e.g. "Muscle Recovery", "Vitamin Deficiency"
  source?: string; // e.g. "Brand Name", "NatureMade"
}

// --- New Types for Reports ---

export interface ReportNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface MedicalReport {
  id: string;
  memberId?: string;
  title: string;
  type: 'LAB' | 'IMAGING' | 'CLINICAL_NOTE' | 'PRESCRIPTION' | 'OTHER';
  date: string;
  doctorName?: string;
  summary: string; // AI Generated Summary
  criticalFindings: string[]; // AI Extracted anomalies
  rawText?: string;
  isShared: boolean; // NEW: Controls visibility to other family members
  familyNotes: ReportNote[];
}

export interface Appointment {
  id: string;
  memberId?: string;
  doctorName: string;
  specialty: string;
  date: string;
  notes: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string; // "Research", "Lifestyle", "Warning"
  source: string;
  date: string;
  relevanceReason: string; // Why this matters to the patient
}