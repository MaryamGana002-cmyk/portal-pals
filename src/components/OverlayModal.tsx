import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw } from 'lucide-react';

interface OverlayModalProps {
  isOpen: boolean;
  type: 'start' | 'win';
  finalTime: number;
  bestTime: number | null;
  onPlay: () => void;
  onOpenCustomizer?: () => void;
}

export const OverlayModal: React.FC<OverlayModalProps> = ({
  isOpen,
  type,
  finalTime,
  bestTime,
  onPlay,
  onOpenCustomizer,
}) => {
  useEffect(() => {
    if (isOpen && type === 'win') {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#ff6fae', '#ffd166', '#8df0c7', '#38bdf8', '#a855f7'],
        });
      } catch {}
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const isWin = type === 'win';
  const isNewRecord = isWin && (bestTime === null || finalTime <= bestTime);

  return (
    <div
      id="overlay"
      className="fixed inset-0 grid place-items-center bg-[#0f172a]/50 p-4 z-40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="panel"
        className="w-[min(440px,100%)] bg-[#ffffff] border-4 border-white/95 rounded-[30px] p-6 sm:p-9 text-center shadow-[0_20px_70px_rgba(15,23,42,0.3)] flex flex-col items-center"
      >
        {/* Emoji Icon */}
        <div className="text-5xl sm:text-6xl mb-2.5 animate-bounce-gentle select-none">
          {isWin ? '🏆🌈' : '🪐✨'}
        </div>

        {/* Title */}
        <h1 className="my-1.5 text-3xl sm:text-4xl font-black leading-tight tracking-tight text-[#0f172a]">
          {isWin ? (
            <>
              Portal Pals
              <br />
              Champion!
            </>
          ) : (
            <>
              Find your
              <br />
              sky-high sparkle.
            </>
          )}
        </h1>

        {/* Simple, uncrowded description */}
        <p className="my-3 text-sm sm:text-base leading-relaxed text-[#475569] font-semibold max-w-xs">
          {isWin ? (
            <>
              You collected all 10 star gems in{' '}
              <span className="font-black text-[#ff6fae]">{finalTime}s</span>!
              {isNewRecord && (
                <span className="block mt-1 font-bold text-emerald-600">🎉 New personal best!</span>
              )}
            </>
          ) : (
            'Leap across floating platforms, collect all 10 star gems, and reach the glowing portal.'
          )}
        </p>

        {/* Primary CTA Button */}
        <button
          onClick={onPlay}
          className="btn-game btn-primary w-full py-3.5 text-base sm:text-lg font-black tracking-wide flex items-center justify-center gap-2 mt-2 shadow-lg"
        >
          {isWin ? <RotateCcw size={20} /> : <Play size={20} className="fill-white" />}
          <span>{isWin ? 'Play again' : "Let's explore!"}</span>
        </button>

        {/* Clean footer */}
        <p className="text-xs font-bold text-[#64748b]/80 mt-3.5 mb-0">
          Play with keyboard or touch
        </p>
      </div>
    </div>
  );
};
