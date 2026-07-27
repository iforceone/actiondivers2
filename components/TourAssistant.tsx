
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, MessageCircle } from 'lucide-react';
import { getAssistantResponse } from '../services/geminiService';
import { buildWhatsAppUrl } from '../config';

const TourAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Welcome to Action Divers. I can help you compare scuba diving, snorkeling, fishing, island tours, and mainland trips from San Pedro. What are you hoping to do in Belize?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = await getAssistantResponse(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that." }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Action Button - z-40 so it is below navbar/drawer */}
      <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[40]">
        {!isOpen && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#071820]/95 p-2 shadow-2xl backdrop-blur-xl">
            <a
              href={buildWhatsAppUrl('Hi Action Divers & Adventures! I would like help planning a Belize tour.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
              aria-label="Chat with Action Divers on WhatsApp"
              title="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" fill="currentColor" strokeWidth={1.5} />
            </a>
            <button
              onClick={() => setIsOpen(true)}
              className="flex h-12 items-center gap-2 rounded-full bg-[var(--brand-aqua)] px-4 font-bold text-[#001219] transition-transform hover:scale-[1.03]"
              aria-label="Open tour assistant"
            >
              <Sparkles className="h-5 w-5" />
              <span className="hidden text-xs uppercase tracking-widest sm:inline">Need help?</span>
            </button>
          </div>
        )}
      </div>

      {/* Centered Modal Assistant - z-210 to be on top of everything including drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 md:p-6 animate-fade-in">
          {/* Focused Backdrop */}
          <div 
            className="absolute inset-0 bg-[#001219]/90 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Centered Chat Window */}
          <div className="relative w-full max-w-[500px] h-[650px] max-h-[90vh] bg-[#001219] rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 transition-all transform scale-100">
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-[#001219]">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#F8F4E8] flex items-center justify-center shadow-inner">
                  <Sparkles className="text-[#001219] w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold tracking-tight text-[#F8F4E8] font-bold text-lg">Tour Assistant</h3>
                  <p className="text-[10px] text-[#F8F4E8]/60 uppercase tracking-[0.25em]">Tour Help</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-3 rounded-full hover:bg-white/5 text-[#F8F4E8]/60 hover:text-[#F8F4E8] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed ${
                      m.role === 'user' 
                      ? 'bg-[#11C7D9] text-white rounded-tr-none shadow-xl'
                      : 'bg-white/5 text-[#F8F4E8]/90 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/5 animate-pulse text-[#F8F4E8]/40 text-[10px] uppercase tracking-widest font-bold">
                    Checking tour options...
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-[#001219] flex space-x-3 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Where should we take you?"
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm text-[#F8F4E8] placeholder-[#F8F4E8]/30 focus:outline-none focus:border-[#F8F4E8]/50 transition-colors"
              />
              <button
                onClick={handleSend}
                className="w-14 h-14 rounded-full bg-[var(--brand-orange)] text-white flex items-center justify-center hover:bg-[var(--brand-orange-light)] transition-all shadow-2xl shrink-0 active:scale-90"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TourAssistant;
