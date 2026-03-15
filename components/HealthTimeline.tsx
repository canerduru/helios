import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, AreaChart, Area } from 'recharts';
import { TimelineEvent, HealthMetric, FamilyMember, MetricType } from '../types';
import { IconClock, IconActivity, IconAlert, IconHeart, IconChevronRight, IconChevronLeft, IconFamily, IconChevronDown } from './ui/Icons';

interface HealthTimelineProps {
  events: TimelineEvent[];
  metrics: HealthMetric[];
  patientName: string;
  familyMembers: FamilyMember[];
  currentUserId?: string; // Add currentUserId prop
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-teal-600 font-bold">
          {payload[0].value} {payload[0].unit}
        </p>
      </div>
    );
  }
  return null;
};

const ITEMS_PER_PAGE = 5;

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ events, metrics, patientName, familyMembers, currentUserId = '3' }) => {
  // Local state for filtering and pagination
  const [filterId, setFilterId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // --- CHART LOGIC ---
  // If 'all' is selected, show Current User's data (Caner)
  // If specific user is selected, show that user's data
  const chartTargetId = filterId === 'all' ? currentUserId : filterId;
  const chartTargetName = familyMembers.find(m => m.id === chartTargetId)?.name.split(' ')[0];

  // 1. Filter metrics by Member ID and Type
  const chartMetrics = metrics
    .filter(m => m.type === MetricType.BP_SYSTOLIC)
    .filter(m => {
        // If metric has a memberId, match it. 
        // If not (legacy data), assume it belongs to default user if looking at default user.
        if (m.memberId) return m.memberId === chartTargetId;
        return chartTargetId === currentUserId; 
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const chartData = chartMetrics.map(m => ({
    time: new Date(m.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: m.value,
    unit: m.unit,
    originalDate: m.timestamp
  }));

  const latestMetric = chartMetrics[chartMetrics.length - 1];
  const latestValue = latestMetric ? latestMetric.value : 'N/A';
  const latestUnit = latestMetric ? latestMetric.unit : '';
  const metricName = "Systolic Blood Pressure"; 

  // Determine trend color based on latest value
  const isHigh = typeof latestValue === 'number' && latestValue > 130;
  const trendColor = isHigh ? '#e11d48' : '#0d9488'; // Rose or Teal

  // --- FILTER EVENTS LOGIC ---
  // Keep the Activity Feed filtering logic as is (it works well)
  const filteredEvents = useMemo(() => {
    if (filterId === 'all') {
        return events;
    }
    const selectedMember = familyMembers.find(m => m.id === filterId);
    if (!selectedMember) return events;

    const firstName = selectedMember.name.split(' ')[0]; // e.g. "Mehmet"

    return events.filter(e => {
        // 1. Direct Author Match
        if (e.author.includes(firstName)) return true;
        // 2. Context Match
        if (e.author === 'Demo Log' && selectedMember.relation === 'Father') return true; 
        if (e.author === 'Manual Log' && selectedMember.relation === 'Father') return true; 
        // 3. Description Match
        if (e.description.toLowerCase().includes(selectedMember.relation.toLowerCase())) return true;
        return false;
    });
  }, [events, filterId, familyMembers]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const displayedEvents = filteredEvents.slice(
      (currentPage - 1) * ITEMS_PER_PAGE, 
      currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  };

  // Reset page when filter changes
  React.useEffect(() => {
      setCurrentPage(1);
  }, [filterId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800">Health Timeline</h2>
            <p className="text-xs text-slate-500">Track vitals, symptoms, and family notes.</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
            <div className="relative group min-w-[220px]">
                <select 
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                    <option value="all">All Family Members</option>
                    {familyMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <div className="pl-3 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2 shadow-sm group-hover:border-teal-500 transition-colors pointer-events-none">
                    <IconFamily size={16} className="text-slate-400" />
                    <span className="flex-1 truncate text-left">
                        {filterId === 'all' ? 'All Family Members' : familyMembers.find(m => m.id === filterId)?.name}
                    </span>
                    <IconChevronDown size={16} className="text-slate-400" />
                </div>
            </div>
        </div>
      </div>

      {/* Vitals Chart Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${isHigh ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'}`}>
              <IconHeart size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {chartTargetName}'s {metricName}
              </h3>
              <p className="text-xs text-slate-500">
                Source: Manual Logs & Demo Data
              </p>
            </div>
          </div>
          <div className="text-right">
             {latestValue !== 'N/A' ? (
                 <>
                    <span className={`text-3xl font-black ${isHigh ? 'text-rose-600' : 'text-slate-800'}`}>
                        {latestValue}
                        <span className="text-sm font-bold text-slate-400 ml-1">{latestUnit}</span>
                    </span>
                    {isHigh && <p className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full mt-1">ABOVE TARGET</p>}
                 </>
             ) : (
                 <span className="text-sm text-slate-400 italic">No Data</span>
             )}
          </div>
        </div>
        
        <div className="h-56 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={trendColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                    dataKey="time" 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                />
                <YAxis 
                    domain={['dataMin - 20', 'dataMax + 20']} 
                    hide 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                
                {/* Reference Line for High BP limit */}
                <ReferenceArea y1={130} y2={180} stroke="none" fill="#f43f5e" fillOpacity={0.05} />
                
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={trendColor} 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
                </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <IconActivity size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No vital data recorded for {chartTargetName} yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex justify-between items-center">
            <span>Activity Feed ({filteredEvents.length})</span>
            <span className="text-xs font-normal normal-case bg-slate-100 px-2 py-1 rounded text-slate-600">Page {currentPage} of {Math.max(1, totalPages)}</span>
        </h3>
        
        <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-4 min-h-[300px]">
          
          {displayedEvents.map((event) => (
            <div key={event.id} className="relative pl-8 animate-in slide-in-from-left-2 duration-300">
              {/* Dot */}
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                event.isCareNote 
                  ? 'bg-amber-400' // Care note color
                  : event.type === 'symptom' ? 'bg-rose-500' : 'bg-teal-500' // Standard event colors
              }`}></div>

              {/* Content Card */}
              <div className={`rounded-xl p-4 border shadow-sm transition-all hover:shadow-md ${
                event.isCareNote 
                  ? 'bg-amber-50 border-amber-100' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                         event.isCareNote 
                         ? 'bg-amber-200 text-amber-800' 
                         : 'bg-slate-100 text-slate-600'
                      }`}>
                        {event.isCareNote ? 'FAMILY NOTE' : event.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <IconClock /> {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        <span className="hidden sm:inline">• {new Date(event.timestamp).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-800 mt-1">{event.title}</h4>
                  </div>
                  {event.severity === 'high' && (
                    <IconAlert />
                  )}
                </div>
                
                <p className={`mt-2 text-sm ${event.isCareNote ? 'text-amber-900 italic font-medium' : 'text-slate-600'}`}>
                  "{event.description}"
                </p>
                
                <div className="mt-3 flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                     {event.author.charAt(0)}
                   </div>
                   <span className="text-xs text-slate-500">Logged by <span className="font-medium text-slate-700">{event.author}</span></span>
                </div>
              </div>
            </div>
          ))}
          
          {displayedEvents.length === 0 && (
              <div className="pl-8 text-slate-400 italic text-sm">No activity found for this filter.</div>
          )}

        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4 border-t border-slate-100">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                    <IconChevronLeft /> Previous
                </button>
                
                <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                                currentPage === page
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                    Next <IconChevronRight />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};