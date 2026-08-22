
import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { getAssistantResponse } from '../services/geminiService';
import AssistantLauncher from './AssistantLauncher';

const WELCOME_MESSAGE = "Gud day! I’m Kaptin Kai, your local dive guide at Action Divers. Whether you're heading to the Great Blue Hole, checking out the nurse sharks at Hol Chan, or need gear advice—ask away man, mek we get you in di water!";

const QUICK_PROMPTS = [
  '🌊 Top Dive Sites',
  '🤿 Snorkel Hol Chan',
  '📋 Get PADI Certified',
  '📍 Location & Transfers',
];

const TourAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: WELCOME_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsTyping(true);

    const response = await getAssistantResponse(textToSend);
    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that. Please ask again or contact our shop directly." }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Launcher dock — hidden while the chat is open. z-40 keeps it below navbar/drawer. */}
      {!isOpen && <AssistantLauncher onOpen={() => setIsOpen(true)} />}

      {/* Centered Modal Assistant - z-210 to be on top of everything including drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 md:p-6 animate-fade-in">
          {/* Focused Backdrop */}
          <div 
            className="absolute inset-0 bg-[#001219]/90 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Centered Chat Window */}
          <div role="dialog" aria-modal="true" aria-labelledby="tour-assistant-title" className="relative flex h-[650px] max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#001219] shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all sm:rounded-3xl">
            {/* Header */}
            <div className="p-5 sm:p-6 flex justify-between items-center border-b border-white/10 bg-[#041922]">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* 48px x 48px Kai Avatar with active green badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src="/images/kaptin-kai.webp"
                    alt="Kaptin Kai"
                    className="w-12 h-12 rounded-full border-2 border-[var(--brand-aqua)] object-cover shadow-lg"
                    loading="eager"
                    width={48}
                    height={48}
                  />
                  <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#041922] bg-emerald-500"></span>
                  </span>
                </div>

                <div>
                  <h3 id="tour-assistant-title" className="font-extrabold tracking-tight text-[#F8F4E8] text-lg leading-tight">Kaptin Kai</h3>
                  <p className="text-xs text-[#8DDCE7]/85 font-medium tracking-wide">Action Divers Concierge • Local Reef Guide</p>
                </div>
              </div>
              <button 
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)} 
                className="p-2.5 rounded-full hover:bg-white/10 text-[#F8F4E8]/60 hover:text-[#F8F4E8] transition-colors"
                aria-label="Close chat with Kaptin Kai"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[88%] p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${
                      m.role === 'user' 
                      ? 'bg-[var(--brand-aqua)] text-[#001219] font-medium rounded-tr-none shadow-xl'
                      : 'bg-white/5 text-[#F8F4E8]/90 rounded-tl-none border border-white/10'
                    }`}
                  >
                    {m.content}

                    {/* Quick prompts shown under initial greeting when it's the welcome message */}
                    {i === 0 && m.role === 'assistant' && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                        {QUICK_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            disabled={isTyping}
                            onClick={() => handleSend(prompt)}
                            className="rounded-full border border-[var(--brand-aqua)]/40 bg-[var(--brand-aqua)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--brand-aqua)] transition-all hover:bg-[var(--brand-aqua)] hover:text-[#001219] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/10 animate-pulse text-[var(--brand-aqua)] text-xs font-bold flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand-aqua)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand-aqua)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand-aqua)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    <span>Kaptin Kai is checking reef notes...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#001219] flex space-x-3 items-center">
              <input
                type="text"
                name="tourQuestion"
                aria-label="Ask Kaptin Kai a question"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about dive sites, tours, or gear…"
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm text-[#F8F4E8] placeholder-[#F8F4E8]/40 focus:outline-none focus:border-[var(--brand-aqua)] transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--brand-orange)] text-white flex items-center justify-center hover:bg-[var(--brand-orange-light)] transition-all shadow-2xl shrink-0 active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Send question to Kaptin Kai"
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
