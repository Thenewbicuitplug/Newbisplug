import React, { useState } from 'react';
import { Cookie, Shield } from 'lucide-react';

interface SecretBakerTriggerProps {
  onOpenAdmin: () => void;
}

export const SecretBakerTrigger: React.FC<SecretBakerTriggerProps> = ({ onOpenAdmin }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-4 z-40">
      <div className="relative">
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-stone-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-lg border border-stone-800 pointer-events-none animate-in fade-in">
            👩‍🍳 Baker's Back-of-House Portal
            <div className="text-[9px] text-pink-400">Attach photos, manage stock & orders</div>
          </div>
        )}
        <button
          onClick={onOpenAdmin}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-10 h-10 rounded-full bg-stone-900/80 hover:bg-pink-600 text-stone-300 hover:text-white backdrop-blur-xs flex items-center justify-center shadow-lg border border-stone-700/50 hover:border-pink-400 transition active:scale-95 group"
          title="Baker's Back-of-House Portal"
          aria-label="Admin Portal"
        >
          <Cookie className="w-5 h-5 group-hover:rotate-45 transition duration-300" />
        </button>
      </div>
    </div>
  );
};
