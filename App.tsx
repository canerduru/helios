import React, { useState } from 'react';
import { 
  IconActivity, 
  IconChat, 
  IconFamily, 
  IconReport, 
  IconMenu, 
  IconClose, 
  IconPlus, 
  IconPill, 
  IconAlert, 
  IconCheck, 
  IconPhone, 
  IconNews, 
  IconEdit, 
  IconCalendar,
  IconQrCode,
  IconDna
} from './components/ui/Icons';
import { ChatInterface } from './components/ChatInterface';
import { HealthTimeline } from './components/HealthTimeline';
import { ClinicalSynopsis } from './components/ClinicalSynopsis';
import { Dashboard } from './components/Dashboard';
import { AddEntryModal } from './components/AddEntryModal';
import { MedicationManager } from './components/MedicationManager';
import { ReportManager } from './components/ReportManager';
import { EmergencyOverlay } from './components/EmergencyOverlay';
import { NewsFeed } from './components/NewsFeed';
import { ProfileModal } from './components/ProfileModal';
import { AppointmentManager } from './components/AppointmentManager';
import { HealthPassport } from './components/HealthPassport'; 
import { HeritageEngine } from './components/HeritageEngine'; 

import { FamilyMember, TimelineEvent, HealthMetric, MetricType, Medication, MedicalReport, Appointment } from './types';

// Mock Data - Updated: Caner is now first
const INITIAL_FAMILY: FamilyMember[] = [
  { 
    id: '3', 
    name: 'Caner (Self)', 
    relation: 'Self', 
    age: 30,
    avatarUrl: 'https://i.pravatar.cc/150?u=Caner', 
    status: 'stable', 
    lastUpdate: '1 day ago',
    bloodType: 'B-',
    chronicConditions: [],
    allergies: ['Dust Mites'],
    contactPhone: '+90-555-003',
    height: 182,
    weight: 80
  },
  { 
    id: '1', 
    name: 'Mustafa (Father)', 
    relation: 'Father', 
    age: 65,
    avatarUrl: 'https://i.pravatar.cc/150?u=Mustafa', 
    status: 'attention', 
    lastUpdate: '10 mins ago',
    bloodType: 'A+',
    chronicConditions: ['Hypertension', 'Arrhythmia'],
    allergies: ['Penicillin'],
    contactPhone: '+90-555-001',
    height: 175,
    weight: 85,
    insurancePolicies: [
      {
        id: 'ins1',
        provider: 'Acıbadem Sigorta',
        policyNumber: 'ACI-2023-882194',
        startDate: '2023-01-01',
        endDate: '2024-01-01',
        isActive: true,
        isPrimary: true,
        emergencyContact: { name: 'Acıbadem SOS', phone: '444 55 55' }
      }
    ]
  },
  { 
    id: '2', 
    name: 'Beyza (Mother)', 
    relation: 'Mother', 
    age: 60,
    avatarUrl: 'https://i.pravatar.cc/150?u=Beyza', 
    status: 'stable', 
    lastUpdate: '2 hours ago',
    bloodType: 'O+',
    chronicConditions: ['Type 2 Diabetes', 'Osteoporosis'],
    allergies: [],
    contactPhone: '+90-555-002',
    height: 162,
    weight: 70
  },
  { 
    id: '4', 
    name: 'Ilgen (Sister)', 
    relation: 'Sister', 
    age: 34,
    avatarUrl: 'https://i.pravatar.cc/150?u=Ilgen', 
    status: 'stable', 
    lastUpdate: '5 hours ago',
    bloodType: 'A+',
    chronicConditions: ['Migraine'],
    allergies: ['Cats'],
    contactPhone: '+90-555-004',
    height: 168,
    weight: 60
  },
  { 
    id: '5', 
    name: 'Tara (Fiancée)', 
    relation: 'Fiancée', 
    age: 28,
    avatarUrl: 'https://i.pravatar.cc/150?u=Tara', 
    status: 'stable', 
    lastUpdate: '30 mins ago',
    bloodType: 'AB+',
    chronicConditions: ['Asthma'],
    allergies: ['Pollen'],
    contactPhone: '+90-555-005',
    height: 170,
    weight: 58
  }
];

const INITIAL_EVENTS: TimelineEvent[] = [
  // --- TEST DATA: Viral Loop Trigger (Today) ---
  { id: 'e_viral_1', title: 'Viral Flu Symptoms', description: 'Beyza has high fever (38.5C) and severe cough since morning.', timestamp: new Date().toISOString(), type: 'symptom', author: 'Beyza', severity: 'high' },
  
  // --- TEST DATA: Genetic Echo Trigger (Yesterday) ---
  { id: 'e_genetic_1', title: 'Recurring Headache', description: 'Caner reporting throbbing headache and dizziness. BP slightly elevated.', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'symptom', author: 'Caner', severity: 'medium' },

  // Standard Events
  { id: 'e1', title: 'High Blood Pressure', description: 'Recorded 145/95 after waking up.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 0.1).toISOString(), type: 'vitals', author: 'Demo Log', severity: 'medium' },
  { id: 'e2', title: 'Fatigue Notice', description: 'Mustafa seemed very tired after dinner.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), type: 'note', author: 'Beyza', isCareNote: true },
  { id: 'e3', title: 'Migraine Aura', description: 'Experiencing visual aura, took medication.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), type: 'symptom', author: 'Ilgen', severity: 'medium' },
  { id: 'e4', title: 'Inhaler Usage', description: 'Used inhaler before morning run.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), type: 'medication', author: 'Tara' },
  { id: 'e5', title: 'Normal BP', description: 'Recorded 120/80.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), type: 'vitals', author: 'Demo Log' },
  { id: 'e6', title: 'Morning Run', description: 'Completed 5km run.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), type: 'note', author: 'Caner' },
  { id: 'e7', title: 'Glucose Check', description: '110 mg/dL post-prandial.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), type: 'vitals', author: 'Beyza', severity: 'low' },
];

const INITIAL_METRICS: HealthMetric[] = [
  // CANER'S DATA (ID: 3)
  { id: 'm1', memberId: '3', type: MetricType.BP_SYSTOLIC, value: 125, unit: 'mmHg', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() },
  { id: 'm2', memberId: '3', type: MetricType.BP_SYSTOLIC, value: 122, unit: 'mmHg', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: 'm3', memberId: '3', type: MetricType.BP_SYSTOLIC, value: 130, unit: 'mmHg', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
  { id: 'm4', memberId: '3', type: MetricType.BP_SYSTOLIC, value: 118, unit: 'mmHg', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  { id: 'm5', memberId: '3', type: MetricType.BP_SYSTOLIC, value: 135, unit: 'mmHg', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: 'm6', memberId: '3', type: MetricType.BP_SYSTOLIC, value: 128, unit: 'mmHg', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
  { id: 'm7', memberId: '3', type: MetricType.BP_SYSTOLIC, value: 124, unit: 'mmHg', timestamp: new Date().toISOString() },

  // MUSTAFA'S DATA (ID: 1) - Higher BP to show difference when switching
  { id: 'm_dad_1', memberId: '1', type: MetricType.BP_SYSTOLIC, value: 145, unit: 'mmHg', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
  { id: 'm_dad_2', memberId: '1', type: MetricType.BP_SYSTOLIC, value: 152, unit: 'mmHg', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: 'm_dad_3', memberId: '1', type: MetricType.BP_SYSTOLIC, value: 148, unit: 'mmHg', timestamp: new Date().toISOString() }
];

const INITIAL_MEDS: Medication[] = [
  // --- Caner (Self) ID: 3 ---
  { id: 'supp1', memberId: '3', category: 'supplement', name: 'Omega 3 Fish Oil', dosage: '1000mg', form: 'Capsule', frequency: 'Daily', instructions: 'With breakfast', times: ['morning'], startDate: '2023-06-01', adherence: {}, purpose: 'Heart Health', source: 'OceanBlue' },
  { id: 'supp2', memberId: '3', category: 'supplement', name: 'Magnesium', dosage: '200mg', form: 'Tablet', frequency: 'Daily', instructions: 'Before sleep for recovery', times: ['bedtime'], startDate: '2023-06-01', adherence: {}, purpose: 'Sleep & Recovery', source: 'NatureMade' },
  { id: 'supp3', memberId: '3', category: 'supplement', name: 'Whey Protein', dosage: '1 Scoop', form: 'Powder', frequency: 'After Workout', instructions: 'Mix with water', times: ['as_needed'], startDate: '2023-06-01', adherence: {}, purpose: 'Muscle Recovery', source: 'Optimum Nutrition' },

  // --- Mustafa (Father) ID: 1 ---
  { id: 'med1', memberId: '1', category: 'medication', name: 'Beloc Zok', dosage: '50mg', form: 'Tablet', frequency: 'Daily', instructions: 'Take in the morning', times: ['morning'], startDate: '2023-01-01', adherence: {} },
  { id: 'med_m2', memberId: '1', category: 'medication', name: 'Ecopirin', dosage: '100mg', form: 'Tablet', frequency: 'Daily', instructions: 'Blood thinner after lunch', times: ['noon'], startDate: '2023-02-15', adherence: {} },
  { id: 'supp_m1', memberId: '1', category: 'supplement', name: 'Vitamin B12', dosage: '1000mcg', form: 'Tablet', frequency: 'Daily', instructions: 'Energy support', times: ['morning'], startDate: '2023-03-01', adherence: {}, purpose: 'Energy', source: 'Solgar' },

  // --- Beyza (Mother) ID: 2 ---
  { id: 'med2', memberId: '2', category: 'medication', name: 'Glifor', dosage: '1000mg', form: 'Tablet', frequency: 'Daily', instructions: 'After dinner for diabetes', times: ['evening'], startDate: '2023-01-01', adherence: {} },
  { id: 'med_b2', memberId: '2', category: 'medication', name: 'Fosamax', dosage: '70mg', form: 'Tablet', frequency: 'Weekly', instructions: 'Sunday mornings', times: ['morning'], startDate: '2023-04-10', adherence: {} },
  { id: 'supp_b1', memberId: '2', category: 'supplement', name: 'Calcium + D3', dosage: '600mg', form: 'Tablet', frequency: 'Daily', instructions: 'Bone health', times: ['noon'], startDate: '2023-01-01', adherence: {}, purpose: 'Bone Density', source: 'Calcimax' },

  // --- Ilgen (Sister) ID: 4 ---
  { id: 'med_i1', memberId: '4', category: 'medication', name: 'Relpax', dosage: '40mg', form: 'Tablet', frequency: 'As Needed', instructions: 'Take at onset of migraine', times: ['as_needed'], startDate: '2023-08-01', adherence: {} },
  { id: 'supp_i1', memberId: '4', category: 'supplement', name: 'Iron Complex', dosage: '1 Capsule', form: 'Capsule', frequency: 'Daily', instructions: 'With orange juice', times: ['morning'], startDate: '2023-09-01', adherence: {}, purpose: 'Anemia Prevention', source: 'Sidefer' },

  // --- Tara (Fiancée) ID: 5 ---
  { id: 'med3', memberId: '5', category: 'medication', name: 'Ventolin', dosage: '100mcg', form: 'Inhaler', frequency: 'As needed', instructions: 'When short of breath', times: ['as_needed'], startDate: '2023-01-01', adherence: {} },
  { id: 'med_t2', memberId: '5', category: 'medication', name: 'Singulair', dosage: '10mg', form: 'Tablet', frequency: 'Daily', instructions: 'Before sleep for asthma', times: ['bedtime'], startDate: '2023-02-01', adherence: {} },
  { id: 'supp_t1', memberId: '5', category: 'supplement', name: 'Zinc Picolinate', dosage: '15mg', form: 'Tablet', frequency: 'Daily', instructions: 'Immune support', times: ['noon'], startDate: '2023-10-01', adherence: {}, purpose: 'Immunity', source: 'Nature\'s Bounty' }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  // Linked to Mustafa (1)
  { id: 'apt1', memberId: '1', doctorName: 'Dr. Ahmet Yilmaz', specialty: 'Cardiology', date: new Date(Date.now() + 86400000).toISOString(), notes: 'Regular heart rhythm checkup for Mustafa' },
  // Linked to Beyza (2)
  { id: 'apt2', memberId: '2', doctorName: 'Dr. Sema Demir', specialty: 'Endocrinology', date: new Date(Date.now() + 172800000).toISOString(), notes: 'Diabetes quarterly review' },
  // Linked to Tara (5)
  { id: 'apt3', memberId: '5', doctorName: 'Dr. John Doe', specialty: 'Pulmonology', date: new Date(Date.now() + 604800000).toISOString(), notes: 'Asthma control check' }
];

const INITIAL_REPORTS: MedicalReport[] = [
  {
    id: 'rep_1',
    memberId: '1', // Mustafa (Father)
    title: 'Cardiology Consultation & ECG',
    type: 'CLINICAL_NOTE',
    date: '2024-05-10',
    doctorName: 'Dr. Ahmet Yilmaz',
    summary: 'Routine checkup for hypertension. ECG indicates normal sinus rhythm. BP control is adequate with current medication.',
    criticalFindings: [],
    isShared: true, // Mustafa shared this
    familyNotes: [
        { id: 'n1', author: 'Caner (Self)', text: 'Dad forgot to mention his dizziness last week.', timestamp: '2024-05-10T14:30:00Z' }
    ]
  },
  {
    id: 'rep_2',
    memberId: '2', // Beyza (Mother)
    title: 'Quarterly HbA1c Panel',
    type: 'LAB',
    date: '2024-05-12',
    doctorName: 'Dr. Sema Demir',
    summary: 'HbA1c levels are slightly elevated at 7.2%. Kidney function tests (Creatinine/eGFR) are stable. Vitamin D deficiency noted.',
    criticalFindings: ['HbA1c: 7.2% (Target < 7.0%)', 'Vitamin D: 18 ng/mL (Low)'],
    isShared: true, // Beyza shared this
    familyNotes: []
  },
  {
    id: 'rep_3',
    memberId: '3', // Caner (Self)
    title: 'Annual Physical Checkup',
    type: 'LAB',
    date: '2024-01-15',
    doctorName: 'Dr. Elif Kaya',
    summary: 'All vital signs and blood panels within normal ranges. Cholesterol is optimal. Recommended to maintain exercise routine.',
    criticalFindings: [],
    isShared: false, // Private to Caner
    familyNotes: []
  }
];

type View = 'dashboard' | 'chat' | 'timeline' | 'synopsis' | 'medications' | 'reports' | 'news' | 'appointments' | 'heritage';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // State for Family Members to support updates
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);

  // LOGGED IN USER (FIXED TO CANER)
  const loggedInUser = familyMembers.find(m => m.id === '3') || familyMembers[0]; // ID 3 is Caner
  
  // DASHBOARD SELECTED VIEW (Initially Caner, but can be switched)
  const [dashboardViewId, setDashboardViewId] = useState<string>(loggedInUser.id);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHealthPassportOpen, setIsHealthPassportOpen] = useState(false); // Health Passport State
  
  // Emergency State
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState<Array<{id: string, text: string, type: 'alert' | 'success'}>>([]);

  // App State
  const [events, setEvents] = useState<TimelineEvent[]>(INITIAL_EVENTS);
  const [metrics, setMetrics] = useState<HealthMetric[]>(INITIAL_METRICS);
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDS);
  const [reports, setReports] = useState<MedicalReport[]>(INITIAL_REPORTS); 
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);

  // This is for the dashboard specific calculations (who are we looking at?)
  const dashboardTargetMember = familyMembers.find(m => m.id === dashboardViewId) || loggedInUser;

  const addNotification = (text: string, type: 'alert' | 'success') => {
    const id = Date.now().toString() + Math.random();
    setNotifications(prev => [...prev, {id, text, type}]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleUpdateMember = (updatedMember: FamilyMember) => {
    setFamilyMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    addNotification("Profile Updated Successfully", "success");
  };

  const handleTriggerEmergency = () => {
    setIsEmergencyMode(true);
    
    // 1. System Alert
    addNotification("🚨 CRITICAL SOS PROTOCOL INITIATED", 'alert');
    
    // 2. Simulate Notifications to Family Registry
    setTimeout(() => addNotification("📍 Geo-Location Broadcast to Family Cloud", 'success'), 800);
    setTimeout(() => addNotification("📲 SMS Sent to Caner (Self)", 'success'), 1500);
    setTimeout(() => addNotification("📲 SMS Sent to Beyza (Mother)", 'success'), 2500);
    
    // 3. Automated Call
    setTimeout(() => addNotification("📞 Automated Alert Call to Emergency Contact", 'alert'), 4500);
  };

  const handleAddEvent = (newEvent: TimelineEvent) => {
    setEvents(prev => [newEvent, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const handleAddMetric = (newMetrics: HealthMetric[]) => {
    setMetrics(prev => [...prev, ...newMetrics].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    const timestamp = newMetrics[0]?.timestamp;
    if (newMetrics.length > 0) {
        let title = 'Vitals Logged';
        let desc = '';
        const sys = newMetrics.find(m => m.type === MetricType.BP_SYSTOLIC);
        const dia = newMetrics.find(m => m.type === MetricType.BP_DIASTOLIC);
        
        if (sys && dia) {
            title = 'Blood Pressure Logged';
            desc = `Recorded ${sys.value}/${dia.value} mmHg`;
        } else {
             desc = newMetrics.map(m => `${m.value} ${m.unit}`).join(', ');
        }

        const vitalsEvent: TimelineEvent = {
            id: 'evt-' + Date.now(),
            title,
            description: desc,
            timestamp,
            type: 'vitals',
            author: 'Manual Entry'
        };
        handleAddEvent(vitalsEvent);
    }
  };

  const handleAddMedication = (med: Medication) => {
    // Determine owner: if viewing dashboard of specific person, add to them, otherwise add to self
    const targetMemberId = currentView === 'dashboard' ? dashboardViewId : loggedInUser.id;
    const targetMemberName = familyMembers.find(m => m.id === targetMemberId)?.name || 'Unknown';
    
    const newMed = { ...med, memberId: targetMemberId };
    setMedications(prev => [...prev, newMed]);
    handleAddEvent({
        id: 'med-add-' + Date.now(),
        title: `New ${med.category === 'supplement' ? 'Supplement' : 'Medication'} Added`,
        description: `Started ${med.name} ${med.dosage} for ${targetMemberName}`,
        timestamp: new Date().toISOString(),
        type: 'medication',
        author: 'Helios AI',
        severity: 'low'
    });
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    addNotification("Item removed from schedule", "success");
  };

  const handleUpdateAdherence = (medId: string, status: 'taken' | 'skipped') => {
    const today = new Date().toISOString().split('T')[0];
    setMedications(prev => prev.map(m => {
        if (m.id === medId) {
            return {
                ...m,
                adherence: { ...m.adherence, [today]: status }
            };
        }
        return m;
    }));
  };

  const handleAddReport = (report: MedicalReport) => {
    setReports(prev => [report, ...prev]);
    handleAddEvent({
        id: 'rep-' + Date.now(),
        title: `New Report: ${report.title}`,
        description: report.summary.slice(0, 100) + '...',
        timestamp: report.date,
        type: 'report',
        author: 'Helios AI',
        severity: report.criticalFindings.length > 0 ? 'high' : 'medium'
    });
  };

  const handleAddReportNote = (reportId: string, text: string, author: string) => {
    setReports(prev => prev.map(r => {
        if (r.id === reportId) {
            return {
                ...r,
                familyNotes: [...r.familyNotes, { id: Date.now().toString(), author, text, timestamp: new Date().toISOString() }]
            };
        }
        return r;
    }));
  };

  const handleToggleReportShare = (reportId: string) => {
    setReports(prev => prev.map(r => {
        if (r.id === reportId) {
            const newValue = !r.isShared;
            addNotification(newValue ? "Report shared with family" : "Report made private", "success");
            return { ...r, isShared: newValue };
        }
        return r;
    }));
  };

  const handleAddAppointment = (apt: Appointment) => {
     // Determine owner: if viewing dashboard of specific person, add to them, otherwise add to self
    const targetMemberId = currentView === 'dashboard' ? dashboardViewId : loggedInUser.id;
    const newApt = { ...apt, memberId: targetMemberId };
    setAppointments(prev => [...prev, newApt].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    handleAddEvent({
        id: 'apt-add-' + Date.now(),
        title: 'Appointment Scheduled',
        description: `With ${apt.doctorName} (${apt.specialty}) on ${new Date(apt.date).toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        type: 'appointment',
        author: 'Helios AI',
        severity: 'low'
    });
  };

  const NavItem = ({ view, icon, label }: { view: View; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        currentView === view
          ? 'bg-teal-600 text-white shadow-md font-medium'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4">
        {notifications.map(n => (
            <div key={n.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
                n.type === 'alert' ? 'bg-rose-600 text-white border-rose-700' : 'bg-emerald-600 text-white border-emerald-700'
            }`}>
                <div className={`p-2 rounded-full ${n.type === 'alert' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                   {n.type === 'alert' ? <IconAlert /> : <IconCheck />}
                </div>
                <span className="font-bold text-sm leading-tight">{n.text}</span>
            </div>
        ))}
      </div>

      {/* EMERGENCY OVERLAY */}
      {isEmergencyMode && (
          <EmergencyOverlay 
            member={dashboardTargetMember} 
            medications={medications.filter(m => m.memberId === dashboardTargetMember.id)}
            onClose={() => setIsEmergencyMode(false)} 
          />
      )}

      {/* HEALTH PASSPORT MODAL */}
      {isHealthPassportOpen && (
        <HealthPassport 
            member={dashboardTargetMember}
            medications={medications.filter(m => m.memberId === dashboardTargetMember.id)}
            onClose={() => setIsHealthPassportOpen(false)}
        />
      )}
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <span className="font-bold text-slate-800 tracking-tight">VitalScribe</span>
         </div>
         <div className="flex items-center gap-3">
             <button 
                onClick={handleTriggerEmergency}
                className="bg-rose-500 text-white px-3 py-1.5 rounded-md text-xs font-bold animate-pulse shadow-rose-200 shadow-lg"
             >
                SOS
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
               {isMobileMenuOpen ? <IconClose /> : <IconMenu />}
             </button>
         </div>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Scrollable Content (Logo + Nav) */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/30">V</div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">VitalScribe</span>
          </div>

          <nav className="space-y-2">
            <NavItem view="dashboard" icon={<IconFamily />} label="Dashboard" />
            <NavItem view="medications" icon={<IconPill />} label="Medication & Supplements" />
            <NavItem view="appointments" icon={<IconCalendar />} label="Appointments" />
            <NavItem view="reports" icon={<IconReport />} label="Medical Reports" />
            <NavItem view="news" icon={<IconNews />} label="Health Insights" />
            <NavItem view="heritage" icon={<IconDna />} label="Family Patterns" />
            <NavItem view="timeline" icon={<IconActivity />} label="Health Timeline" />
            <NavItem view="chat" icon={<IconChat />} label="AI Health Agent" />
            <NavItem view="synopsis" icon={<IconReport />} label="Clinical Synopsis" />
          </nav>
        </div>

        {/* Actions Area (SOS + Passport) - Pinned above profile */}
        <div className="px-6 py-4 border-t border-slate-50 space-y-3">
            <button 
                onClick={handleTriggerEmergency}
                className="w-full bg-rose-50 border border-rose-200 text-rose-600 py-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-rose-600 hover:text-white transition-all group"
            >
                <div className="p-1 bg-rose-200 rounded-full group-hover:bg-rose-500"><IconAlert /></div>
                <span>SOS / EMERGENCY</span>
            </button>

            <button 
                onClick={() => setIsHealthPassportOpen(true)}
                className="w-full bg-slate-100 text-slate-600 py-2 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-slate-200 hover:text-slate-800 transition-all text-xs"
            >
                <IconQrCode size={14} />
                <span>Health Passport</span>
            </button>
        </div>

        {/* LOGGED IN USER PROFILE (FIXED) */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-100 transition-colors group text-left"
          >
            <div className="relative">
                <img src={loggedInUser.avatarUrl} alt="User" className="w-10 h-10 rounded-full border border-slate-300 group-hover:border-teal-500 transition-colors" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <div className="bg-teal-500 text-white rounded-full p-0.5">
                        <IconEdit size={8} />
                    </div>
                </div>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-800 truncate group-hover:text-teal-700 transition-colors">{loggedInUser.name}</p>
              <p className="text-xs text-slate-500 truncate">Edit My Profile</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative pt-16 lg:pt-0">
          {currentView === 'dashboard' && (
            <div className="h-full overflow-y-auto">
              <Dashboard 
                familyMembers={familyMembers}
                onSelectMember={setDashboardViewId}
                onSwitchMember={setDashboardViewId}
                selectedId={dashboardViewId}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                medications={medications}
                appointments={appointments}
                events={events}
              />
            </div>
          )}
          
          {currentView === 'heritage' && (
             <HeritageEngine 
                member={dashboardTargetMember}
                familyMembers={familyMembers}
                events={events}
             />
          )}

          {currentView === 'timeline' && (
            <div className="h-full overflow-y-auto p-6 bg-slate-50/50">
                <div className="max-w-4xl mx-auto">
                    {/* Shared view: Everyone's events available via filters */}
                    <HealthTimeline 
                        events={events} 
                        metrics={metrics} 
                        patientName={dashboardTargetMember.name} 
                        familyMembers={familyMembers}
                        currentUserId={loggedInUser.id}
                    />
                </div>
            </div>
          )}

          {currentView === 'chat' && (
            <div className="h-full p-4 lg:p-6 bg-slate-100">
                <div className="h-full max-w-4xl mx-auto">
                    <ChatInterface 
                        onTriggerEmergency={handleTriggerEmergency}
                        onShowNews={() => setCurrentView('news')}
                        patientName={dashboardTargetMember.name} 
                        conditions={dashboardTargetMember.chronicConditions || []}
                    />
                </div>
            </div>
          )}
          
          {currentView === 'synopsis' && (
             <ClinicalSynopsis events={events} patientName={dashboardTargetMember.name} />
          )}

          {currentView === 'medications' && (
             <MedicationManager 
                medications={medications} /* Pass ALL meds for shared cabinet */
                familyMembers={familyMembers} /* Pass members to resolve owners */
                currentUserId={loggedInUser.id}
                onAddMedication={handleAddMedication}
                onUpdateAdherence={handleUpdateAdherence}
                onDeleteMedication={handleDeleteMedication}
             />
          )}

          {currentView === 'reports' && (
              <ReportManager 
                 reports={reports} 
                 familyMembers={familyMembers}
                 currentUserId={loggedInUser.id}
                 onAddReport={handleAddReport}
                 onAddNote={handleAddReportNote}
                 onToggleShare={handleToggleReportShare}
              />
          )}

          {currentView === 'news' && (
              <NewsFeed member={dashboardTargetMember} medications={medications.filter(m => m.memberId === dashboardTargetMember.id)} />
          )}

          {currentView === 'appointments' && (
              <AppointmentManager 
                appointments={appointments} /* Shared appointments view */
                familyMembers={familyMembers}
                currentUserId={loggedInUser.id}
                onAddAppointment={handleAddAppointment}
              />
          )}
      </main>

      {/* ADD ENTRY MODAL */}
      <AddEntryModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddEvent={handleAddEvent}
        onAddMetric={handleAddMetric}
        currentUser={loggedInUser?.name || 'User'}
      />

      {/* PROFILE EDIT MODAL - Always edits the Logged In User for now, or could be context aware */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        member={loggedInUser} 
        onSave={handleUpdateMember} 
      />

    </div>
  );
}