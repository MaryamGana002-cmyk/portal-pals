export interface CharacterStyle {
  body: string;
  primaryColor: string;
  secondaryColor: string;
  skinColor: string;
  hairColor: string;
  hair: 'short' | 'afro' | 'bald' | 'ponytail' | 'braids' | 'dreads' | 'bun' | string;
  hat: 'none' | 'crown' | 'cap' | 'beanie' | string;
  accessory: 'none' | 'glasses' | 'backpack' | string;
}

export interface PlayerData {
  id?: string;
  name: string;
  account?: string | null;
  style: CharacterStyle;
}

export interface Island {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  c: string;
}

export interface Gem {
  id: number;
  x: number;
  y: number;
  z: number;
  got: boolean;
  phase: number;
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  c: string;
}

export interface Portal {
  x: number;
  z: number;
  y: number;
}

export interface PlayerDirectionInfo {
  dx: number;
  dz: number;
  label: string;
  arrow: string;
  angleDeg: number;
}

export interface GameState {
  started: boolean;
  won: boolean;
  collectedGems: number;
  elapsedTime: number;
  soundOn: boolean;
  playerData: PlayerData;
}

export interface ScoreRecord {
  id: string;
  playerName: string;
  timeSeconds: number;
  gems: number;
  date: string;
}
