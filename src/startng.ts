import { DEFAULT_STYLE } from './constants';
import { PlayerData, ScoreRecord } from './types';

let connectPromise: Promise<HTMLIFrameElement> | null = null;

function getConnectFrame(): Promise<HTMLIFrameElement> {
  if (!connectPromise) {
    connectPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('SSR'));
      const existing = document.querySelector<HTMLIFrameElement>('#startng-frame');
      if (existing) return resolve(existing);

      const frame = document.createElement('iframe');
      frame.id = 'startng-frame';
      frame.src = 'https://start.ng/connect';
      frame.hidden = true;
      frame.style.display = 'none';
      frame.onload = () => resolve(frame);
      frame.onerror = (err) => reject(err);
      document.body.append(frame);
    });
  }
  return connectPromise;
}

interface StartNgResponse {
  type?: string;
  requestId?: string;
  user?: {
    id?: string;
    name?: string;
    account?: string;
    style?: PlayerData['style'];
  };
  guest?: {
    name?: string;
    account?: string;
    style?: PlayerData['style'];
  };
  ok?: boolean;
}

export async function askStartNg(message: Record<string, unknown>, replyType: string, timeoutMs = 4000): Promise<StartNgResponse | null> {
  try {
    const frame = await getConnectFrame();
    return new Promise((resolve) => {
      const requestId = Math.random().toString(36).slice(2);
      let timer: ReturnType<typeof setTimeout>;

      function onMessage(e: MessageEvent) {
        if (e.origin !== 'https://start.ng' || e.source !== frame.contentWindow) return;
        if (e.data?.type === replyType && e.data?.requestId === requestId) {
          clearTimeout(timer);
          window.removeEventListener('message', onMessage);
          resolve(e.data as StartNgResponse);
        }
      }

      timer = setTimeout(() => {
        window.removeEventListener('message', onMessage);
        resolve(null);
      }, timeoutMs);

      window.addEventListener('message', onMessage);
      frame.contentWindow?.postMessage({ ...message, requestId }, 'https://start.ng');
    });
  } catch {
    return null;
  }
}

export async function fetchPlayerProfile(): Promise<PlayerData> {
  // Check local storage custom style first if set by player
  const savedLocalStyle = localStorage.getItem('portal_pals_custom_style');
  const savedLocalName = localStorage.getItem('portal_pals_player_name');

  const reply = await askStartNg({ type: 'startng:whoami' }, 'startng:user');
  const userData = reply?.user ?? reply?.guest;

  let baseStyle = DEFAULT_STYLE;
  if (savedLocalStyle) {
    try {
      baseStyle = { ...DEFAULT_STYLE, ...JSON.parse(savedLocalStyle) };
    } catch {}
  } else if (userData?.style) {
    baseStyle = { ...DEFAULT_STYLE, ...userData.style };
  }

  return {
    id: userData ? reply?.user?.id : undefined,
    name: savedLocalName || userData?.name || 'Explorer',
    account: reply?.user ? (reply.user.account || 'start.ng') : null,
    style: baseStyle,
  };
}

export async function submitScoreToStartNg(gems: number, timeSeconds: number): Promise<boolean> {
  try {
    const res = await askStartNg(
      {
        type: 'startng:score',
        stats: {
          gems,
          time: timeSeconds,
        },
      },
      'startng:scoreSaved'
    );
    return !!res?.ok;
  } catch {
    return false;
  }
}

export function saveLocalScore(record: ScoreRecord): ScoreRecord[] {
  try {
    const existing: ScoreRecord[] = JSON.parse(localStorage.getItem('portal_pals_scores') || '[]');
    existing.push(record);
    // Sort by fewest seconds first
    existing.sort((a, b) => a.timeSeconds - b.timeSeconds);
    const trimmed = existing.slice(0, 10);
    localStorage.setItem('portal_pals_scores', JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return [record];
  }
}

export function getLocalScores(): ScoreRecord[] {
  try {
    return JSON.parse(localStorage.getItem('portal_pals_scores') || '[]');
  } catch {
    return [];
  }
}
