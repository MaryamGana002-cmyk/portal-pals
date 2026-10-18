import React from 'react';
import { PlayerData, PlayerDirectionInfo } from '../types';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  User,
  Palette,
  Trophy,
  Compass,
  Smartphone,
} from 'lucide-react';

interface HUDProps {
  playerData: PlayerData;
  gems: number;
  totalGems: number;
  time: number;
  bestTime: number | null;
  soundOn: boolean;
  direction: PlayerDirectionInfo;
  showTouchControls: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  onOpenCustomizer: () => void;
  onOpenLeaderboard: () => void;
  onToggleTouchControls: () => void;
  onSignIn?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerData,
  gems,
  totalGems,
  time,
  bestTime,
  soundOn,
  direction,
  showTouchControls,
  onToggleSound,
  onRestart,
  onOpenCustomizer,
  onOpenLeaderboard,
  onToggleTouchControls,
  onSignIn,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none p-2.5 sm:p-4 md:p-6 flex flex-col justify-between z-10 select-none">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        {/* Brand & Explorer Profile */}
        <div className="glass px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col pointer-events-auto border-2 border-white/90 shadow-lg">
          <div className="font-black tracking-tight text-sm sm:text-lg md:text-xl text-[#0f172a] flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl animate-spin-slow">🌀</span>
            <span>PORTAL PALS</span>
          </div>
          <div className="text-[11px] sm:text-xs font-extrabold text-[#334155] mt-0.5 flex items-center gap-1">
            <span className="text-[#ff6fae] font-black">{playerData.name || 'Explorer'}</span>
            <span>·</span>
            <span>Collect {totalGems} star gems</span>
          </div>
        </div>

        {/* Center: Direction Compass Widget */}
        <div className="glass px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 pointer-events-auto border-2 border-white/90 shadow-lg">
          <Compass size={18} className="text-[#3b82f6] animate-pulse" />
          <div className="flex flex-col">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#64748b]">Facing</div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#0f172a]">
              <span className="text-base sm:text-lg text-[#ff6fae]">{direction.arrow}</span>
              <span className="font-extrabold">{direction.label}</span>
            </div>
          </div>
        </div>

        {/* Top Right: Stats (Gems & Time) */}
        <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-end pointer-events-auto">
          {/* Gems counter */}
          <div className="glass px-3 py-1.5 sm:px-3.5 sm:py-2 font-black text-xs sm:text-sm text-[#0f172a] flex items-center gap-1.5 border-2 border-white/90 shadow-md">
            <span className="text-base">⭐</span>
            <div>
              <span className="text-[#ff6fae] font-black text-sm sm:text-base">{gems}</span>
              <span className="text-[#64748b]">/{totalGems}</span>
            </div>
          </div>

          {/* Time counter */}
          <div className="glass px-3 py-1.5 sm:px-3.5 sm:py-2 font-black text-xs sm:text-sm text-[#0f172a] flex items-center gap-1.5 border-2 border-white/90 shadow-md">
            <span className="text-base">⏱️</span>
            <span className="text-[#0f172a] font-black text-sm sm:text-base">{time}s</span>
          </div>

          {/* Best record badge */}
          {bestTime !== null && (
            <div className="glass hidden md:flex px-3 py-1.5 font-black text-xs sm:text-sm text-[#0f172a] items-center gap-1.5 border-2 border-white/90 shadow-md">
              <span className="text-base">🏆</span>
              <span className="text-[#2563eb]">{bestTime}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-end justify-between gap-2 sm:gap-3 flex-wrap">
        {/* Help Glass Card */}
        <div className="glass px-3.5 py-2.5 max-w-[240px] sm:max-w-xs md:max-w-sm text-[11px] sm:text-xs md:text-[13px] leading-relaxed font-bold text-[#0f172a] pointer-events-auto border-2 border-white/90 shadow-lg">
          <div>
            Move: <b className="text-[#0f172a]">WASD</b> / <b className="text-[#0f172a]">arrows</b> · Jump: <b className="text-[#0f172a]">Space</b>
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#475569] mt-1 pt-1 border-t border-slate-200">
            Find all {totalGems} star gems, leap across the platforms, and reach the glowing portal! Falling between platforms restarts.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 sm:gap-2 pointer-events-auto flex-wrap justify-end">
          {onSignIn && !playerData.account && (
            <button
              onClick={onSignIn}
              className="btn-game btn-secondary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-2.5 sm:px-3.5 text-[#0f172a] font-black shadow-md border border-slate-200"
              title="Sign in with start.ng"
            >
              <User size={16} className="text-[#ff6fae]" />
              <span className="hidden xs:inline">Sign in</span>
            </button>
          )}

          {/* Touch controls toggle for all devices */}
          <button
            onClick={onToggleTouchControls}
            className={`btn-game flex items-center gap-1.5 text-xs sm:text-sm py-2 px-2.5 sm:px-3.5 font-black shadow-md border ${
              showTouchControls
                ? 'bg-[#182238] text-white border-[#182238]'
                : 'btn-secondary text-[#0f172a] border-slate-200'
            }`}
            title="Toggle On-Screen Touch Controls"
          >
            <Smartphone size={16} className={showTouchControls ? 'text-[#8df0c7]' : 'text-slate-500'} />
            <span className="hidden sm:inline">Touch D-Pad</span>
          </button>

          <button
            onClick={onOpenCustomizer}
            className="btn-game btn-secondary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-2.5 sm:px-3.5 text-[#0f172a] font-black shadow-md border border-slate-200"
            title="Customize Explorer Outfit"
          >
            <Palette size={16} className="text-[#8b5cf6]" />
            <span className="hidden sm:inline">Outfit</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="btn-game btn-secondary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-2.5 sm:px-3.5 text-[#0f172a] font-black shadow-md border border-slate-200"
            title="View High Scores"
          >
            <Trophy size={16} className="text-[#f59e0b]" />
            <span className="hidden sm:inline">Records</span>
          </button>

          <button
            onClick={onRestart}
            className="btn-game btn-secondary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-2.5 sm:px-3.5 text-[#0f172a] font-black shadow-md border border-slate-200"
            title="Restart Level"
          >
            <RotateCcw size={16} className="text-[#2563eb]" />
            <span>Restart</span>
          </button>

          <button
            onClick={onToggleSound}
            className="btn-game btn-primary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-2.5 sm:px-3.5 font-black shadow-md"
            title="Toggle Sound Effects"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Sound: {soundOn ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
