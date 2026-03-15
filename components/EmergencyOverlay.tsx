import React, { useState } from 'react';
import { FamilyMember, Medication } from '../types';
import { IconAlert, IconPhone, IconClose, IconShield, IconEye } from './ui/Icons';

interface EmergencyOverlayProps {
  member: FamilyMember;
  medications: Medication[];
  onClose: () => void;
}

export const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({ member, medications, onClose }) => {
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const primaryPolicy = member.insurancePolicies?.find(p => p.isPrimary) || member.insurancePolicies?.[0];

  return (
    <div className="fixed inset-0 z-[100] bg-rose-600 text-white flex flex-col animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-rose-700 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-rose-600 rounded-full flex items-center justify-center animate-pulse">
            <IconAlert />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider">SOS / ACİL DURUM</h1>
            <p className="text-xs text-rose-100">PARAMEDIC INFORMATION CARD</p>
          </div>
        </div>
        <button 
            onClick={onClose} 
            className="px-4 py-2 bg-rose-800 hover:bg-rose-900 rounded-lg text-sm font-bold border border-rose-500"
        >
          Güvende / Close
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Patient Identity - HUGE */}
        <div className="bg-white text-slate-900 rounded-xl p-6 shadow-2xl border-l-8 border-rose-500">
          <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">HASTA / PATIENT</p>
                <h2 className="text-4xl font-black leading-tight">{member.name}</h2>
                <div className="flex gap-4 mt-2 text-xl font-bold text-slate-600">
                    <span>Age: {member.age || 'N/A'}</span>
                    <span>•</span>
                    <span className="text-rose-600">Blood: {member.bloodType || 'Unknown'}</span>
                </div>
            </div>
            {member.avatarUrl && (
                <img src={member.avatarUrl} alt="Patient" className="w-24 h-24 rounded-lg object-cover border-2 border-slate-200" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chronic Conditions */}
            <div className="bg-rose-800/50 p-6 rounded-xl border border-rose-400/30 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-rose-400/30 pb-2">
                    ⚠️ KRONİK / CHRONIC
                </h3>
                <ul className="space-y-2">
                    {member.chronicConditions && member.chronicConditions.length > 0 ? (
                        member.chronicConditions.map((c, i) => (
                            <li key={i} className="text-2xl font-bold flex items-start gap-3">
                                <span className="mt-1.5 w-2 h-2 bg-white rounded-full"></span>
                                {c}
                            </li>
                        ))
                    ) : (
                        <li className="text-rose-200 italic">None listed</li>
                    )}
                </ul>
            </div>

            {/* Allergies */}
            <div className="bg-rose-800/50 p-6 rounded-xl border border-rose-400/30 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-rose-400/30 pb-2">
                    🚫 ALERJİ / ALLERGIES
                </h3>
                <ul className="space-y-2">
                    {member.allergies && member.allergies.length > 0 ? (
                        member.allergies.map((a, i) => (
                            <li key={i} className="text-2xl font-bold flex items-start gap-3 text-yellow-300">
                                <span className="mt-1.5 w-2 h-2 bg-yellow-300 rounded-full"></span>
                                {a}
                            </li>
                        ))
                    ) : (
                        <li className="text-rose-200 italic">No known allergies</li>
                    )}
                </ul>
            </div>
        </div>

        {/* Insurance Info - New Section */}
        {primaryPolicy && (
             <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-xl p-6 backdrop-blur-sm">
                 <h3 className="text-lg font-bold text-emerald-100 uppercase tracking-widest mb-4 border-b border-emerald-500/30 pb-2 flex items-center gap-2">
                    <IconShield /> SİGORTA / INSURANCE
                 </h3>
                 <div className="flex flex-col md:flex-row justify-between gap-4">
                     <div>
                         <p className="text-xs text-emerald-200 uppercase">Provider</p>
                         <p className="text-2xl font-bold text-white">{primaryPolicy.provider}</p>
                     </div>
                     <div>
                         <p className="text-xs text-emerald-200 uppercase">Policy Number</p>
                         <div className="flex items-center gap-3">
                             <p className="text-2xl font-mono text-white">
                                 {showFullPolicy ? primaryPolicy.policyNumber : `**** ${primaryPolicy.policyNumber.slice(-4)}`}
                             </p>
                             <button 
                                onClick={() => setShowFullPolicy(!showFullPolicy)}
                                className="px-3 py-1 bg-emerald-800/50 rounded text-xs font-bold hover:bg-emerald-700 transition-colors border border-emerald-500/30"
                             >
                                 {showFullPolicy ? 'HIDE' : 'SHOW'}
                             </button>
                         </div>
                     </div>
                     {primaryPolicy.emergencyContact && (
                         <div>
                             <p className="text-xs text-emerald-200 uppercase">Insurance Support</p>
                             <p className="text-xl font-bold text-white">{primaryPolicy.emergencyContact.phone}</p>
                         </div>
                     )}
                 </div>
             </div>
        )}

        {/* Medications */}
        <div className="bg-white text-slate-900 rounded-xl p-6 shadow-xl">
             <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
                İLAÇLAR / MEDICATIONS
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {medications.map(med => (
                    <div key={med.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-bold text-lg">{med.name}</p>
                        <p className="text-slate-500">{med.dosage} • {med.frequency}</p>
                    </div>
                ))}
                {medications.length === 0 && <p className="text-slate-400 italic">No active medications.</p>}
             </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-8 pt-8 border-t border-rose-500/50">
            <h3 className="text-sm font-bold text-rose-200 uppercase tracking-widest mb-4">CONTACT FAMILY</h3>
            <a href={`tel:${member.contactPhone}`} className="flex items-center justify-center gap-3 bg-white text-rose-600 font-bold text-xl py-4 rounded-xl hover:bg-rose-50 transition-colors">
                <IconPhone /> CALL {member.contactPhone || 'FAMILY ADMIN'}
            </a>
            <p className="text-center text-xs mt-4 text-rose-200">
                🚨 Location shared with family members via Helios Cloud.
            </p>
        </div>

      </div>
    </div>
  );
};