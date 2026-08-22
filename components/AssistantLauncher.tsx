import React from 'react';

interface AssistantLauncherProps {
  onOpen: () => void;
}

const AssistantLauncher: React.FC<AssistantLauncherProps> = ({ onOpen }) => (
  <div className="fixed bottom-3 right-3 z-[40] sm:bottom-5 sm:right-5 md:bottom-8 md:right-8 group">
    {/* Desktop Hover Tooltip */}
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full right-0 mb-3 hidden whitespace-nowrap rounded-xl border border-white/15 bg-[#001219]/95 px-3.5 py-2 text-xs font-semibold text-[var(--brand-ivory)] shadow-2xl backdrop-blur-md transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 md:block"
    >
      Got dive questions? Ask Kaptin Kai!
      <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-white/15 bg-[#001219]/95" />
    </div>

    <div className="flex items-center rounded-full border border-white/15 bg-[#071820]/95 p-1.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-[var(--brand-aqua)]/60 sm:p-2">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-11 items-center justify-center gap-3 rounded-full bg-[var(--brand-navy)]/80 py-1 pl-1.5 pr-4 text-sm font-bold text-[var(--brand-ivory)] transition-all hover:bg-white/10 sm:min-h-12 sm:pr-5"
        aria-label="Ask Kaptin Kai - Virtual Divemaster & Island Concierge"
      >
        {/* Avatar with active online indicator */}
        <div className="relative flex-shrink-0">
          <img
            src="/images/kaptin-kai.webp"
            alt="Kaptin Kai - Virtual Divemaster & Island Concierge"
            className="h-10 w-10 rounded-full border-2 border-[var(--brand-aqua)] object-cover shadow-md"
            loading="eager"
            width={40}
            height={40}
          />
          <span className="absolute bottom-0 right-0 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#071820] bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold text-[var(--brand-aqua)] uppercase tracking-wider leading-none">Online</span>
          <span className="font-extrabold tracking-tight text-[var(--brand-ivory)] text-sm leading-tight">Ask Kaptin Kai</span>
        </div>
      </button>
    </div>
  </div>
);

export default AssistantLauncher;
