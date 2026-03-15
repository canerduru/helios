import React, { useState, useEffect, useRef } from 'react';
import { Chat } from "@google/genai";
import { createChatSession, sendMessageToAgent } from '../services/geminiService';
import { ChatMessage } from '../types';
import { IconSend, IconMic } from './ui/Icons';

interface ChatInterfaceProps {
    onTriggerEmergency: () => void;
    onShowNews: () => void;
    patientName: string;
    conditions: string[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onTriggerEmergency, onShowNews, patientName, conditions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    chatSessionRef.current = createChatSession();
    
    // Add initial greeting
    setMessages([
      {
        id: 'init',
        role: 'model',
        text: `Hello. I'm Helios, your personal health companion for ${patientName}. How are you feeling today?`,
        timestamp: new Date()
      }
    ]);
  }, [patientName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const upperText = userMsg.text.toUpperCase();

    // --- EMERGENCY KEYWORD DETECTION ---
    const emergencyKeywords = ["SOS", "YARDIM", "FENALAŞTI", "AMBULANS", "ACİL", "HELP", "EMERGENCY"];
    const isEmergency = emergencyKeywords.some(keyword => upperText.includes(keyword));

    if (isEmergency) {
        onTriggerEmergency();
        setIsLoading(false);
        
        const emergencyResponse = `🚨 **SOS SİNYALİ BAŞLATILDI!**\n\nTüm aile üyelerine bildirim gönderildi. Konumunuz paylaşılıyor.\n\n**(Paramediklere Ekranı Gösterin)**`;
        
        const emergencyJson = JSON.stringify({
            intent: "EMERGENCY_SOS",
            speaker: "Helios System",
            subject: patientName,
            emergency_payload: {
                is_active: true,
                broadcast_message: `URGENT: ${patientName} has triggered an SOS signal. Location shared.`,
                target_audience: "ALL_FAMILY"
            },
            ui_display: {
                show_sos_button: true,
                screen_color: "RED"
            }
        }, null, 2);

        const modelMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `${emergencyResponse}\n\n\`\`\`json\n${emergencyJson}\n\`\`\``,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, modelMsg]);
        return;
    }
    
    // --- NEWS / INSIGHTS DETECTION ---
    const newsKeywords = ["HABER", "GELİŞME", "NEWS", "YENİLİK", "TEDAVİ", "ARAŞTIRMA", "UPDATE"];
    const isNewsRequest = newsKeywords.some(keyword => upperText.includes(keyword));

    if (isNewsRequest) {
        setIsLoading(false);
        
        const condStr = conditions.join("' ve '");
        const newsResponse = `${patientName} profilindeki '${condStr}' ile ilgili bu haftanın öne çıkan tıbbi gelişmelerini ve önerilen egzersizleri tarıyorum...`;

        const modelMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: newsResponse,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, modelMsg]);
        
        // Trigger view switch after a short delay for effect
        setTimeout(() => {
            onShowNews();
        }, 1500);
        return;
    }

    try {
      const responseText = await sendMessageToAgent(chatSessionRef.current, userMsg.text);
      
      // Standard Logging JSON append for n8n (Mocking logic for normal logs)
      const logJson = JSON.stringify({
          intent: "LOG_DATA",
          speaker: "User",
          subject: patientName,
          emergency_payload: { is_active: false, broadcast_message: "", target_audience: "NONE" },
          ui_display: { show_sos_button: false, screen_color: "NORMAL" }
      }, null, 2);

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText + `\n\n\`\`\`json\n${logJson}\n\`\`\``,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">Helios AI Agent</h2>
          <p className="text-xs text-slate-500">Private & Secure • Medical Scribe Mode</p>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-slate-700 placeholder-slate-400"
            placeholder="Type 'SOS' for emergency or describe symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="text-slate-400 hover:text-teal-600 transition-colors">
            <IconMic />
          </button>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full transition-colors ${
              input.trim() && !isLoading 
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <IconSend />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
            Ask "Gelişme var mı?" for news or type "SOS" for emergency.
        </p>
      </div>
    </div>
  );
};