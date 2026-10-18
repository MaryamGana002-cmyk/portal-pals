# Portal Pals (React Edition)

A 2.5D isometric platform exploration game rewritten in **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. Collect 10 star gems across floating islands in the sky, leap across platform chasms, and reach the glowing portal.

## Features
- **2.5D Isometric Engine**: Custom high-DPR canvas renderer with camera tracking, terrain layering, drifting clouds, distant sky islands, harmonic gem bobbing, and particle sparkle effects.
- **Character Customizer**: Live interactive customizer supporting skin tone, shirt color, pants color, hair style, hair color, hats (crown, beanie, cap), and accessories (glasses, backpack).
- **start.ng Identity & Handshake**: Automatic handshake iframe communication (`startng:whoami` and `startng:score`) for account character syncing and leaderboard score publishing.
- **Local & Online Leaderboard**: Tracks lowest completion times and star gems collected, adhering to the `startng.json` schema.
- **Responsive Controls**: Full keyboard support (`WASD` / arrow keys + `Space` to jump) and on-screen touch D-pad & jump buttons for mobile and touch devices.
- **Web Audio Sound Effects**: Dynamic procedural sound synthesizer with rising pitches for gem pickups, jump audio, victory fanfare, fall sfx, and mute toggle.

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 + Glassmorphism HUD
- **Animation & Effects**: Canvas 2D + Canvas Confetti
- **Icons**: Lucide React

## Development & Build
- `npm run dev` — Run development server on port 3000
- `npm run build` — Typecheck and build production bundle
