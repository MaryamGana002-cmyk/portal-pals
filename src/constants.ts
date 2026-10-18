import { CharacterStyle, Island } from './types';

export const ISLANDS: Island[] = [
  { x: 0, z: 0, w: 240, d: 190, h: 0, c: '#77dba9' },
  { x: 210, z: -100, w: 115, d: 100, h: 42, c: '#8ce6b8' },
  { x: 370, z: -20, w: 120, d: 115, h: 74, c: '#73d8a8' },
  { x: 510, z: 90, w: 145, d: 130, h: 105, c: '#8ce6b8' },
  { x: 650, z: -15, w: 125, d: 120, h: 137, c: '#75d7a7' },
  { x: 810, z: -100, w: 190, d: 170, h: 165, c: '#8ce6b8' },
];

export const GEM_SPOTS: [number, number][] = [
  [-65, -50],
  [45, -55],
  [60, 45],
  [215, -105],
  [370, -30],
  [390, 5],
  [510, 65],
  [535, 110],
  [650, -20],
  [825, -100],
];

export const PORTAL_POS = { x: 850, z: -110, y: 174 };

export const PLAYER_START = {
  x: -25,
  y: 8,
  z: 0,
};

export const TOTAL_GEMS = 10;

export const DEFAULT_STYLE: CharacterStyle = {
  body: 'female',
  primaryColor: '#ff6fae',
  secondaryColor: '#4b6bdc',
  skinColor: '#c9825b',
  hairColor: '#33243a',
  hair: 'ponytail',
  hat: 'none',
  accessory: 'none',
};

export const SKIN_COLORS = ['#c9825b', '#e0ac69', '#f1c27d', '#8d5524', '#ffdbac', '#5a3d28'];
export const PRIMARY_COLORS = ['#ff6fae', '#4b6bdc', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
export const SECONDARY_COLORS = ['#4b6bdc', '#1e293b', '#047857', '#b45309', '#6d28d9', '#be185d', '#0284c7'];
export const HAIR_COLORS = ['#33243a', '#1e293b', '#d97706', '#92400e', '#e2e8f0', '#7c2d12', '#b91c1c'];
export const HAIR_STYLES = ['ponytail', 'short', 'afro', 'bun', 'braids', 'dreads', 'bald'] as const;
export const HATS = ['none', 'crown', 'cap', 'beanie'] as const;
export const ACCESSORIES = ['none', 'glasses', 'backpack'] as const;
