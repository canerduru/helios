import React, { useState, useEffect } from 'react';
import { MetricType, TimelineEvent, HealthMetric } from '../types';
import { IconClose, IconPlus } from './ui/Icons';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: TimelineEvent) => void;
  onAddMetric: (metrics: HealthMetric[]) => void;
  currentUser: string; 
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddEvent, 
  onAddMetric,
  currentUser 
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'event'>('vitals');
  
  // Vitals State
  const [vitalType, setVitalType] = useState<string>('BP'); 
  const [vitalValue1, setVitalValue1] = useState(''); 
  const [vitalValue2, setVitalValue2] = useState(''); 
  
  // Event State
  const [eventType, setEventType] = useState<'symptom' | 'medication' | 'note'>('symptom');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Timestamp
  const [timestamp, setTimestamp] = useState('');

  // Initialize timestamp on open
  useEffect(() => {
    if (isOpen) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setTimestamp(now.toISOString().slice(0, 16));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dateObj = new Date(timestamp);
    const dateStr = dateObj.toISOString();

    if (activeTab === 'vitals') {
        const newMetrics: HealthMetric[] = [];
        
        if (vitalType === 'BP') {
            if (vitalValue1) newMetrics.push({
                id: Date.now().toString() + '-sys',
                type: MetricType.BP_SYSTOLIC,
                value: Number(vitalValue1),
                unit: 'mmHg',
                timestamp: dateStr
            });
            if (vitalValue2) newMetrics.push({
                id: Date.now().toString() + '-dia',
                type: MetricType.BP_DIASTOLIC,
                value: Number(vitalValue2),
                unit: 'mmHg',
                timestamp: dateStr
            });
        } else {
            let type = MetricType.HEART_RATE;
            let unit = 'bpm';
            if (vitalType === 'GLUCOSE') { type = MetricType.GLUCOSE; unit = 'mg/dL'; }
            if (vitalType === 'WEIGHT') { type = MetricType.WEIGHT; unit = 'lbs'; }
            if (vitalType === 'TEMP') { type = MetricType.TEMP; unit = '°F'; }

            if (vitalValue1) {
                newMetrics.push({
                    id: Date.now().toString(),
                    type,
                    value: Number(vitalValue1),
                    unit,
                    timestamp: dateStr
                });
            }
        }
        onAddMetric(newMetrics);
    } else {
        const newEvent: TimelineEvent = {
            id: Date.now().toString(),
            title: title || eventType.charAt(0).toUpperCase() + eventType.slice(1),
            description: description,
            timestamp: dateStr,
            type: eventType,
            author: currentUser,
            severity: (eventType === 'symptom' || eventType === 'medication') ? severity : undefined,
            isCareNote: eventType === 'note'
        };
        onAddEvent(newEvent);
    }
    
    // Reset fields
    setTitle('');
    setDescription('');
    setVitalValue1('');
    setVitalValue2('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Log Health Entry</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <IconClose />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => setActiveTab('vitals')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'vitals' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Vitals & Biometrics
            </button>
            <button 
                onClick={() => setActiveTab('event')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'event' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Timeline Event
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Timestamp for both */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Date & Time</label>
                <input 
                    type="datetime-local" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                />
            </div>

            {activeTab === 'vitals' ? (
                <>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Metric Type</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                            value={vitalType}
                            onChange={(e) => setVitalType(e.target.value)}
                        >
                            <option value="BP">Blood Pressure</option>
                            <option value="HR">Heart Rate</option>
                            <option value="GLUCOSE">Glucose</option>
                            <option value="WEIGHT">Weight</option>
                            <option value="TEMP">Temperature</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                {vitalType === 'BP' ? 'Systolic (Top)' : 'Value'}
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    step="0.1"
                                    required
                                    placeholder="0"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                                    value={vitalValue1}
                                    onChange={(e) => setVitalValue1(e.target.value)}
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                                    {vitalType === 'BP' ? 'mmHg' : 
                                     vitalType === 'HR' ? 'bpm' :
                                     vitalType === 'GLUCOSE' ? 'mg/dL' :
                                     vitalType === 'WEIGHT' ? 'lbs' : '°F'}
                                </span>
                            </div>
                        </div>
                        {vitalType === 'BP' && (
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                    Diastolic (Bottom)
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        required
                                        placeholder="0"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                                        value={vitalValue2}
                                        onChange={(e) => setVitalValue2(e.target.value)}
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">mmHg</span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Event Type</label>
                        <div className="flex gap-2">
                            {(['symptom', 'medication', 'note'] as const).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setEventType(t)}
                                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                                        eventType === t 
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-md transform scale-[1.02]' 
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Title</label>
                        <input 
                            type="text" 
                            required
                            placeholder={eventType === 'symptom' ? "e.g., Headache" : eventType === 'medication' ? "e.g., Aspirin" : "e.g., Daily Check-in"}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notes / Description</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-shadow"
                            placeholder="Add details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {eventType !== 'note' && (
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Severity</label>
                             <div className="flex gap-4">
                                {(['low', 'medium', 'high'] as const).map(s => (
                                    <label key={s} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${severity === s ? 'border-teal-600' : 'border-slate-300'}`}>
                                            {severity === s && <div className="w-2 h-2 bg-teal-600 rounded-full" />}
                                        </div>
                                        <span className={`text-sm capitalize transition-colors ${severity === s ? 'text-teal-900 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>{s}</span>
                                        <input 
                                            type="radio" 
                                            name="severity" 
                                            value={s}
                                            checked={severity === s}
                                            onChange={() => setSeverity(s)}
                                            className="hidden"
                                        />
                                    </label>
                                ))}
                             </div>
                        </div>
                    )}
                </>
            )}

            <button 
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transition-all mt-2 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
                <IconPlus />
                Save Entry
            </button>
        </form>
      </div>
    </div>
  );
};