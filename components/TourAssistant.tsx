
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { getAssistantResponse } from '../services/geminiService';

const TourAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Welcome to Action Divers. I am your Tour Assistant. How can I help you discover the magic of Belize today?" }
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
      <div className="fixed bottom-8 right-8 z-[40]">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#005F73] to-[#E9D8A6] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform ring-4 ring-white/5"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="text-[#001219] w-8 h-8" />
          </button>
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
                <div className="w-12 h-12 rounded-full bg-[#E9D8A6] flex items-center justify-center shadow-inner">
                  <Sparkles className="text-[#001219] w-6 h-6" />
                </div>
                <div>
                  <h3 className="serif text-[#E9D8A6] font-bold text-lg">Tour Assistant</h3>
                  <p className="text-[10px] text-[#E9D8A6]/60 uppercase tracking-[0.3em]">Bespoke Concierge</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-3 rounded-full hover:bg-white/5 text-[#E9D8A6]/60 hover:text-[#E9D8A6] transition-colors"
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
                      ? 'bg-[#005F73] text-white rounded-tr-none shadow-xl' 
                      : 'bg-white/5 text-[#E9D8A6]/90 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/5 animate-pulse text-[#E9D8A6]/40 text-[10px] uppercase tracking-widest font-bold">
                    Analyzing Expeditions...
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
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm text-[#E9D8A6] placeholder-[#E9D8A6]/30 focus:outline-none focus:border-[#E9D8A6]/50 transition-colors"
              />
              <button
                onClick={handleSend}
                className="w-14 h-14 rounded-full bg-[#E9D8A6] text-[#001219] flex items-center justify-center hover:bg-white transition-all shadow-2xl shrink-0 active:scale-90"
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
