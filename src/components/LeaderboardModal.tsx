import React from 'react';
import { ScoreRecord } from '../types';
import { Trophy, Clock, Star, X, Medal } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  scores: ScoreRecord[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  scores,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 grid place-items-center bg-[#17253a]/50 p-4 z-40 backdrop-blur-xs">
      <div className="w-[min(480px,100%)] max-h-[90vh] bg-[#fffdf8] border-4 border-white rounded-[28px] p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-[#182238]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="font-black text-xl flex items-center gap-2">
            <Trophy className="text-[#ffd166]" size={24} />
            <span>Sky Islands Records</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#182238] font-bold"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-500 -mt-1 leading-relaxed">
          Leaderboard ranked by lowest completion time (10 gems collected). Verified according to start.ng format.
        </p>

        {/* Scores List */}
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-bold text-sm bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              No runs completed yet! Reach the glowing portal with 10 star gems to record your score.
            </div>
          ) : (
            scores.map((record, index) => {
              const medalColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm w-6 text-center text-slate-400 flex items-center justify-center">
                      {index < 3 ? <Medal size={18} className={medalColors[index]} /> : `#${index + 1}`}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm text-[#182238]">{record.playerName}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">{record.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 font-bold text-xs text-pink-500 bg-pink-50 px-2 py-0.5 rounded-lg">
                      <Star size={12} className="fill-pink-500" />
                      <span>{record.gems}/10</span>
                    </div>
                    <div className="flex items-center gap-1 font-black text-sm text-[#182238] bg-slate-100 px-2.5 py-1 rounded-xl min-w-[55px] justify-center">
                      <Clock size={13} className="text-slate-500" />
                      <span>{record.timeSeconds}s</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-game btn-primary w-full py-3 mt-1 font-bold text-sm tracking-wide"
        >
          Close Records
        </button>
      </div>
    </div>
  );
};
