import React, { useState, useEffect } from 'react';
import { FamilyMember, Medication } from '../types';
import { Html5Qrcode } from "html5-qrcode";
import { 
  IconClose, 
  IconShield, 
  IconQrCode, 
  IconShare, 
  IconPrinter, 
  IconGlobe, 
  IconAlert,
  IconCheck,
  IconActivity
} from './ui/Icons';

interface HealthPassportProps {
  member: FamilyMember;
  medications: Medication[];
  onClose: () => void;
}

export const HealthPassport: React.FC<HealthPassportProps> = ({ member, medications, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');

  // Generate Passport Data Payload
  const passportData = {
    id: member.id,
    name: member.name,
    dob: `${new Date().getFullYear() - (member.age || 0)}-01-01`, // Approx DOB from Age
    blood: member.bloodType || 'Unknown',
    allergies: member.allergies || [],
    conditions: member.chronicConditions || [],
    meds: medications.map(m => `${m.name} ${m.dosage} (${m.frequency})`),
    emergencyContact: member.contactPhone,
    insurance: member.insurancePolicies?.find(p => p.isPrimary)?.provider || 'None',
    updated: new Date().toISOString()
  };

  // Create QR Code (Simulated with an API for now, or could use a library)
  // In a real app, this would be a secure link to a hosted page: https://helios.health/passport/{encrypted_id}
  // For this demo, we'll use a data URI or a placeholder service.
  useEffect(() => {
    // Ideally use a library like 'qrcode' but using a reliable API for demo visualization without heavy deps
    const dataString = JSON.stringify(passportData);
    const encodedData = encodeURIComponent(dataString);
    // Using a reliable QR code API for visualization
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}&color=1e293b`);
  }, [member, medications]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Health Passport: ${member.name}`,
          text: `Emergency Health Info for ${member.name}. Scan QR for details.`,
          url: window.location.href // In production, this would be the public passport link
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Security Style */}
        <div className="bg-slate-800 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <IconShield size={120} />
            </div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <IconGlobe className="text-teal-400" size={16} />
                        <span className="text-xs font-bold tracking-[0.2em] text-teal-400 uppercase">International</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-wide">Health Passport</h1>
                    <p className="text-slate-400 text-xs mt-1">Universal Emergency ID • Valid Worldwide</p>
                </div>
                <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <IconClose />
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-slate-50">
            
            {/* QR Section */}
            <div className="flex flex-col items-center justify-center p-8 bg-white border-b border-dashed border-slate-300 relative">
                <div className="w-64 h-64 bg-white p-2 border-4 border-slate-900 rounded-xl shadow-lg flex items-center justify-center relative group">
                    {qrUrl ? (
                        <img src={qrUrl} alt="Health Passport QR" className="w-full h-full object-contain" />
                    ) : (
                        <div className="animate-pulse bg-slate-200 w-full h-full rounded"></div>
                    )}
                    
                    {/* Security Hologram Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                    
                    <div className="absolute -bottom-3 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                        SCAN FOR EMERGENCY INFO
                    </div>
                </div>
                
                <p className="mt-6 text-center text-xs text-slate-400">
                    This QR code contains encrypted vital health data.<br/>
                    Accessible by paramedics and authorized medical staff.
                </p>

                {/* Quick Actions */}
                <div className="flex gap-4 mt-6">
                    <button onClick={handleShare} className="flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                            <IconShare size={18} />
                        </div>
                        <span className="text-[10px] font-bold uppercase">Share</span>
                    </button>
                    <button onClick={handlePrint} className="flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600 transition-colors">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                            <IconPrinter size={18} />
                        </div>
                        <span className="text-[10px] font-bold uppercase">Print PDF</span>
                    </button>
                    <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className={`flex flex-col items-center gap-1 transition-colors ${showDetails ? 'text-teal-600' : 'text-slate-600 hover:text-teal-600'}`}
                    >
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm transition-colors ${showDetails ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-slate-100 border-slate-200'}`}>
                            <IconQrCode size={18} />
                        </div>
                        <span className="text-[10px] font-bold uppercase">{showDetails ? 'Hide Info' : 'Show Info'}</span>
                    </button>
                </div>
            </div>

            {/* Passport Details (Foldable) */}
            {showDetails && (
                <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4">
                    
                    {/* Identity Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Identity</h3>
                            <IconShield size={14} className="text-slate-400" />
                        </div>
                        <div className="p-4 flex items-start gap-4">
                            <img src={member.avatarUrl} alt="Profile" className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-slate-100" />
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase leading-none mb-1">{member.name}</h2>
                                <p className="text-sm text-slate-500 font-mono mb-2">DOB: {passportData.dob} ({member.age}y)</p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded border border-rose-200">
                                        BLOOD: {passportData.blood}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Critical Info Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        
                        {/* Allergies */}
                        <div className="bg-rose-50 rounded-xl border border-rose-100 p-4">
                            <h4 className="text-rose-800 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                                <IconAlert size={14} /> Allergies
                            </h4>
                            {passportData.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {passportData.allergies.map((a, i) => (
                                        <span key={i} className="bg-white text-rose-700 px-2 py-1 rounded text-sm font-bold shadow-sm border border-rose-100">
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-rose-400 text-sm italic">No known allergies</p>
                            )}
                        </div>

                        {/* Conditions */}
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                            <h4 className="text-amber-800 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                                <IconActivity size={14} /> Conditions
                            </h4>
                            {passportData.conditions.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {passportData.conditions.map((c, i) => (
                                        <li key={i} className="text-amber-900 text-sm font-medium">{c}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-amber-400 text-sm italic">No chronic conditions</p>
                            )}
                        </div>

                        {/* Meds */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                             <h4 className="text-slate-600 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                                <IconCheck size={14} /> Current Medications
                            </h4>
                            {passportData.meds.length > 0 ? (
                                <ul className="space-y-2">
                                    {passportData.meds.map((m, i) => (
                                        <li key={i} className="text-slate-700 text-sm border-b border-slate-200 pb-1 last:border-0">{m}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-sm italic">No active medications</p>
                            )}
                        </div>
                    </div>

                    {/* Footer / Validity */}
                    <div className="text-center border-t border-slate-200 pt-4">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                            Verified by Helios AI • Updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                </div>
            )}
        </div>
      </div>
    </div>
  );
};