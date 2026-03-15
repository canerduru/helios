import React, { useState, useEffect } from 'react';
import { FamilyMember, TimelineEvent } from '../types';
import { generatePatternScan } from '../services/geminiService';
import { IconDna, IconActivity, IconAlert, IconCheck, IconShield, IconFamily } from './ui/Icons';

interface HeritageEngineProps {
  member: FamilyMember;
  familyMembers: FamilyMember[];
  events: TimelineEvent[];
}

interface PatternReport {
  intent: string;
  report_payload: {
    status: "RISK_DETECTED" | "ALL_CLEAR";
    viral_alert: {
      detected: boolean;
      source_person: string;
      at_risk_persons: string[];
      message: string;
    };
    genetic_alert: {
      detected: boolean;
      source_parent: string;
      affected_child: string;
      condition_match: string;
      message: string;
    };
    ui_message: string;
  };
}

export const HeritageEngine: React.FC<HeritageEngineProps> = ({ member, familyMembers, events }) => {
  const [report, setReport] = useState<PatternReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset report when member changes
  useEffect(() => {
    setReport(null); 
  }, [member]);

  const handleRunScan = async () => {
    setLoading(true);
    const result = await generatePatternScan(member, familyMembers, events);
    setReport(result);
    setLoading(false);
  };

  const getMemberAvatar = (name: string) => {
    if (!name) return null;
    const found = familyMembers.find(m => m.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(m.name.split(' ')[0].toLowerCase()));
    return found ? found.avatarUrl : null;
  };

  return (
    <div className="h-full bg-slate-50 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
            
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <IconDna size={24} />
                    <span className="font-bold tracking-widest uppercase text-sm">Pattern Detection Engine</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900">Family Pattern Analysis</h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Analyzing <span className="font-bold text-slate-800">30-day event history</span> for viral loops and genetic echos across the household.
                </p>
            </div>

            {/* Action State */}
            {!report && !loading && (
                <div className="bg-white rounded-2xl border border-dashed border-indigo-200 p-12 text-center shadow-sm">
                    <div className="flex justify-center -space-x-4 mb-6">
                        {familyMembers.slice(0, 4).map(p => (
                            <img key={p.id} src={p.avatarUrl} alt={p.name} className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-slate-100" />
                        ))}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Start Family Scan</h3>
                    <p className="text-slate-500 max-w-lg mx-auto mb-8">
                        The engine checks for infectious symptoms spreading in the house (Viral Loop) and correlations between parent chronic conditions and child symptoms (Genetic Echo).
                    </p>
                    
                    <button 
                        onClick={handleRunScan}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
                    >
                        <IconActivity />
                        Run Analysis
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                    <div className="inline-block relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        <IconDna className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Processing Family Data...</h3>
                    <p className="text-slate-500">Cross-referencing symptoms, history, and viral vectors...</p>
                </div>
            )}

            {/* Results Report */}
            {report && report.report_payload ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                    
                    {/* Main UI Message */}
                    <div className={`p-8 rounded-2xl shadow-lg relative overflow-hidden ${
                        report.report_payload.status === 'ALL_CLEAR' 
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white' 
                            : 'bg-white border-l-8 border-rose-500 text-slate-800'
                    }`}>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-4 font-serif flex items-center gap-2">
                                {report.report_payload.status === 'ALL_CLEAR' ? <IconCheck size={32} /> : <IconAlert size={32} className="text-rose-500" />}
                                {report.report_payload.status === 'ALL_CLEAR' ? 'All Clear' : 'Risk Detected'}
                            </h2>
                            <p className={`text-lg leading-relaxed ${report.report_payload.status === 'ALL_CLEAR' ? 'text-emerald-50' : 'text-slate-600'}`}>
                                {report.report_payload.ui_message}
                            </p>
                        </div>
                        {report.report_payload.status === 'ALL_CLEAR' && (
                             <IconShield className="absolute -right-10 -bottom-10 text-emerald-400 opacity-20" size={200} />
                        )}
                    </div>

                    {/* ALERTS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* SCAN A: Viral Loop */}
                        <div className={`p-6 rounded-xl border-2 transition-all ${
                            report.report_payload.viral_alert?.detected 
                                ? 'bg-rose-50 border-rose-200' 
                                : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className={`font-bold uppercase tracking-wider text-sm flex items-center gap-2 ${
                                    report.report_payload.viral_alert?.detected ? 'text-rose-700' : 'text-slate-400'
                                }`}>
                                    <IconActivity size={18} /> SCAN A: Viral Loop
                                </h3>
                                {report.report_payload.viral_alert?.detected ? (
                                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">DETECTED</span>
                                ) : (
                                    <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">CLEAR</span>
                                )}
                            </div>
                            
                            {report.report_payload.viral_alert?.detected ? (
                                <>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full border-2 border-rose-500 p-0.5 mx-auto mb-1">
                                                 <img src={getMemberAvatar(report.report_payload.viral_alert.source_person) || ''} className="w-full h-full rounded-full object-cover" />
                                            </div>
                                            <p className="text-[10px] font-bold text-rose-700 uppercase">Source</p>
                                        </div>
                                        <div className="h-0.5 flex-1 bg-rose-200"></div>
                                        <div className="flex -space-x-2">
                                            {report.report_payload.viral_alert.at_risk_persons.map((p, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" title={p}>
                                                    <img src={getMemberAvatar(p) || ''} className="w-full h-full rounded-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-rose-800 bg-rose-100 p-3 rounded-lg">
                                        "{report.report_payload.viral_alert.message}"
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-slate-400">No infectious symptoms detected recently.</p>
                            )}
                        </div>

                        {/* SCAN B: Genetic Echo */}
                        <div className={`p-6 rounded-xl border-2 transition-all ${
                            report.report_payload.genetic_alert?.detected 
                                ? 'bg-indigo-50 border-indigo-200' 
                                : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                        }`}>
                             <div className="flex justify-between items-start mb-4">
                                <h3 className={`font-bold uppercase tracking-wider text-sm flex items-center gap-2 ${
                                    report.report_payload.genetic_alert?.detected ? 'text-indigo-700' : 'text-slate-400'
                                }`}>
                                    <IconDna size={18} /> SCAN B: Genetic Echo
                                </h3>
                                {report.report_payload.genetic_alert?.detected ? (
                                    <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">DETECTED</span>
                                ) : (
                                    <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">CLEAR</span>
                                )}
                            </div>

                            {report.report_payload.genetic_alert?.detected ? (
                                <>
                                    <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <img src={getMemberAvatar(report.report_payload.genetic_alert.source_parent) || ''} className="w-8 h-8 rounded-full" />
                                            <div className="text-xs">
                                                <p className="font-bold text-slate-700">{report.report_payload.genetic_alert.source_parent}</p>
                                                <p className="text-slate-400">Parent</p>
                                            </div>
                                        </div>
                                        <div className="text-indigo-300 font-bold">➔</div>
                                        <div className="flex items-center gap-2">
                                            <img src={getMemberAvatar(report.report_payload.genetic_alert.affected_child) || ''} className="w-8 h-8 rounded-full" />
                                            <div className="text-xs">
                                                <p className="font-bold text-slate-700">{report.report_payload.genetic_alert.affected_child}</p>
                                                <p className="text-slate-400">Child</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-indigo-800 bg-indigo-100 p-3 rounded-lg">
                                        "{report.report_payload.genetic_alert.message}"
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-slate-400">No symptoms correlated with parental chronic history.</p>
                            )}
                        </div>

                    </div>
                </div>
            ) : report && !report.report_payload && (
                <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-xl">
                    <p className="text-rose-700 font-bold">Analysis structure error. Please try again.</p>
                    <button onClick={() => setReport(null)} className="mt-4 px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg text-sm font-bold">Retry</button>
                </div>
            )}
        </div>
    </div>
  );
};