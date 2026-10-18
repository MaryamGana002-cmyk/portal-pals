import React, { useCallback } from 'react';

interface TouchControlsProps {
  visible: boolean;
  activeTouchKeys: Set<string>;
  onPressKey: (key: string) => void;
  onReleaseKey: (key: string) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  visible,
  activeTouchKeys,
  onPressKey,
  onReleaseKey,
}) => {
  if (!visible) return null;

  const handlePointerDown = useCallback(
    (key: string, e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      onPressKey(key);
    },
    [onPressKey]
  );

  const handlePointerUp = useCallback(
    (key: string, e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {}
      onReleaseKey(key);
    },
    [onReleaseKey]
  );

  const isKeyActive = (key: string) => activeTouchKeys.has(key);

  const getBtnClass = (key: string) => {
    const active = isKeyActive(key);
    return `w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl select-none transition-all duration-75 shadow-lg active:scale-90 ${
      active
        ? 'bg-[#ff6fae] text-white border-2 border-white scale-95 shadow-[#ff6fae]/50'
        : 'bg-white/95 text-[#0f172a] border-2 border-white hover:bg-white shadow-slate-900/15'
    }`;
  };

  return (
    <div
      className="fixed inset-x-0 bottom-3 sm:bottom-5 px-3 sm:px-6 pointer-events-none z-20 flex items-end justify-between select-none"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {/* Left: 4-Way Directional Arrow D-Pad */}
      <div className="pointer-events-auto bg-slate-900/25 p-2 rounded-3xl backdrop-blur-md border border-white/40 shadow-xl">
        <div className="grid grid-cols-3 gap-1.5 w-36 sm:w-42">
          {/* Top Row: empty, UP, empty */}
          <div />
          <button
            type="button"
            onPointerDown={(e) => handlePointerDown('ArrowUp', e)}
            onPointerUp={(e) => handlePointerUp('ArrowUp', e)}
            onPointerCancel={(e) => handlePointerUp('ArrowUp', e)}
            className={getBtnClass('ArrowUp')}
            aria-label="Direction Up"
          >
            ↑
          </button>
          <div />

          {/* Middle Row: LEFT, center indicator, RIGHT */}
          <button
            type="button"
            onPointerDown={(e) => handlePointerDown('ArrowLeft', e)}
            onPointerUp={(e) => handlePointerUp('ArrowLeft', e)}
            onPointerCancel={(e) => handlePointerUp('ArrowLeft', e)}
            className={getBtnClass('ArrowLeft')}
            aria-label="Direction Left"
          >
            ←
          </button>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/40 flex items-center justify-center font-black text-xs text-[#0f172a]/70">
            D-PAD
          </div>
          <button
            type="button"
            onPointerDown={(e) => handlePointerDown('ArrowRight', e)}
            onPointerUp={(e) => handlePointerUp('ArrowRight', e)}
            onPointerCancel={(e) => handlePointerUp('ArrowRight', e)}
            className={getBtnClass('ArrowRight')}
            aria-label="Direction Right"
          >
            →
          </button>

          {/* Bottom Row: empty, DOWN, empty */}
          <div />
          <button
            type="button"
            onPointerDown={(e) => handlePointerDown('ArrowDown', e)}
            onPointerUp={(e) => handlePointerUp('ArrowDown', e)}
            onPointerCancel={(e) => handlePointerUp('ArrowDown', e)}
            className={getBtnClass('ArrowDown')}
            aria-label="Direction Down"
          >
            ↓
          </button>
          <div />
        </div>
      </div>

      {/* Right: Big Jump Button */}
      <div className="pointer-events-auto bg-slate-900/25 p-2 rounded-3xl backdrop-blur-md border border-white/40 shadow-xl">
        <button
          type="button"
          onPointerDown={(e) => handlePointerDown('Space', e)}
          onPointerUp={(e) => handlePointerUp('Space', e)}
          onPointerCancel={(e) => handlePointerUp('Space', e)}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-black select-none transition-all duration-75 shadow-xl active:scale-90 border-3 border-white ${
            isKeyActive('Space')
              ? 'bg-[#10b981] text-white scale-95 shadow-[#10b981]/60'
              : 'bg-gradient-to-tr from-[#ff6fae] to-[#f43f5e] text-white shadow-[#ff6fae]/40'
          }`}
          aria-label="Jump Space"
        >
          <span className="text-2xl sm:text-3xl leading-none">⤒</span>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-0.5">JUMP</span>
        </button>
      </div>
    </div>
  );
};
