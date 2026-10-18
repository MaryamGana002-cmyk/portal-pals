import React, { useRef, useEffect } from 'react';
import { CharacterStyle, PlayerData } from '../types';
import {
  SKIN_COLORS,
  PRIMARY_COLORS,
  SECONDARY_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  HATS,
  ACCESSORIES,
} from '../constants';
import { X, Check } from 'lucide-react';

interface CustomizerModalProps {
  isOpen: boolean;
  playerData: PlayerData;
  onClose: () => void;
  onSave: (updated: PlayerData) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  playerData,
  onClose,
  onSave,
}) => {
  const [name, setName] = React.useState(playerData.name);
  const [style, setStyle] = React.useState<CharacterStyle>(playerData.style);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(playerData.name);
      setStyle({ ...playerData.style });
    }
  }, [isOpen, playerData]);

  // Live render preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !isOpen) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Save context
    ctx.save();
    ctx.translate(w / 2, h / 2 + 15);
    ctx.scale(2.2, 2.2);

    // Ground shadow
    ctx.fillStyle = '#28405a26';
    ctx.beginPath();
    ctx.ellipse(0, 22, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const skin = style.skinColor || '#c9825b';
    const top = style.primaryColor || '#ff6fae';
    const bottom = style.secondaryColor || '#4b6bdc';
    const hair = style.hairColor || '#33243a';

    // Pants
    ctx.fillStyle = bottom;
    ctx.fillRect(-10, 2, 8, 17);
    ctx.fillRect(2, 2, 8, 17);

    // Shoes
    ctx.fillStyle = '#fff';
    ctx.fillRect(-12, 17, 10, 5);
    ctx.fillRect(2, 17, 10, 5);

    // Torso
    ctx.fillStyle = top;
    ctx.fillRect(-12, -15, 24, 20);

    // Arms
    ctx.fillStyle = skin;
    ctx.fillRect(-15, -13, 4, 12);
    ctx.fillRect(11, -13, 4, 12);

    // Head
    ctx.fillRect(-10, -34, 20, 21);

    // Hair
    ctx.fillStyle = hair;
    const hairstyle = style.hair || 'short';
    if (hairstyle === 'afro') {
      ctx.beginPath();
      ctx.arc(0, -33, 14, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-13, -34, 26, 8);
    } else if (hairstyle === 'bald') {
      // Bald
    } else {
      ctx.fillRect(-11, -38, 22, 7);
      if (hairstyle === 'ponytail' || hairstyle === 'braids' || hairstyle === 'dreads') {
        ctx.fillRect(8, -32, 5, 18);
      }
      if (hairstyle === 'bun') {
        ctx.beginPath();
        ctx.arc(0, -40, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Eyes and smile
    ctx.fillStyle = '#253047';
    ctx.fillRect(-5, -27, 3, 3);
    ctx.fillRect(4, -27, 3, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-5, -20, 10, 2);

    // Hat
    if (style.hat === 'crown') {
      ctx.beginPath();
      const points = [
        { x: -10, y: -38 },
        { x: -7, y: -47 },
        { x: 0, y: -41 },
        { x: 7, y: -47 },
        { x: 10, y: -38 },
      ];
      points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = '#ffd166';
      ctx.fill();
    } else if (style.hat === 'cap' || style.hat === 'beanie') {
      ctx.fillStyle = top;
      ctx.fillRect(-12, -41, 24, 5);
    }

    // Accessories
    if (style.accessory === 'glasses') {
      ctx.strokeStyle = '#253047';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-8, -29, 7, 5);
      ctx.strokeRect(2, -29, 7, 5);
    }
    if (style.accessory === 'backpack') {
      ctx.fillStyle = '#ffcf65';
      ctx.fillRect(-16, -12, 5, 14);
    }

    ctx.restore();
  }, [style, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...playerData,
      name: name.trim() || 'Explorer',
      style,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 grid place-items-center bg-[#17253a]/50 p-4 z-40 backdrop-blur-xs">
      <div className="w-[min(540px,100%)] max-h-[92vh] overflow-y-auto bg-[#fffdf8] border-4 border-white rounded-[28px] p-5 sm:p-7 shadow-2xl flex flex-col gap-4 text-[#182238]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
          <div className="font-black text-xl flex items-center gap-2">
            <span>🎨</span>
            <span>Explorer Customizer</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#182238] font-bold"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview & Name Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100">
          <canvas
            ref={previewCanvasRef}
            width={120}
            height={130}
            className="w-[120px] h-[130px] rounded-xl bg-white/80 shadow-inner"
          />
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Explorer Name
            </label>
            <input
              type="text"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-slate-200 focus:border-[#ff6fae] outline-hidden font-bold text-[#182238] text-sm"
              placeholder="Explorer name..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Customized adventurer look is saved for future sky-island expeditions.
            </p>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-3.5 text-xs sm:text-sm">
          {/* Skin Tone */}
          <div>
            <div className="font-extrabold text-[#0f172a] text-xs sm:text-sm mb-1.5">Skin Tone</div>
            <div className="flex gap-2.5 flex-wrap">
              {SKIN_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setStyle({ ...style, skinColor: c })}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all ${
                    style.skinColor === c ? 'scale-115 border-[#0f172a] shadow-lg ring-2 ring-[#ff6fae]' : 'border-white shadow-xs'
                  }`}
                  aria-label={`Skin color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Shirt / Top Color */}
          <div>
            <div className="font-extrabold text-[#0f172a] text-xs sm:text-sm mb-1.5">Shirt Color</div>
            <div className="flex gap-2.5 flex-wrap">
              {PRIMARY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setStyle({ ...style, primaryColor: c })}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all ${
                    style.primaryColor === c ? 'scale-115 border-[#0f172a] shadow-lg ring-2 ring-[#ff6fae]' : 'border-white shadow-xs'
                  }`}
                  aria-label={`Shirt color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Pants / Bottom Color */}
          <div>
            <div className="font-extrabold text-[#0f172a] text-xs sm:text-sm mb-1.5">Pants Color</div>
            <div className="flex gap-2.5 flex-wrap">
              {SECONDARY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setStyle({ ...style, secondaryColor: c })}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all ${
                    style.secondaryColor === c ? 'scale-115 border-[#0f172a] shadow-lg ring-2 ring-[#ff6fae]' : 'border-white shadow-xs'
                  }`}
                  aria-label={`Pants color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Hairstyle */}
          <div>
            <div className="font-bold text-slate-600 mb-1.5">Hairstyle</div>
            <div className="flex gap-1.5 flex-wrap">
              {HAIR_STYLES.map((h) => (
                <button
                  key={h}
                  onClick={() => setStyle({ ...style, hair: h })}
                  className={`px-3 py-1.5 rounded-xl capitalize font-bold text-xs border transition-all ${
                    style.hair === h
                      ? 'bg-[#ff6fae] text-white border-[#ff6fae] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <div className="font-bold text-slate-600 mb-1.5">Hair Color</div>
            <div className="flex gap-2 flex-wrap">
              {HAIR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setStyle({ ...style, hairColor: c })}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    style.hairColor === c ? 'scale-115 border-[#182238] shadow-md' : 'border-white'
                  }`}
                  aria-label={`Hair color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Hat */}
          <div>
            <div className="font-bold text-slate-600 mb-1.5">Hat / Headwear</div>
            <div className="flex gap-1.5 flex-wrap">
              {HATS.map((hat) => (
                <button
                  key={hat}
                  onClick={() => setStyle({ ...style, hat })}
                  className={`px-3 py-1.5 rounded-xl capitalize font-bold text-xs border transition-all ${
                    style.hat === hat
                      ? 'bg-[#182238] text-white border-[#182238] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {hat === 'none' ? 'No hat' : hat}
                </button>
              ))}
            </div>
          </div>

          {/* Accessory */}
          <div>
            <div className="font-bold text-slate-600 mb-1.5">Accessory</div>
            <div className="flex gap-1.5 flex-wrap">
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc}
                  onClick={() => setStyle({ ...style, accessory: acc })}
                  className={`px-3 py-1.5 rounded-xl capitalize font-bold text-xs border transition-all ${
                    style.accessory === acc
                      ? 'bg-[#182238] text-white border-[#182238] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {acc === 'none' ? 'None' : acc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="btn-game btn-secondary flex-1 py-2.5 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-game btn-primary flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            <span>Save Outfit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
