import React, { useState, useEffect, useRef } from 'react';
import { Medication, FamilyMember } from '../types';
import { parseMedicationImage } from '../services/geminiService';
import { Html5Qrcode } from "html5-qrcode";
import { 
  IconPill, 
  IconCamera, 
  IconScan, 
  IconPlus, 
  IconCheck, 
  IconClose,
  IconSun, 
  IconCloudSun, 
  IconMoon,
  IconChevronRight,
  IconLeaf,
  IconTrash,
  IconFamily,
  IconChevronDown
} from './ui/Icons';

interface MedicationManagerProps {
  medications: Medication[];
  familyMembers: FamilyMember[];
  currentUserId: string;
  onAddMedication: (med: Medication) => void;
  onUpdateAdherence: (medId: string, status: 'taken' | 'skipped') => void;
  onDeleteMedication: (id: string) => void;
}

// Extracted MedCard component
interface MedCardProps {
  med: Medication;
  todayStr: string;
  ownerName: string;
  ownerAvatar?: string;
  onUpdateAdherence: (medId: string, status: 'taken' | 'skipped') => void;
  onDelete: (id: string) => void;
}

const MedCard: React.FC<MedCardProps> = ({ med, todayStr, ownerName, ownerAvatar, onUpdateAdherence, onDelete }) => {
  const status = med.adherence[todayStr] || 'pending';
  const isSupplement = med.category === 'supplement';
  
  // Dynamic class mapping based on type
  const bgColor = isSupplement ? 'bg-emerald-50' : 'bg-indigo-50';
  const textColor = isSupplement ? 'text-emerald-600' : 'text-indigo-600';
  const groupHoverBg = isSupplement ? 'group-hover:bg-emerald-100' : 'group-hover:bg-indigo-100';

  return (
      <div className={`bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all mb-3 group relative overflow-hidden`}>
          {isSupplement && <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-100 rounded-bl-xl z-0" />}
          
          <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 ${bgColor} ${textColor} rounded-full flex items-center justify-center flex-shrink-0 ${groupHoverBg} transition-colors`}>
                      {isSupplement ? <IconLeaf size={16} /> : <IconPill size={16} />}
                  </div>
                  <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-800 leading-tight truncate">{med.name}</h3>
                      <p className="text-slate-500 text-[10px] truncate">{med.dosage} • {med.form}</p>
                  </div>
              </div>
              {status !== 'pending' && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${status === 'taken' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {status}
                  </span>
              )}
          </div>
          
          {/* Owner Info Chip */}
          <div className="flex items-center gap-1.5 mb-2 relative z-10">
              {ownerAvatar ? (
                  <img src={ownerAvatar} alt={ownerName} className="w-4 h-4 rounded-full border border-slate-200" />
              ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                      {ownerName.charAt(0)}
                  </div>
              )}
              <span className="text-[10px] font-medium text-slate-500 truncate max-w-[100px]">{ownerName}</span>
          </div>

          {/* Supplement Details (Purpose/Source) */}
          {(med.purpose || med.source) && (
              <div className="flex gap-2 mb-2 text-[10px] relative z-10">
                  {med.purpose && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium truncate max-w-[50%]">{med.purpose}</span>}
                  {med.source && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium truncate max-w-[50%]">{med.source}</span>}
              </div>
          )}
          
          <div className="flex flex-wrap gap-1 mb-2 relative z-10">
            {med.times?.map(t => (
                <span key={t} className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                    {t}
                </span>
            ))}
          </div>
          
          {med.instructions && (
              <p className="text-[10px] text-slate-500 mb-2 bg-slate-50 p-1.5 rounded line-clamp-2 relative z-10">
                  "{med.instructions}"
              </p>
          )}

          <div className="flex items-center gap-2 relative z-10">
              <button 
                  onClick={() => onUpdateAdherence(med.id, 'taken')}
                  disabled={status === 'taken'}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1 ${status === 'taken' ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700'}`}
              >
                 {status === 'taken' ? 'Taken' : <><IconCheck size={14} /> Take</>}
              </button>
              {status === 'pending' && (
                  <button 
                      onClick={() => onUpdateAdherence(med.id, 'skipped')}
                      className="px-2 py-1.5 rounded-md font-medium text-xs bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                      Skip
                  </button>
              )}
              <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm('Are you sure you want to remove this from your list?')) onDelete(med.id);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                  title="Delete"
              >
                  <IconTrash size={14} />
              </button>
          </div>
      </div>
  );
};

export const MedicationManager: React.FC<MedicationManagerProps> = ({ 
  medications, 
  familyMembers,
  currentUserId,
  onAddMedication, 
  onUpdateAdherence,
  onDeleteMedication
}) => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [filterId, setFilterId] = useState<string>(currentUserId); // Default to current user
  
  const [addStep, setAddStep] = useState<'select' | 'camera' | 'scan' | 'form'>('select');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  // Form State
  const [form, setForm] = useState<{
    name: string;
    dosage: string;
    form: string;
    frequency: string;
    instructions: string;
    times: string[];
    category: 'medication' | 'supplement';
    purpose: string;
    source: string;
  }>({
    name: '',
    dosage: '',
    form: 'Tablet',
    frequency: 'Daily',
    instructions: '',
    times: [],
    category: 'medication',
    purpose: '',
    source: ''
  });

  const resetFlow = () => {
    setView('list');
    setAddStep('select');
    setForm({ name: '', dosage: '', form: 'Tablet', frequency: 'Daily', instructions: '', times: [], category: 'medication', purpose: '', source: '' });
    setScanError(null);
    setScannedCode(null);
  };

  // Helper to find member details
  const getMemberDetails = (memberId?: string) => {
      const member = familyMembers.find(m => m.id === memberId);
      return {
          name: member ? member.name.split(' ')[0] : 'Unknown', // First name only
          avatar: member?.avatarUrl
      };
  };

  // Barcode Scanner Logic (truncated for brevity, logic same as before)
  useEffect(() => {
    if (addStep === 'scan' && !isAnalyzing) {
        const startScanner = async () => {
            // Wait for DOM to render the reader element
            await new Promise(r => setTimeout(r, 100));
            const element = document.getElementById('reader');
            
            if (element && !scannerRef.current) {
                const scanner = new Html5Qrcode("reader");
                scannerRef.current = scanner;
                
                try {
                    await scanner.start(
                        { facingMode: "environment" }, 
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        (decodedText) => {
                           handleScanSuccess(decodedText);
                        },
                        (errorMessage) => {
                            // Ignore frame errors
                        }
                    );
                } catch (err) {
                    console.error("Failed to start scanner", err);
                    setScanError("Could not start camera. Please ensure permissions are granted.");
                }
            }
        };

        startScanner();

        return () => {
             if (scannerRef.current && scannerRef.current.isScanning) {
                 scannerRef.current.stop().then(() => {
                     scannerRef.current?.clear();
                     scannerRef.current = null;
                 }).catch(console.error);
             }
        };
    }
  }, [addStep, isAnalyzing]);

  const handleScanSuccess = (code: string) => {
     if (isAnalyzing) return;
     setIsAnalyzing(true);
     setScannedCode(code);
     
     if (scannerRef.current) {
         scannerRef.current.stop().then(() => {
             scannerRef.current?.clear();
             scannerRef.current = null;
         }).catch(console.error);
     }

     setTimeout(() => {
        let mockData: {
             name: string;
             dosage: string;
             form: string;
             instructions: string;
             category: 'medication' | 'supplement';
             purpose: string;
             source: string;
        } = {
            name: `Item #${code}`,
            dosage: '',
            form: 'Tablet',
            instructions: '',
            category: 'medication',
            purpose: '',
            source: 'Scanned Barcode'
        };

        if (code === '036382005606') mockData = { name: 'Aspirin (Low Dose)', dosage: '81mg', form: 'Tablet', instructions: 'Take daily for heart health', category: 'medication', purpose: '', source: 'Bayer' };
        if (code === '020525115509') mockData = { name: 'Centrum Silver', dosage: '1 Tablet', form: 'Tablet', instructions: 'Take with food', category: 'supplement', purpose: 'General Health', source: 'Centrum' };
        if (code === '031604014209') mockData = { name: 'Fish Oil', dosage: '1200mg', form: 'Capsule', instructions: 'With a meal', category: 'supplement', purpose: 'Omega 3', source: 'NatureMade' };

        setForm(prev => ({
            ...prev,
            name: mockData.name,
            dosage: mockData.dosage,
            form: mockData.form,
            instructions: mockData.instructions,
            category: mockData.category,
            purpose: mockData.purpose,
            source: mockData.source
        }));
        
        setIsAnalyzing(false);
        setAddStep('form');
     }, 1500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await parseMedicationImage(base64String);
      
      const detectedTimes: string[] = [];
      const instr = (result.instructions || '').toLowerCase();
      if (instr.includes('morning') || instr.includes('breakfast')) detectedTimes.push('morning');
      if (instr.includes('noon') || instr.includes('lunch')) detectedTimes.push('noon');
      if (instr.includes('evening') || instr.includes('dinner')) detectedTimes.push('evening');
      if (instr.includes('bed')) detectedTimes.push('bedtime');

      setForm(prev => ({
        ...prev,
        name: result.name || prev.name,
        dosage: result.dosage || prev.dosage,
        form: result.form || prev.form,
        instructions: result.instructions || prev.instructions,
        times: detectedTimes.length > 0 ? detectedTimes : prev.times
      }));
      setIsAnalyzing(false);
      setAddStep('form');
    };
    reader.readAsDataURL(file);
  };

  const handleMockScan = () => {
     handleScanSuccess("036382005606");
  };

  const toggleTime = (t: string) => {
    setForm(prev => {
        const exists = prev.times.includes(t);
        return {
            ...prev,
            times: exists ? prev.times.filter(x => x !== t) : [...prev.times, t]
        };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMed: Medication = {
      id: Date.now().toString(),
      // Assign to selected user OR default to current user if "All" is selected
      memberId: filterId === 'all' ? currentUserId : filterId, 
      name: form.name,
      dosage: form.dosage,
      form: form.form,
      frequency: form.frequency,
      instructions: form.instructions,
      times: form.times,
      startDate: new Date().toISOString(),
      adherence: {},
      category: form.category,
      purpose: form.category === 'supplement' ? form.purpose : undefined,
      source: form.category === 'supplement' ? form.source : undefined
    };
    onAddMedication(newMed);
    resetFlow();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Medications based on selected dropdown value
  const displayedMeds = filterId === 'all' 
      ? medications 
      : medications.filter(m => m.memberId === filterId);

  const prescriptionMeds = displayedMeds.filter(m => m.category === 'medication');
  const supplementMeds = displayedMeds.filter(m => m.category === 'supplement');

  const categorizeMeds = (meds: Medication[]) => {
    const categories = {
      morning: [] as Medication[],
      noon: [] as Medication[],
      evening: [] as Medication[],
      anytime: [] as Medication[]
    };

    meds.forEach(med => {
      let placed = false;
      const lowerInstr = (med.instructions + ' ' + med.frequency).toLowerCase();
      const hasTime = (t: string) => med.times?.includes(t);
      
      if (hasTime('morning') || (!med.times && (lowerInstr.includes('morning') || lowerInstr.includes('breakfast') || lowerInstr.includes('am')))) {
        categories.morning.push(med);
        placed = true;
      }
      if (hasTime('noon') || (!med.times && (lowerInstr.includes('noon') || lowerInstr.includes('lunch') || lowerInstr.includes('midday')))) {
        categories.noon.push(med);
        placed = true;
      }
      if (hasTime('evening') || hasTime('bedtime') || (!med.times && (lowerInstr.includes('evening') || lowerInstr.includes('dinner') || lowerInstr.includes('night') || lowerInstr.includes('bed') || lowerInstr.includes('pm')))) {
        categories.evening.push(med);
        placed = true;
      }

      if (!placed || hasTime('as_needed')) {
         if (!placed) categories.anytime.push(med);
      }
    });

    return categories;
  };

  const { morning, noon, evening, anytime } = categorizeMeds(prescriptionMeds);

  if (view === 'add') {
    // ... (Keep existing add view logic, it's fine)
    const addingForName = filterId === 'all' ? 'Yourself' : familyMembers.find(m => m.id === filterId)?.name.split(' ')[0] || 'Unknown';
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col relative">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
                {addStep !== 'select' && <button onClick={() => setAddStep('select')} className="text-slate-400">←</button>}
                <h2 className="font-bold text-slate-800">Add Item</h2>
            </div>
            <button onClick={resetFlow}><IconClose /></button>
        </div>
        <div className="p-6">
             <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-500 mb-4 bg-indigo-50 p-2 rounded border border-indigo-100 text-indigo-700 font-medium">
                    Adding for: {addingForName}
                </p>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Name</label>
                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})} className="w-full p-2 border rounded">
                        <option value="medication">Medication</option>
                        <option value="supplement">Supplement</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded font-bold">Add</button>
             </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <IconPill /> 
               {filterId === 'all' ? 'Family Cabinet' : (familyMembers.find(m => m.id === filterId)?.name.split(' ')[0] + "'s Cabinet")}
            </h2>
           <p className="text-sm text-slate-500">Track doses and supplements</p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* MEMBER FILTER DROPDOWN */}
            <div className="relative group">
                <select 
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                    <option value={currentUserId}>My Cabinet</option>
                    <option value="all">All Family Members</option>
                    {familyMembers.filter(m => m.id !== currentUserId).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <div className="pl-3 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm hover:border-teal-500 transition-colors pointer-events-none">
                    <IconFamily size={16} className="text-slate-400" />
                    <span className="truncate max-w-[100px]">
                        {filterId === 'all' ? 'All Family' : (filterId === currentUserId ? 'My Cabinet' : familyMembers.find(m => m.id === filterId)?.name.split(' ')[0])}
                    </span>
                    <IconChevronDown size={14} className="text-slate-400" />
                </div>
            </div>

            <button onClick={() => setView('add')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all">
            <IconPlus /> Add Item
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* PRESCRIPTIONS SECTION */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                <IconPill size={16} /> Prescription Medications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Morning Column */}
                <div className="bg-indigo-50/40 rounded-xl p-3 border border-indigo-100 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-indigo-200 text-indigo-700">
                        <IconSun size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Morning</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1">
                        {morning.map(med => {
                            const details = getMemberDetails(med.memberId);
                            return <MedCard key={med.id} med={med} todayStr={todayStr} ownerName={details.name} ownerAvatar={details.avatar} onUpdateAdherence={onUpdateAdherence} onDelete={onDeleteMedication} />
                        })}
                        {morning.length === 0 && <p className="text-xs text-slate-400 italic text-center mt-4">No morning meds</p>}
                    </div>
                </div>

                {/* Noon Column */}
                <div className="bg-sky-50/40 rounded-xl p-3 border border-sky-100 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-sky-200 text-sky-700">
                        <IconCloudSun size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Noon</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1">
                        {noon.map(med => {
                             const details = getMemberDetails(med.memberId);
                             return <MedCard key={med.id} med={med} todayStr={todayStr} ownerName={details.name} ownerAvatar={details.avatar} onUpdateAdherence={onUpdateAdherence} onDelete={onDeleteMedication} />
                        })}
                        {noon.length === 0 && <p className="text-xs text-slate-400 italic text-center mt-4">No midday meds</p>}
                    </div>
                </div>

                {/* Evening Column */}
                <div className="bg-violet-50/40 rounded-xl p-3 border border-violet-100 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-violet-200 text-violet-700">
                        <IconMoon size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Evening</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1">
                        {evening.map(med => {
                             const details = getMemberDetails(med.memberId);
                             return <MedCard key={med.id} med={med} todayStr={todayStr} ownerName={details.name} ownerAvatar={details.avatar} onUpdateAdherence={onUpdateAdherence} onDelete={onDeleteMedication} />
                        })}
                        {evening.length === 0 && <p className="text-xs text-slate-400 italic text-center mt-4">No evening meds</p>}
                    </div>
                </div>
            </div>

             {anytime.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Prescriptions - Other / As Needed</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                         {anytime.map(med => {
                             const details = getMemberDetails(med.memberId);
                             return <MedCard key={med.id} med={med} todayStr={todayStr} ownerName={details.name} ownerAvatar={details.avatar} onUpdateAdherence={onUpdateAdherence} onDelete={onDeleteMedication} />
                         })}
                    </div>
                </div>
            )}
        </div>

        {/* SUPPLEMENTS SECTION */}
        <div>
            <div className="flex items-center gap-2 mb-4 border-t border-slate-100 pt-6">
                 <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-2">
                    <IconLeaf size={16} /> Supplements & Nutrition
                </h3>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {supplementMeds.map(med => {
                     const details = getMemberDetails(med.memberId);
                     return <MedCard key={med.id} med={med} todayStr={todayStr} ownerName={details.name} ownerAvatar={details.avatar} onUpdateAdherence={onUpdateAdherence} onDelete={onDeleteMedication} />
                })}
                {supplementMeds.length === 0 && (
                    <p className="text-sm text-slate-400 italic col-span-full text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No supplements tracked. Add vitamins, protein, etc.
                    </p>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};