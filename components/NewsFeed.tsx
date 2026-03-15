import React, { useEffect, useState } from 'react';
import { FamilyMember, Medication, NewsItem } from '../types';
import { fetchPersonalizedHealthNews } from '../services/geminiService';
import { IconNews, IconActivity, IconChevronRight } from './ui/Icons';

interface NewsFeedProps {
  member: FamilyMember;
  medications: Medication[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ member, medications }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadNews = async () => {
      setLoading(true);
      const items = await fetchPersonalizedHealthNews(member, medications);
      if (mounted) {
        setNews(items);
        setLoading(false);
      }
    };
    loadNews();
    return () => { mounted = false; };
  }, [member.id]); // Reload when member changes

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <IconNews /> Personalized Health Insights
            </h1>
            <p className="text-slate-500 mt-1">
                Curated news and medical updates based on <span className="font-bold text-slate-700">{member.name}</span>'s profile.
            </p>
            <div className="flex gap-2 mt-3">
                {member.chronicConditions?.map(c => (
                    <span key={c} className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                        {c}
                    </span>
                ))}
            </div>
        </div>

        {loading ? (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="grid gap-6">
                {news.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${
                            item.category === 'Warning' ? 'bg-rose-500' : 
                            item.category === 'Research' ? 'bg-indigo-500' : 'bg-teal-500'
                        }`}></div>
                        
                        <div className="flex justify-between items-start mb-2 pl-3">
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                                item.category === 'Warning' ? 'bg-rose-50 text-rose-700' : 
                                item.category === 'Research' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'
                            }`}>
                                {item.category}
                            </span>
                            <span className="text-xs text-slate-400">{item.source} • {item.date}</span>
                        </div>

                        <div className="pl-3">
                            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                {item.summary}
                            </p>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                                    <IconActivity size={14} />
                                    {item.relevanceReason}
                                </div>
                                <button className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                                    Read Full Article <IconChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {news.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <p>No recent updates found for this profile.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};