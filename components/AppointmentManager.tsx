import React, { useState } from 'react';
import { Appointment, FamilyMember } from '../types';
import { IconCalendar, IconPlus, IconStethoscope, IconCheck, IconClose, IconClock, IconFamily, IconChevronDown } from './ui/Icons';

interface AppointmentManagerProps {
  appointments: Appointment[];
  familyMembers: FamilyMember[];
  currentUserId: string;
  onAddAppointment: (appointment: Appointment) => void;
}

export const AppointmentManager: React.FC<AppointmentManagerProps> = ({ appointments, familyMembers, currentUserId, onAddAppointment }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterId, setFilterId] = useState<string>(currentUserId);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    date: '',
    notes: ''
  });

  // Filter logic
  const displayedAppointments = filterId === 'all' 
    ? appointments 
    : appointments.filter(a => a.memberId === filterId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      memberId: filterId === 'all' ? currentUserId : filterId, // Assign to selected or default
      doctorName: formData.doctorName,
      specialty: formData.specialty,
      date: new Date(formData.date).toISOString(),
      notes: formData.notes
    };
    onAddAppointment(newAppointment);
    setIsAdding(false);
    setFormData({ doctorName: '', specialty: '', date: '', notes: '' });
  };

  const getMemberDetails = (memberId?: string) => {
      const member = familyMembers.find(m => m.id === memberId);
      return {
          name: member ? member.name.split(' ')[0] : 'Unknown',
          avatar: member?.avatarUrl
      };
  };

  const addingForName = filterId === 'all' ? 'Yourself' : familyMembers.find(m => m.id === filterId)?.name.split(' ')[0] || 'Unknown';

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50">
       {/* Header */}
       <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <IconCalendar /> 
                {filterId === 'all' ? 'Family Appointments' : (familyMembers.find(m => m.id === filterId)?.name.split(' ')[0] + "'s Appointments")}
            </h2>
            <p className="text-sm text-slate-500">Shared schedule for doctor visits</p>
         </div>
         
         <div className="flex items-center gap-3">
             {/* MEMBER FILTER DROPDOWN */}
            <div className="relative group">
                <select 
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                    <option value={currentUserId}>My Appointments</option>
                    <option value="all">All Family Members</option>
                    {familyMembers.filter(m => m.id !== currentUserId).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <div className="pl-3 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm hover:border-teal-500 transition-colors pointer-events-none">
                    <IconFamily size={16} className="text-slate-400" />
                    <span className="truncate max-w-[100px]">
                        {filterId === 'all' ? 'All Family' : (filterId === currentUserId ? 'My Schedule' : familyMembers.find(m => m.id === filterId)?.name.split(' ')[0])}
                    </span>
                    <IconChevronDown size={14} className="text-slate-400" />
                </div>
            </div>

             {!isAdding && (
                 <button onClick={() => setIsAdding(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all">
                    <IconPlus /> Add Appointment
                 </button>
             )}
         </div>
       </div>

       {isAdding ? (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">New Appointment</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><IconClose /></button>
             </div>
             
             <p className="text-sm text-slate-500 mb-4 bg-indigo-50 p-2 rounded border border-indigo-100 text-indigo-700 font-medium">
                Scheduling for: {addingForName}
             </p>

             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Doctor Name</label>
                        <input required type="text" value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Dr. Smith" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Specialty</label>
                        <input required type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Cardiology" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Date & Time</label>
                    <input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Notes</label>
                    <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder="Reason for visit, questions to ask..." />
                </div>
                <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2">
                        <IconCheck /> Save Appointment
                    </button>
                </div>
             </form>
         </div>
       ) : (
         <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-6">
                {displayedAppointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(apt => {
                    const member = getMemberDetails(apt.memberId);
                    return (
                        <div key={apt.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative animate-in zoom-in-50 duration-300">
                            {/* Member Tag */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">for</span>
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full border border-slate-100" title={member.name} />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{member.name.charAt(0)}</div>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                        <IconStethoscope size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{apt.doctorName}</h3>
                                        <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">{apt.specialty}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4 pl-[52px]">
                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                    <IconClock size={14} className="text-slate-400" />
                                    {new Date(apt.date).toLocaleString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                </div>
                            </div>
                            {apt.notes && (
                                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic border border-slate-100">
                                    "{apt.notes}"
                                </div>
                            )}
                        </div>
                    );
                })}
                {displayedAppointments.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                        <p>No upcoming appointments found for this filter.</p>
                    </div>
                )}
            </div>
         </div>
       )}
    </div>
  );
};