import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 max-w-[92vw] bg-[#0f172a] text-white rounded-2xl px-4 py-2.5 font-black text-xs sm:text-sm shadow-2xl z-50 pointer-events-none text-center animate-in fade-in slide-in-from-top-3 duration-150 border-2 border-white/90 shadow-slate-900/40"
    >
      {message}
    </div>
  );
};
