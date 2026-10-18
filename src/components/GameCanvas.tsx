import React, { useEffect, useRef, useCallback } from 'react';
import { ISLANDS, PORTAL_POS, GEM_SPOTS, PLAYER_START, TOTAL_GEMS } from '../constants';
import { Gem, Particle, PlayerData, PlayerDirectionInfo } from '../types';
import { playGemSound, playJumpSound, playWinSound, playFallSound } from '../audio';

interface GameCanvasProps {
  started: boolean;
  won: boolean;
  soundOn: boolean;
  playerData: PlayerData;
  activeTouchKeys: Set<string>;
  onGemCollected: (count: number) => void;
  onTimeUpdate: (seconds: number) => void;
  onWin: (finalTime: number) => void;
  onToast: (message: string) => void;
  onDirectionChange?: (info: PlayerDirectionInfo) => void;
  resetSignal: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  started,
  won,
  soundOn,
  playerData,
  activeTouchKeys,
  onGemCollected,
  onTimeUpdate,
  onWin,
  onToast,
  onDirectionChange,
  resetSignal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game internal mutable state across frames
  const stateRef = useRef({
    player: {
      x: PLAYER_START.x,
      y: PLAYER_START.y,
      z: PLAYER_START.z,
      vx: 0,
      vy: 0,
      vz: 0,
      onGround: true,
      facingX: 1,
      facingZ: 0,
      isFalling: false,
    },
    world: { x: 0, z: 0 },
    gems: [] as Gem[],
    particles: [] as Particle[],
    collected: 0,
    elapsed: 0,
    lastTime: 0,
    keys: new Set<string>(),
    currentDir: {
      dx: 1,
      dz: 0,
      label: 'RIGHT',
      arrow: '→',
      angleDeg: 0,
    } as PlayerDirectionInfo,
  });

  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  const startedRef = useRef(started);
  startedRef.current = started;

  const wonRef = useRef(won);
  wonRef.current = won;

  const playerDataRef = useRef(playerData);
  playerDataRef.current = playerData;

  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  const burst = useCallback((x: number, y: number, z: number, customColors?: string[], count = 14) => {
    const s = stateRef.current;
    const colors = customColors || ['#ff70b5', '#ffe16b', '#ffffff', '#8df0c7'];
    for (let i = 0; i < count; i++) {
      s.particles.push({
        x,
        y,
        z,
        vx: rand(-60, 60),
        vy: rand(25, 90),
        vz: rand(-50, 50),
        life: 1.0,
        c: colors[i % colors.length],
      });
    }
  }, []);

  const initLevel = useCallback(() => {
    const s = stateRef.current;
    s.gems = GEM_SPOTS.map((p, i) => {
      const matchIsland =
        ISLANDS.find((a) => Math.abs(a.x - p[0]) < a.w / 2 + 10 && Math.abs(a.z - p[1]) < a.d / 2 + 10) ||
        ISLANDS[0];
      return {
        id: i,
        x: p[0],
        z: p[1],
        y: matchIsland.h + 20,
        got: false,
        phase: i,
      };
    });
    s.particles = [];
    s.world = { x: 0, z: 0 };
    s.player = {
      x: PLAYER_START.x,
      y: PLAYER_START.y,
      z: PLAYER_START.z,
      vx: 0,
      vy: 0,
      vz: 0,
      onGround: true,
      facingX: 1,
      facingZ: 0,
      isFalling: false,
    };
    s.collected = 0;
    s.elapsed = 0;
    s.lastTime = performance.now();
    s.currentDir = {
      dx: 1,
      dz: 0,
      label: 'RIGHT',
      arrow: '→',
      angleDeg: 0,
    };
    onDirectionChange?.(s.currentDir);
    onGemCollected(0);
    onTimeUpdate(0);
  }, [onGemCollected, onTimeUpdate, onDirectionChange]);

  // Re-init on reset signal
  useEffect(() => {
    initLevel();
  }, [resetSignal, initLevel]);

  // Setup keyboard input listeners
  useEffect(() => {
    const s = stateRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(e.key)) {
        e.preventDefault();
      }
      s.keys.add(e.code === 'Space' ? 'Space' : e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        s.keys.add(e.key.toLowerCase());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      s.keys.delete(e.key);
      s.keys.delete(e.key.toLowerCase());
      s.keys.delete(e.code);
      if (e.code === 'Space') {
        s.keys.delete('Space');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main canvas render & physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', resize);
    resize();

    // 2.5D Isometric projection with phone portrait and tablet/desktop scaling
    function project(x: number, y: number, z: number) {
      const s = stateRef.current;
      const isPortrait = H > W;
      const baseScale = isPortrait
        ? Math.min(W / 560, H / 820) * 0.95
        : Math.min(W / 920, H / 620) * 0.96;

      const centerYOffset = isPortrait ? H * 0.46 : H * 0.54;

      return {
        x: W * 0.5 + (x - s.world.x) * baseScale + (z - s.world.z) * baseScale * 0.35,
        y: centerYOffset + (z - s.world.z) * baseScale * 0.32 - y * baseScale - (x - s.world.x) * baseScale * 0.13,
        scale: baseScale,
      };
    }

    function poly(points: { x: number; y: number }[], fill: string, stroke?: string, strokeWidth = 2) {
      if (!ctx) return;
      ctx.beginPath();
      points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    }

    function drawCloud(x: number, y: number, s: number) {
      if (!ctx) return;
      ctx.fillStyle = '#ffffffc0';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 1.1, s * 0.32, 0, 0, Math.PI * 2);
      ctx.ellipse(x - s * 0.35, y - s * 0.12, s * 0.42, s * 0.34, 0, 0, Math.PI * 2);
      ctx.ellipse(x + s * 0.05, y - s * 0.25, s * 0.48, s * 0.48, 0, 0, Math.PI * 2);
      ctx.ellipse(x + s * 0.43, y - s * 0.08, s * 0.36, s * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawBackground() {
      if (!ctx) return;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#59c7ff');
      g.addColorStop(0.55, '#c0f2ff');
      g.addColorStop(1, '#ffeed4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Sun
      ctx.fillStyle = '#fff4a8';
      ctx.beginPath();
      ctx.arc(W * 0.78, H * 0.18, 38, 0, Math.PI * 2);
      ctx.fill();

      // Outer corona
      ctx.fillStyle = '#ffffff35';
      ctx.beginPath();
      ctx.arc(W * 0.78, H * 0.18, 56, 0, Math.PI * 2);
      ctx.fill();

      // Clouds
      for (let i = 0; i < 8; i++) {
        const x = ((i * 197 + performance.now() * 0.008) % (W + 200)) - 100;
        drawCloud(x, 70 + (i % 4) * 75, 38 + (i % 3) * 13);
      }

      // Distant islands
      for (let i = 0; i < 7; i++) {
        const x = (i * 179 + 40) % W;
        const y = H * 0.62 + (i % 3) * 36;
        ctx.fillStyle = '#72cbb6bb';
        ctx.beginPath();
        ctx.ellipse(x, y, 62, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d3b7a2bb';
        ctx.beginPath();
        ctx.moveTo(x - 40, y + 5);
        ctx.lineTo(x + 40, y + 5);
        ctx.lineTo(x + 10, y + 42);
        ctx.lineTo(x - 16, y + 30);
        ctx.closePath();
        ctx.fill();
      }
    }

    function drawIsland(a: (typeof ISLANDS)[0]) {
      const p = project(a.x, a.h, a.z);
      const s = p.scale;
      const w = a.w * s * 0.5;
      const d = a.d * s * 0.5;

      const top = [
        { x: p.x - w, y: p.y - d * 0.35 },
        { x: p.x, y: p.y - d },
        { x: p.x + w, y: p.y - d * 0.35 },
        { x: p.x, y: p.y + d * 0.4 },
      ];

      // Dirt cliffs
      poly(
        [
          { x: top[0].x, y: top[0].y },
          { x: top[3].x, y: top[3].y },
          { x: top[3].x + 3, y: top[3].y + 24 * s },
          { x: top[0].x + 3, y: top[0].y + 24 * s },
        ],
        '#b88b80',
        '#9e6b60'
      );
      poly(
        [
          { x: top[3].x, y: top[3].y },
          { x: top[2].x, y: top[2].y },
          { x: top[2].x - 3, y: top[2].y + 24 * s },
          { x: top[3].x + 3, y: top[3].y + 24 * s },
        ],
        '#a87b75',
        '#8e615b'
      );

      // Lush grass top
      poly(top, a.c, '#3aa67b', 2.5);

      // Inner lighter lawn highlight
      poly(
        [
          { x: p.x - w * 0.7, y: p.y - d * 0.3 },
          { x: p.x, y: p.y - d * 0.72 },
          { x: p.x + w * 0.68, y: p.y - d * 0.3 },
          { x: p.x, y: p.y + d * 0.05 },
        ],
        '#a6f0c6'
      );

      // Wildflowers
      if (ctx) {
        for (let i = 0; i < Math.floor(a.w / 55); i++) {
          const fx = p.x + (i - a.w / 110) * w * 0.55;
          const fy = p.y - 8 * s + Math.sin(i * 4) * 4 * s;
          ctx.fillStyle = ['#ff82b2', '#ffd166', '#ffffff'][i % 3];
          ctx.beginPath();
          ctx.arc(fx, fy, 3.2 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function drawGem(g: Gem) {
      if (g.got || !ctx) return;
      const sState = stateRef.current;
      const p = project(g.x, g.y + Math.sin(sState.elapsed * 4 + g.phase) * 4, g.z);
      const s = p.scale;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.sin(sState.elapsed * 2 + g.phase) * 0.12);
      ctx.shadowColor = '#fff3a0';
      ctx.shadowBlur = 14 * s;

      // Outer star gem
      poly(
        [
          { x: 0, y: -12 * s },
          { x: 9 * s, y: -2 * s },
          { x: 5 * s, y: 10 * s },
          { x: -5 * s, y: 10 * s },
          { x: -9 * s, y: -2 * s },
        ],
        '#ffcc4d',
        '#fff6c6'
      );

      ctx.shadowBlur = 0;
      // Inner facet
      poly(
        [
          { x: 0, y: -8 * s },
          { x: 5 * s, y: -2 * s },
          { x: 0, y: 7 * s },
        ],
        '#fff4a4'
      );
      ctx.restore();
    }

    function drawPortal() {
      if (!ctx) return;
      const sState = stateRef.current;
      const p = project(PORTAL_POS.x, 174, PORTAL_POS.z);
      const s = p.scale;
      const isReady = sState.collected === TOTAL_GEMS;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.strokeStyle = isReady ? '#ff65bd' : '#7c91a8';
      ctx.lineWidth = 7 * s;
      ctx.shadowColor = isReady ? '#ff65bd' : 'transparent';
      ctx.shadowBlur = 22 * s;

      ctx.beginPath();
      ctx.ellipse(0, 0, 24 * s, 36 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = isReady ? '#e7a4ff99' : '#75899b66';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18 * s, 30 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing core
      if (isReady) {
        ctx.fillStyle = '#ffffffcc';
        const pulse = 1 + Math.sin(sState.elapsed * 6) * 0.15;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8 * s * pulse, 15 * s * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Render character and directional arrow indicators
    function drawPlayer() {
      if (!ctx) return;
      const sState = stateRef.current;
      const player = sState.player;
      const p = project(player.x, player.y + 18, player.z);
      const s = p.scale;
      const st = playerDataRef.current?.style || {};

      const skin = st.skinColor || '#c9825b';
      const top = st.primaryColor || '#ff6fae';
      const bottom = st.secondaryColor || '#4b6bdc';
      const hair = st.hairColor || '#33243a';

      // 1. DIRECTION ARROW ON THE PLATFORM SURFACE (UNDER FEET)
      const groundPos = project(player.x, player.y, player.z);
      ctx.save();
      ctx.translate(groundPos.x, groundPos.y);

      // Compute visual angle on 2D isometric plane
      const dirDx = sState.currentDir.dx;
      const dirDz = sState.currentDir.dz;

      const pTip = project(player.x + dirDx * 30, player.y, player.z + dirDz * 30);
      const angleOnScreen = Math.atan2(pTip.y - groundPos.y, pTip.x - groundPos.x);

      // Rotating directional arrow with pulsating glow
      ctx.rotate(angleOnScreen);
      const arrowPulse = 1 + Math.sin(sState.elapsed * 8) * 0.12;
      ctx.scale(s * arrowPulse, s * arrowPulse);

      // Glow halo
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 10;

      // Draw sharp directional arrow chevron
      ctx.fillStyle = '#ff6fae';
      ctx.beginPath();
      ctx.moveTo(22, 0); // Tip
      ctx.lineTo(8, -8);
      ctx.lineTo(11, -3);
      ctx.lineTo(-4, -3);
      ctx.lineTo(-4, 3);
      ctx.lineTo(11, 3);
      ctx.lineTo(8, 8);
      ctx.closePath();
      ctx.fill();

      // Bright inner core
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(10, -5);
      ctx.lineTo(12, -2);
      ctx.lineTo(0, -2);
      ctx.lineTo(0, 2);
      ctx.lineTo(12, 2);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // 2. DRAW CHARACTER
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(s, s);

      // If falling off platform into the gap, tumble
      if (player.isFalling) {
        ctx.rotate(Math.sin(sState.elapsed * 10) * 0.35);
      }

      if (player.facingX < 0) {
        ctx.scale(-1, 1);
      }

      // Ground shadow
      ctx.fillStyle = '#28405a33';
      ctx.beginPath();
      ctx.ellipse(0, 22, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs / Pants
      ctx.fillStyle = bottom;
      ctx.fillRect(-10, 2, 8, 17);
      ctx.fillRect(2, 2, 8, 17);

      // Shoes
      ctx.fillStyle = '#fff';
      ctx.fillRect(-12, 17, 10, 5);
      ctx.fillRect(2, 17, 10, 5);

      // Torso / Shirt
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
      const hairstyle = st.hair || 'short';
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

      // Eyes & smile when facing camera
      if (player.facingZ >= 0) {
        ctx.fillStyle = '#253047';
        ctx.fillRect(-5, -27, 3, 3);
        ctx.fillRect(4, -27, 3, 3);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-5, -20, 10, 2);
      }

      // Hat
      if (st.hat === 'crown') {
        ctx.fillStyle = '#ffd166';
        poly(
          [
            { x: -10, y: -38 },
            { x: -7, y: -47 },
            { x: 0, y: -41 },
            { x: 7, y: -47 },
            { x: 10, y: -38 },
          ],
          '#ffd166'
        );
      } else if (st.hat === 'cap' || st.hat === 'beanie') {
        ctx.fillStyle = top;
        ctx.fillRect(-12, -41, 24, 5);
      }

      // Accessories
      if (st.accessory === 'glasses') {
        ctx.strokeStyle = '#253047';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-8, -29, 7, 5);
        ctx.strokeRect(2, -29, 7, 5);
      }
      if (st.accessory === 'backpack') {
        ctx.fillStyle = '#ffcf65';
        ctx.fillRect(-16, -12, 5, 14);
      }

      // 3. OVERHEAD FLOATING DIRECTION BADGE
      ctx.save();
      if (player.facingX < 0) {
        ctx.scale(-1, 1);
      }
      const dirArrow = sState.currentDir.arrow;
      const dirText = sState.currentDir.label;

      ctx.fillStyle = 'rgba(24, 34, 56, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-24, -62, 48, 18, 9);
      ctx.fill();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${dirArrow} ${dirText}`, 0, -53);
      ctx.restore();

      ctx.restore();
    }

    function render() {
      if (!ctx) return;
      drawBackground();

      // Sort islands back to front
      const ordered = [...ISLANDS].sort((a, b) => a.z - b.z);
      ordered.forEach(drawIsland);

      drawPortal();

      const sState = stateRef.current;
      sState.gems.forEach(drawGem);
      drawPlayer();

      // Particles
      sState.particles.forEach((p) => {
        const q = project(p.x, p.y, p.z);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 3 * q.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    function update(dt: number) {
      const s = stateRef.current;
      if (!startedRef.current || wonRef.current) return;

      s.elapsed += dt;
      onTimeUpdate(Math.floor(s.elapsed));

      let ax = 0;
      let az = 0;

      // Combine keyboard and touch keys
      const combinedKeys = new Set([...s.keys, ...activeTouchKeys]);

      if (combinedKeys.has('ArrowLeft') || combinedKeys.has('a')) ax--;
      if (combinedKeys.has('ArrowRight') || combinedKeys.has('d')) ax++;
      if (combinedKeys.has('ArrowUp') || combinedKeys.has('w')) az--;
      if (combinedKeys.has('ArrowDown') || combinedKeys.has('s')) az++;

      // Update character movement & facing direction
      if (ax !== 0) s.player.facingX = ax;
      if (az !== 0) s.player.facingZ = az;

      // Calculate directional arrow representation
      let label = 'IDLE';
      let arrow = '→';
      let angleDeg = 0;

      const curX = ax !== 0 ? ax : s.player.facingX;
      const curZ = az !== 0 ? az : s.player.facingZ;

      if (curX > 0 && curZ === 0) {
        label = 'RIGHT';
        arrow = '→';
        angleDeg = 0;
      } else if (curX < 0 && curZ === 0) {
        label = 'LEFT';
        arrow = '←';
        angleDeg = 180;
      } else if (curZ < 0 && curX === 0) {
        label = 'UP';
        arrow = '↑';
        angleDeg = -90;
      } else if (curZ > 0 && curX === 0) {
        label = 'DOWN';
        arrow = '↓';
        angleDeg = 90;
      } else if (curX > 0 && curZ < 0) {
        label = 'UP-RIGHT';
        arrow = '↗';
        angleDeg = -45;
      } else if (curX < 0 && curZ < 0) {
        label = 'UP-LEFT';
        arrow = '↖';
        angleDeg = -135;
      } else if (curX > 0 && curZ > 0) {
        label = 'DOWN-RIGHT';
        arrow = '↘';
        angleDeg = 45;
      } else if (curX < 0 && curZ > 0) {
        label = 'DOWN-LEFT';
        arrow = '↙';
        angleDeg = 135;
      }

      if (s.currentDir.arrow !== arrow || s.currentDir.label !== label) {
        s.currentDir = { dx: curX, dz: curZ, label, arrow, angleDeg };
        onDirectionChange?.(s.currentDir);
      }

      const len = Math.hypot(ax, az) || 1;
      s.player.vx += ((ax / len) * 170 - s.player.vx) * Math.min(1, dt * 7);
      s.player.vz += ((az / len) * 150 - s.player.vz) * Math.min(1, dt * 7);

      if (!ax) s.player.vx *= Math.max(0, 1 - dt * 5);
      if (!az) s.player.vz *= Math.max(0, 1 - dt * 5);

      s.player.x += s.player.vx * dt;
      s.player.z += s.player.vz * dt;

      // Jump
      if (
        (combinedKeys.has('Space') || (combinedKeys.has('ArrowUp') && combinedKeys.has('Shift'))) &&
        s.player.onGround
      ) {
        s.player.vy = 270;
        s.player.onGround = false;
        s.keys.delete('Space');
        playJumpSound(soundRef.current);
      }

      // Vertical gravity & platform collision
      const previousY = s.player.y;
      s.player.vy -= 420 * dt;
      s.player.y += s.player.vy * dt;

      // Determine if player is above any safe platform
      let ground: number | null = null;
      for (const a of ISLANDS) {
        if (Math.abs(s.player.x - a.x) < a.w / 2 - 7 && Math.abs(s.player.z - a.z) < a.d / 2 - 7) {
          ground = ground === null ? a.h : Math.max(ground, a.h);
        }
      }

      if (ground !== null && previousY >= ground && s.player.y <= ground) {
        s.player.y = ground;
        s.player.vy = 0;
        s.player.onGround = true;
        s.player.isFalling = false;
      } else {
        s.player.onGround = false;
        // If below platforms with no ground, player is falling in-between safe spaces
        if (ground === null && s.player.y < -15 && !s.player.isFalling) {
          s.player.isFalling = true;
          playFallSound(soundRef.current);
        }
      }

      // When player falls in-between the platforms/safe spaces into the abyss:
      // "when the character move inbetween [safe spaces] it should fall and restart"
      if (s.player.y < -90) {
        s.player.x = PLAYER_START.x;
        s.player.z = PLAYER_START.z;
        s.player.y = PLAYER_START.y;
        s.player.vx = 0;
        s.player.vy = 0;
        s.player.vz = 0;
        s.player.onGround = true;
        s.player.isFalling = false;
        s.world.x = 0;
        s.world.z = 0;
        onToast('Fell between platforms! Restarted on the first island.');
      }

      // Star gem collection
      for (const g of s.gems) {
        if (!g.got && Math.hypot(s.player.x - g.x, s.player.z - g.z) < 38 && Math.abs(s.player.y + 18 - g.y) < 65) {
          g.got = true;
          s.collected++;
          onGemCollected(s.collected);
          burst(g.x, g.y, g.z);
          playGemSound(s.collected, soundRef.current);

          if (s.collected === TOTAL_GEMS) {
            onToast('All 10 gems found! Reach the glowing portal!');
          } else {
            onToast(`Star gem collected! (${s.collected}/${TOTAL_GEMS})`);
          }
        }
      }

      // Portal entry condition
      if (
        Math.hypot(s.player.x - PORTAL_POS.x, s.player.z - PORTAL_POS.z) < 35 &&
        s.collected === TOTAL_GEMS &&
        Math.abs(s.player.y - 165) < 65
      ) {
        wonRef.current = true;
        burst(PORTAL_POS.x, 174, PORTAL_POS.z);
        playWinSound(soundRef.current);
        onWin(Math.floor(s.elapsed));
      }

      // Camera smooth follow
      s.world.x += (s.player.x - s.world.x) * Math.min(1, dt * 2.2);
      s.world.z += (s.player.z - s.world.z) * Math.min(1, dt * 2.2);

      // Particle update
      s.particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vy -= 100 * dt;
        p.life -= dt;
      });
      s.particles = s.particles.filter((p) => p.life > 0);
    }

    function loop(t: number) {
      const s = stateRef.current;
      const dt = Math.min(0.035, (t - (s.lastTime || t)) / 1000);
      s.lastTime = t;

      update(dt);
      render();
      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [burst, activeTouchKeys, onGemCollected, onTimeUpdate, onWin, onToast, onDirectionChange]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Portal Pals game canvas"
      className="w-full h-full block cursor-grab active:cursor-grabbing select-none"
    />
  );
};
