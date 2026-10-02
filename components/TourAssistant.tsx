
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getAssistantResponse } from '../services/geminiService';
import AssistantLauncher from './AssistantLauncher';
import { buildWhatsAppUrl } from '../config';

const WELCOME_MESSAGE = "Hi! I’m Kaptin Kai, the AI assistant for Action Divers and Adventures. Roberto and the crew are often out on the water with guests, so I’m here to answer your questions about dive sites, tours, and planning in the meantime. Bookings and special requests are always confirmed by our team, and you can message Roberto directly on WhatsApp anytime.";

const WHATSAPP_URL = buildWhatsAppUrl("Hi Roberto, I have a question about Action Divers and Adventures.");

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
  const navigate = useNavigate();

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

    const currentHistory = [...messages];
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsTyping(true);

    const response = await getAssistantResponse(textToSend, currentHistory);
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
                  <span className="absolute -bottom-1 -right-2 rounded-full border-2 border-[#041922] bg-[var(--brand-aqua)] px-1.5 py-px text-[9px] font-extrabold leading-none text-[#001219]">AI</span>
                </div>

                <div>
                  <h3 id="tour-assistant-title" className="font-extrabold tracking-tight text-[#F8F4E8] text-lg leading-tight">Kaptin Kai</h3>
                  <p className="text-xs text-[#8DDCE7]/85 font-medium tracking-wide">AI Concierge • Action Divers and Adventures</p>
                </div>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-1 inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-400 hover:text-[#001219]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Message Roberto</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
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
                    {m.role === 'user' ? (
                      <div>{m.content}</div>
                    ) : (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children, ...props }) => {
                            const isInternal = Boolean(href && (href.startsWith('/') || href.startsWith('#')));
                            return (
                              <a
                                href={href}
                                onClick={(e) => {
                                  if (isInternal && href && href.startsWith('/')) {
                                    e.preventDefault();
                                    setIsOpen(false);
                                    navigate(href);
                                  }
                                }}
                                className="text-[var(--brand-aqua)] font-bold underline decoration-[var(--brand-aqua)]/50 underline-offset-2 hover:text-[var(--brand-orange)] hover:decoration-[var(--brand-orange)] transition-colors cursor-pointer"
                                target={isInternal ? undefined : '_blank'}
                                rel={isInternal ? undefined : 'noopener noreferrer'}
                                {...props}
                              >
                                {children}
                              </a>
                            );
                          },
                          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 my-2 pl-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 my-2 pl-1">{children}</ol>,
                          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic text-[#F8F4E8]">{children}</em>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    )}

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

            <p className="border-t border-white/10 bg-[#001219] px-5 pt-3 text-center text-[11px] leading-snug text-[#F8F4E8]/55">
              Kai is an AI assistant and can make mistakes. For bookings or anything urgent, <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-300 underline">message Roberto on WhatsApp</a>; he replies as soon as he is off the water.
            </p>

            {/* Input Area */}
            <div className="p-4 sm:p-5 bg-[#001219] flex space-x-3 items-center">
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
