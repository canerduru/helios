import React from 'react';
import { FamilyMember, Medication, Appointment, TimelineEvent } from '../types';
import { 
  IconActivity, 
  IconAlert, 
  IconPlus, 
  IconPill, 
  IconCalendar, 
  IconChevronRight, 
  IconChevronLeft, 
  IconStethoscope,
  IconHeart,
  IconSun,
  IconClock,
  IconQrCode
} from './ui/Icons';

interface DashboardProps {
  familyMembers: FamilyMember[];
  onSelectMember: (id: string) => void;
  onSwitchMember: (id: string) => void;
  selectedId: string;
  onOpenAddModal: () => void;
  medications: Medication[]; 
  appointments: Appointment[]; 
  events: TimelineEvent[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  familyMembers, 
  onSelectMember,
  onSwitchMember,
  selectedId, 
  onOpenAddModal,
  medications,
  appointments,
  events,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const activeMember = familyMembers.find(m => m.id === selectedId) || familyMembers[0];
  
  // Filter data for the active member
  const memberMeds = medications.filter(m => m.memberId === selectedId);
  const memberAppointments = appointments.filter(a => a.memberId === selectedId);
  const pendingMeds = memberMeds.filter(m => !m.adherence[todayStr] || m.adherence[todayStr] === 'pending');

  // --- WELLNESS WHISPERS CALCULATION LOGIC ---
  const calculateWellness = (member: FamilyMember) => {
    // 1. Water Calculation: Weight * 0.033
    const weight = member.weight || 70; // fallback
    const waterLiters = (weight * 0.033).toFixed(1);

    // 2. Steps Calculation
    let stepGoal = 10000;
    const conditions = (member.chronicConditions || []).join(' ').toLowerCase();
    const isSenior = (member.age || 0) > 70;
    const hasMobilityIssue = conditions.includes('disc') || conditions.includes('herniated') || conditions.includes('arthri') || conditions.includes('heart');

    if (isSenior || hasMobilityIssue) {
        stepGoal = 4500;
    }

    // 3. Ideal Weight Range
    // Simple logic: If BMI > 25, target is -10% or upper bound of normal.
    // For demo, using height to calc BMI 25 (Upper Normal). 
    // Height 1.72m -> 1.72*1.72*25 = ~74kg. Range 70-74kg.
    const heightM = (member.height || 170) / 100;
    const upperNormalWeight = Math.round(25 * (heightM * heightM));
    const lowerNormalWeight = Math.round(21 * (heightM * heightM));
    const idealWeightRange = `${lowerNormalWeight}-${upperNormalWeight} kg`;

    // 4. Nutrition Note
    let nutritionNote = "Balanced diet recommended.";
    if (conditions.includes('hypertension')) nutritionNote = "Limit salt intake (Hypertension).";
    else if (conditions.includes('diabetes')) nutritionNote = "Low glycemic index foods favored.";
    
    return { waterLiters, stepGoal, idealWeightRange, nutritionNote };
  };

  const wellness = calculateWellness(activeMember);

  // Navigation Logic for Wellness Whispers Carousel
  const currentIndex = familyMembers.findIndex(m => m.id === selectedId);
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % familyMembers.length;
    onSwitchMember(familyMembers[nextIndex].id);
  };
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + familyMembers.length) % familyMembers.length;
    onSwitchMember(familyMembers[prevIndex].id);
  };

  // Helper to get relative time string
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Helper to find latest activity for a member
  const getLastActivity = (member: FamilyMember) => {
    const firstName = member.name.split(' ')[0]; // e.g. "Mehmet" from "Mehmet (Father)"
    
    // Filter events that match the member's name or specific rules (like Device Sync for dad)
    const memberEvents = events.filter(e => {
       const authorName = e.author.split(' ')[0]; // Handle "Ayşe (Mom)" -> "Ayşe"
       
       // Match if author is the member
       if (authorName === firstName) return true;
       
       // Special case: Device Sync usually belongs to the main patient (Mehmet in this mock)
       if (e.author === 'Device Sync' && firstName === 'Mehmet') return true;

       // If the event description mentions the member (e.g. "Dad seemed tired")
       if (e.description.toLowerCase().includes(member.relation.toLowerCase())) return true;
       
       return false;
    });

    if (memberEvents.length === 0) {
        return { title: 'No recent activity', time: member.lastUpdate };
    }

    // Sort by newest
    const latestEvent = memberEvents.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return {
        title: latestEvent.title,
        time: getRelativeTime(latestEvent.timestamp),
        type: latestEvent.type
    };
  };

  // Status Summary Logic
  const getStatusConfig = (status: 'stable' | 'attention' | 'critical') => {
      switch(status) {
          case 'stable': return { label: 'Healthy & Stable', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
          case 'attention': return { label: 'Needs Attention', color: 'bg-amber-100 text-amber-700 border-amber-200' };
          case 'critical': return { label: 'Critical Action', color: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse' };
          default: return { label: 'Unknown', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      }
  };

  return (
    <div className="p-6 space-y-8">
      
      {/* Top Action Header */}
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-slate-800">VitalScribe Family OS</h2>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={onOpenAddModal}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors shadow-lg shadow-indigo-200"
              title="Add New Entry"
            >
                <IconPlus />
            </button>
        </div>
      </div>

      {/* Family Circle */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyMembers.map((member) => {
          const lastActivity = getLastActivity(member);
          const statusConfig = getStatusConfig(member.status);
          
          return (
            <div 
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className={`relative p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 ${
                selectedId === member.id 
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500 shadow-md' 
                    : 'bg-white border-slate-200 hover:shadow-md'
                }`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div>
                            <h3 className="font-bold text-slate-800">{member.name}</h3>
                            <p className="text-xs text-slate-500">{member.relation}</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusConfig.color}`}>
                        {statusConfig.label}
                    </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            lastActivity.title === 'No recent activity' ? 'bg-slate-300' : 'bg-teal-500 animate-pulse'
                        }`}></div>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]" title={lastActivity.title}>
                            {lastActivity.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 flex-shrink-0 flex items-center gap-1">
                        <IconClock /> {lastActivity.time}
                      </span>
                   </div>
                </div>
            </div>
          );
        })}
      </div>

      {/* WELLNESS WHISPERS CARD */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-500">
         <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <IconHeart /> Wellness Whispers for {activeMember.name}
                </h3>
                
                {/* Navigation Carousel Buttons */}
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="p-1.5 bg-white/10 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors border border-white/20">
                        <IconChevronLeft />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="p-1.5 bg-white/10 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors border border-white/20">
                        <IconChevronRight />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1">💧 Water Target</p>
                    <p className="text-2xl font-bold">{wellness.waterLiters} Liters</p>
                    <p className="text-[10px] text-teal-200">Based on {activeMember.weight}kg body weight</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1">👣 Daily Steps</p>
                    <p className="text-2xl font-bold">{wellness.stepGoal.toLocaleString()}</p>
                    <p className="text-xs text-teal-200">Adjusted for {activeMember.age}y & Conditions</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1">⚖️ Ideal Weight</p>
                    <p className="text-2xl font-bold">{wellness.idealWeightRange}</p>
                    <p className="text-[10px] text-teal-200">Current: {activeMember.weight}kg</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1">🥗 Nutrition</p>
                    <p className="text-sm font-medium leading-tight">{wellness.nutritionNote}</p>
                </div>
            </div>
         </div>
         {/* Decorative elements */}
         <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-400 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-900 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Medications Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><IconPill className="text-indigo-500" /> {activeMember.name.split(' ')[0]}'s Meds</h3>
                 <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded-full text-slate-600">{pendingMeds.length} Remaining</span>
             </div>
             
             <div className="space-y-3">
                {memberMeds.slice(0, 3).map(med => {
                    const status = med.adherence[todayStr];
                    return (
                        <div key={med.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <h4 className="font-semibold text-sm text-slate-800">{med.name}</h4>
                                <p className="text-xs text-slate-500">{med.instructions || med.frequency}</p>
                            </div>
                            {status === 'taken' ? (
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><IconAlert className="w-3 h-3" /> Taken</span>
                            ) : status === 'skipped' ? (
                                <span className="text-rose-500 bg-rose-50 px-2 py-1 rounded text-xs font-bold">Skipped</span>
                            ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                            )}
                        </div>
                    )
                })}
                {memberMeds.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No medications configured for {activeMember.name}.</p>}
             </div>
          </div>

          {/* Upcoming Appointment Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
             <div className="relative z-10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><IconCalendar /> Next Visit for {activeMember.name.split(' ')[0]}</h3>
                
                {memberAppointments.length > 0 ? (
                    <>
                        <div className="mb-4">
                            <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider mb-1">Doctor</p>
                            <p className="text-lg font-bold">{memberAppointments[0].doctorName}</p>
                            <p className="text-sm text-slate-300">{memberAppointments[0].specialty}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider mb-1">Date & Time</p>
                            <p className="text-white font-medium">{new Date(memberAppointments[0].date).toLocaleString([], {weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                    </>
                ) : (
                    <div className="py-6 text-center text-slate-400">
                        <p>No upcoming appointments.</p>
                    </div>
                )}
             </div>
             
             <button className="relative z-10 w-full bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-sm border border-white/10">
                 <IconStethoscope /> Prepare for Visit
             </button>
             
             {/* Decorative Background */}
             <div className="absolute right-0 top-0 h-full w-32 bg-white/5 skew-x-12 transform translate-x-10 pointer-events-none"></div>
          </div>
      </div>

    </div>
  );
};