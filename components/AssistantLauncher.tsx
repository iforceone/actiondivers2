import React from 'react';
import { Sparkles } from 'lucide-react';

interface AssistantLauncherProps {
  onOpen: () => void;
}

const AssistantLauncher: React.FC<AssistantLauncherProps> = ({ onOpen }) => (
  <div className="fixed bottom-3 right-3 z-[40] sm:bottom-5 sm:right-5 md:bottom-8 md:right-8">
    <div className="flex items-center rounded-xl border border-white/10 bg-[#071820]/95 p-1.5 shadow-lg backdrop-blur-xl sm:p-2">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--brand-aqua)] px-3 text-sm font-bold text-[#001219] transition-colors hover:bg-[#43d4e0] sm:min-h-12 sm:px-4"
        aria-label="Open the tour assistant for instant AI answers"
      >
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        <span>Ask AI</span>
      </button>
    </div>
  </div>
);

export default AssistantLauncher;
