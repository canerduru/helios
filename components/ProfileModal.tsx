import React, { useState, useEffect } from 'react';
import { FamilyMember, InsurancePolicy } from '../types';
import { parseInsurancePolicy } from '../services/geminiService';
import { 
    IconClose, IconCheck, IconPlus, IconTrash, 
    IconActivity, IconAlert, IconCamera, IconShield, 
    IconFileCheck, IconScan, IconUpload 
} from './ui/Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  onSave: (updatedMember: FamilyMember) => void;
}

type TabType = 'biometrics' | 'clinical' | 'insurance' | 'contact';

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, member, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('biometrics');
  const [formData, setFormData] = useState<FamilyMember>(member);
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  // Insurance State
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [isAnalyzingPolicy, setIsAnalyzingPolicy] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Partial<InsurancePolicy>>({
      provider: 'Acıbadem Sigorta',
      policyNumber: '',
      startDate: '',
      endDate: '',
      isActive: true,
      isPrimary: false
  });

  // Reset form when member changes
  useEffect(() => {
    setFormData(member);
    setActiveTab('biometrics');
    setIsAddingPolicy(false);
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof FamilyMember, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatarUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    const current = formData.chronicConditions || [];
    handleChange('chronicConditions', [...current, newCondition.trim()]);
    setNewCondition('');
  };

  const removeCondition = (index: number) => {
    const current = formData.chronicConditions || [];
    handleChange('chronicConditions', current.filter((_, i) => i !== index));
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    const current = formData.allergies || [];
    handleChange('allergies', [...current, newAllergy.trim()]);
    setNewAllergy('');
  };

  const removeAllergy = (index: number) => {
    const current = formData.allergies || [];
    handleChange('allergies', current.filter((_, i) => i !== index));
  };

  // --- Insurance Logic ---

  const handlePolicyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     setIsAnalyzingPolicy(true);
     const reader = new FileReader();
     reader.onloadend = async () => {
         const base64 = (reader.result as string).split(',')[1];
         const result = await parseInsurancePolicy(base64);
         
         setNewPolicy(prev => ({
             ...prev,
             provider: result.provider || prev.provider,
             policyNumber: result.policyNumber || prev.policyNumber,
             startDate: result.startDate || prev.startDate,
             endDate: result.endDate || prev.endDate,
             emergencyContact: result.emergencyPhone ? { name: 'Insurance Support', phone: result.emergencyPhone } : prev.emergencyContact
         }));
         setIsAnalyzingPolicy(false);
     };
     reader.readAsDataURL(file);
  };

  const handleSavePolicy = () => {
      if (!newPolicy.provider || !newPolicy.policyNumber) {
          alert("Please provide at least a provider and policy number.");
          return;
      }

      const policy: InsurancePolicy = {
          id: Date.now().toString(),
          provider: newPolicy.provider || 'Other',
          policyNumber: newPolicy.policyNumber || '',
          startDate: newPolicy.startDate || '',
          endDate: newPolicy.endDate || '',
          coverageDetails: newPolicy.coverageDetails,
          notes: newPolicy.notes,
          isActive: newPolicy.isActive ?? true,
          isPrimary: newPolicy.isPrimary ?? false,
          emergencyContact: newPolicy.emergencyContact
      };

      const currentPolicies = formData.insurancePolicies || [];
      // If new policy is primary, unset others
      const updatedPolicies = policy.isPrimary 
        ? currentPolicies.map(p => ({...p, isPrimary: false})) 
        : currentPolicies;

      handleChange('insurancePolicies', [...updatedPolicies, policy]);
      setIsAddingPolicy(false);
      setNewPolicy({ provider: 'Acıbadem Sigorta', policyNumber: '', startDate: '', endDate: '', isActive: true, isPrimary: false });
  };

  const deletePolicy = (id: string) => {
      if(window.confirm("Remove this policy?")) {
          const current = formData.insurancePolicies || [];
          handleChange('insurancePolicies', current.filter(p => p.id !== id));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const providers = [
      'Acıbadem Sigorta', 'Allianz Sigorta', 'Anadolu Sigorta', 'Axa Sigorta', 
      'Groupama', 'Türkiye Sigorta', 'Mapfre', 'Sompo', 'SGK (Government)', 'Other'
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden">
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Edit Health Profile</h3>
                    <p className="text-xs text-slate-500">Update biometrics for better AI insights</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <IconClose />
            </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white">
            <button 
                onClick={() => setActiveTab('biometrics')} 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'biometrics' ? 'text-teal-600 border-teal-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            >
                Biometrics
            </button>
            <button 
                onClick={() => setActiveTab('clinical')} 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'clinical' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            >
                Clinical
            </button>
            <button 
                onClick={() => setActiveTab('insurance')} 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'insurance' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            >
                Insurance
            </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 bg-slate-50/50">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* --- TAB: BIOMETRICS --- */}
                {activeTab === 'biometrics' && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        {/* Avatar Edit Section */}
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden relative bg-slate-100">
                                    <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <IconCamera className="text-white drop-shadow-md" size={24} />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-teal-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                                    <IconCamera size={14} />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-3">Tap photo to change</p>
                            <input 
                                type="file" 
                                id="avatar-upload" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                            />
                        </div>

                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <IconActivity size={16} /> Physical Stats
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.age || ''}
                                    onChange={(e) => handleChange('age', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Height (cm)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.height || ''}
                                    onChange={(e) => handleChange('height', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Weight (kg)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.weight || ''}
                                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Type</label>
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.bloodType || ''}
                                    onChange={(e) => handleChange('bloodType', e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>

                         <div className="mt-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Info</h4>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Phone</label>
                                <input 
                                    type="tel" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.contactPhone || ''}
                                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: CLINICAL --- */}
                {activeTab === 'clinical' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4">
                        {/* Conditions */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                Chronic Conditions
                            </h4>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text"
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Hypertension"
                                    value={newCondition}
                                    onChange={(e) => setNewCondition(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                                />
                                <button 
                                    type="button"
                                    onClick={handleAddCondition}
                                    className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100"
                                >
                                    <IconPlus />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.chronicConditions?.map((c, i) => (
                                    <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                                        {c}
                                        <button type="button" onClick={() => removeCondition(i)} className="text-indigo-400 hover:text-indigo-900"><IconTrash size={14} /></button>
                                    </span>
                                ))}
                                {(!formData.chronicConditions || formData.chronicConditions.length === 0) && (
                                    <p className="text-xs text-slate-400 italic">No conditions listed.</p>
                                )}
                            </div>
                        </div>

                        {/* Allergies */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <IconAlert size={16} /> Allergies
                            </h4>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text"
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                                    placeholder="e.g. Peanuts"
                                    value={newAllergy}
                                    onChange={(e) => setNewAllergy(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                                />
                                <button 
                                    type="button"
                                    onClick={handleAddAllergy}
                                    className="bg-rose-50 text-rose-600 p-2 rounded-lg hover:bg-rose-100"
                                >
                                    <IconPlus />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.allergies?.map((a, i) => (
                                    <span key={i} className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                                        {a}
                                        <button type="button" onClick={() => removeAllergy(i)} className="text-rose-400 hover:text-rose-900"><IconTrash size={14} /></button>
                                    </span>
                                ))}
                                {(!formData.allergies || formData.allergies.length === 0) && (
                                    <p className="text-xs text-slate-400 italic">No allergies listed.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: INSURANCE --- */}
                {activeTab === 'insurance' && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        
                        {!isAddingPolicy ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                        <IconShield size={16} /> Active Policies
                                    </h4>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddingPolicy(true)}
                                        className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1"
                                    >
                                        <IconPlus size={14} /> Add Policy
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.insurancePolicies?.map((policy) => (
                                        <div key={policy.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                            {policy.isPrimary && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">PRIMARY</div>}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                                        <IconFileCheck size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">{policy.provider}</h3>
                                                        <p className="text-xs text-slate-500 font-mono">#{policy.policyNumber}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => deletePolicy(policy.id)} className="text-slate-300 hover:text-rose-500">
                                                    <IconTrash size={16} />
                                                </button>
                                            </div>
                                            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                                <span><span className="font-semibold text-slate-700">Expires:</span> {policy.endDate || 'N/A'}</span>
                                                <span className={`px-2 py-0.5 rounded-full font-bold ${policy.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {policy.isActive ? 'Active' : 'Expired'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!formData.insurancePolicies || formData.insurancePolicies.length === 0) && (
                                        <div className="text-center py-8 bg-slate-100/50 rounded-xl border border-dashed border-slate-300">
                                            <IconShield className="mx-auto text-slate-300 mb-2" size={32} />
                                            <p className="text-sm font-medium text-slate-600">Özel sağlık sigortam yok</p>
                                            <p className="text-xs text-slate-400 mt-1">Tap 'Add Policy' to link insurance.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-800">Add New Policy</h3>
                                    <button type="button" onClick={() => setIsAddingPolicy(false)} className="text-slate-400"><IconClose /></button>
                                </div>
                                
                                {/* AI OCR UPLOAD */}
                                <div className="mb-6">
                                    <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors group relative overflow-hidden">
                                        <div className="flex flex-col items-center">
                                            {isAnalyzingPolicy ? (
                                                <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
                                            ) : (
                                                <IconScan className="text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                                            )}
                                            <p className="text-xs font-bold text-emerald-700">
                                                {isAnalyzingPolicy ? 'Analyzing Document...' : 'Scan Policy / Upload Photo'}
                                            </p>
                                            <p className="text-[10px] text-emerald-600/70">Auto-fill via AI</p>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePolicyUpload} disabled={isAnalyzingPolicy} />
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Insurance Provider</label>
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={newPolicy.provider}
                                            onChange={(e) => setNewPolicy({...newPolicy, provider: e.target.value})}
                                        >
                                            {providers.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Policy Number</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                            placeholder="e.g. 12345678"
                                            value={newPolicy.policyNumber}
                                            onChange={(e) => setNewPolicy({...newPolicy, policyNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Start Date</label>
                                            <input 
                                                type="date"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={newPolicy.startDate}
                                                onChange={(e) => setNewPolicy({...newPolicy, startDate: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">End Date</label>
                                            <input 
                                                type="date"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={newPolicy.endDate}
                                                onChange={(e) => setNewPolicy({...newPolicy, endDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 pt-2">
                                        <input 
                                            type="checkbox" 
                                            id="isPrimary" 
                                            checked={newPolicy.isPrimary} 
                                            onChange={(e) => setNewPolicy({...newPolicy, isPrimary: e.target.checked})}
                                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                        <label htmlFor="isPrimary" className="text-sm text-slate-700 font-medium">Set as Primary Insurance</label>
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={handleSavePolicy}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 mt-2"
                                    >
                                        <IconCheck /> Save Policy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-200 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2"
            >
                <IconCheck /> Save Profile
            </button>
        </div>

      </div>
    </div>
  );
};