import React, { useState } from 'react';
import { MedicalReport, FamilyMember } from '../types';
import { analyzeMedicalReport } from '../services/geminiService';
import { 
    IconReport, IconUpload, IconEye, IconPlus, IconClose, IconFamily, IconChevronDown, 
    IconShield, IconCheck, IconShare 
} from './ui/Icons';

interface ReportManagerProps {
  reports: MedicalReport[];
  familyMembers: FamilyMember[];
  currentUserId: string;
  onAddReport: (report: MedicalReport) => void;
  onAddNote: (reportId: string, text: string, author: string) => void;
  onToggleShare: (reportId: string) => void;
}

export const ReportManager: React.FC<ReportManagerProps> = ({ 
    reports, 
    familyMembers, 
    currentUserId,
    onAddReport, 
    onAddNote,
    onToggleShare 
}) => {
  const [view, setView] = useState<'list' | 'upload' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  
  // View State for Dropdown (Defaults to Current User)
  const [viewedMemberId, setViewedMemberId] = useState<string>(currentUserId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setView('upload');
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const analysis = await analyzeMedicalReport(base64String);
      
      const newReport: MedicalReport = {
        id: Date.now().toString(),
        // IMPORTANT: Uploads are always assigned to the CURRENT user ("My Report")
        memberId: currentUserId, 
        title: analysis.title,
        type: analysis.type,
        date: analysis.date,
        doctorName: analysis.doctorName,
        summary: analysis.summary,
        criticalFindings: analysis.criticalFindings || [],
        isShared: false, // Default to private
        familyNotes: []
      };
      
      onAddReport(newReport);
      setSelectedReport(newReport);
      setIsAnalyzing(false);
      setView('detail');
    };
    reader.readAsDataURL(file);
  };

  const handleAddNote = () => {
    if (!noteInput.trim() || !selectedReport) return;
    const authorName = familyMembers.find(m => m.id === currentUserId)?.name.split(' ')[0] || 'Me';
    onAddNote(selectedReport.id, noteInput, authorName);
    setNoteInput('');
  };

  // --- Filtering Logic ---
  // If viewing self: Show all my reports.
  // If viewing others: Show ONLY shared reports belonging to that person.
  const displayedReports = reports.filter(r => {
      if (viewedMemberId === currentUserId) {
          return r.memberId === currentUserId;
      } else {
          return r.memberId === viewedMemberId && r.isShared;
      }
  });

  const viewedMemberName = familyMembers.find(m => m.id === viewedMemberId)?.name.split(' ')[0] || 'Unknown';

  if (view === 'detail' && selectedReport) {
    const isOwner = selectedReport.memberId === currentUserId;

    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center gap-1">← Back to Reports</button>
            <div className="flex gap-2">
                 {isOwner && (
                     <button 
                        onClick={() => onToggleShare(selectedReport.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${selectedReport.isShared ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}
                     >
                         <IconShare size={14} />
                         {selectedReport.isShared ? 'Shared with Family' : 'Private'}
                     </button>
                 )}
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wide">{selectedReport.type}</span>
                    <h1 className="text-2xl font-bold text-slate-900 mt-2">{selectedReport.title}</h1>
                    <p className="text-slate-500">{selectedReport.doctorName ? `Dr. ${selectedReport.doctorName}` : 'Doctor Unknown'} • {selectedReport.date}</p>
                </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6">
                <h3 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">✨ AI Summary</h3>
                <p className="text-emerald-900 leading-relaxed">{selectedReport.summary}</p>
            </div>

            {selectedReport.criticalFindings.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 mb-6">
                    <h3 className="text-rose-800 font-bold mb-2">⚠️ Critical Findings</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {selectedReport.criticalFindings.map((finding, idx) => (
                            <li key={idx} className="text-rose-900 font-medium">{finding}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><IconFamily /> Family Notes</h3>
                <div className="space-y-4 mb-4">
                    {selectedReport.familyNotes.map(note => (
                        <div key={note.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-700">{note.author}</span>
                                <span className="text-xs text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-600">{note.text}</p>
                        </div>
                    ))}
                    {selectedReport.familyNotes.length === 0 && <p className="text-sm text-slate-400 italic">No notes added yet.</p>}
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Add a comment for the family..."
                        value={noteInput}
                        onChange={e => setNoteInput(e.target.value)}
                    />
                    <button 
                        onClick={handleAddNote}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><IconReport /> Medical Reports</h2>
           <p className="text-sm text-slate-500">Secure storage & AI analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* MEMBER FILTER DROPDOWN */}
            <div className="relative group">
                <select 
                    value={viewedMemberId}
                    onChange={(e) => setViewedMemberId(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                    <option value={currentUserId}>My Reports</option>
                    {familyMembers.filter(m => m.id !== currentUserId).map(m => (
                        <option key={m.id} value={m.id}>{m.name}'s Shared</option>
                    ))}
                </select>
                <div className="pl-3 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm hover:border-teal-500 transition-colors pointer-events-none">
                    <IconFamily size={16} className="text-slate-400" />
                    <span className="truncate max-w-[100px]">
                        {viewedMemberId === currentUserId ? 'My Reports' : `${viewedMemberName}'s Shared`}
                    </span>
                    <IconChevronDown size={14} className="text-slate-400" />
                </div>
            </div>

            {/* Upload Button - Always uploads for CURRENT USER */}
            <div className="relative">
                <input 
                    type="file" 
                    id="report-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isAnalyzing}
                />
                <label 
                    htmlFor="report-upload"
                    className={`cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all ${isAnalyzing ? 'opacity-70 pointer-events-none' : ''}`}
                >
                    {isAnalyzing ? (
                        <>Processing...</>
                    ) : (
                        <><IconUpload /> Upload My Report</>
                    )}
                </label>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-4">
            {displayedReports.length > 0 ? (
                displayedReports.map(report => (
                    <div 
                        key={report.id} 
                        onClick={() => { setSelectedReport(report); setView('detail'); }}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <IconReport />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{report.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">{report.type}</span>
                                    <span>• {report.date}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Privacy Badge */}
                            {report.memberId === currentUserId && (
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${report.isShared ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {report.isShared ? 'SHARED' : 'PRIVATE'}
                                </span>
                            )}
                            
                            {report.criticalFindings.length > 0 && (
                                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full flex items-center gap-1">
                                    ⚠️ {report.criticalFindings.length} Alerts
                                </span>
                            )}
                            <button className="text-slate-300 group-hover:text-indigo-500">
                                <IconEye />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                 <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="font-medium text-slate-600 mb-1">
                        {viewedMemberId === currentUserId 
                            ? "You haven't uploaded any reports yet." 
                            : `${viewedMemberName} hasn't shared any reports.`
                        }
                    </p>
                    {viewedMemberId === currentUserId && <p className="text-xs">Upload a lab result to get started.</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
