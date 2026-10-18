import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { OverlayModal } from './components/OverlayModal';
import { CustomizerModal } from './components/CustomizerModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { Toast } from './components/Toast';
import { DEFAULT_STYLE, TOTAL_GEMS } from './constants';
import { PlayerData, ScoreRecord, PlayerDirectionInfo } from './types';
import { fetchPlayerProfile, submitScoreToStartNg, saveLocalScore, getLocalScores } from './startng';
import { playBeep } from './audio';

export const App: React.FC = () => {
  const [started, setStarted] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [gems, setGems] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [finalTime, setFinalTime] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [resetSignal, setResetSignal] = useState<number>(0);

  // Direction state for HUD Compass and active arrow indications
  const [direction, setDirection] = useState<PlayerDirectionInfo>({
    dx: 1,
    dz: 0,
    label: 'RIGHT',
    arrow: '→',
    angleDeg: 0,
  });

  // Player Profile
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: 'Explorer',
    account: null,
    style: DEFAULT_STYLE,
  });

  // Touch controls state: auto-detect on mobile/touch, or allow toggle
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
  });

  // Touch keys set
  const [activeTouchKeys, setActiveTouchKeys] = useState<Set<string>>(new Set());

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [showStartModal, setShowStartModal] = useState<boolean>(true);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // High Scores
  const [scores, setScores] = useState<ScoreRecord[]>([]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Load player & records on mount
  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchPlayerProfile();
      setPlayerData(data);
    };

    loadProfile();
    setScores(getLocalScores());

    const handleFocus = () => loadProfile();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) loadProfile();
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Desktop keyboard shortcuts: R (restart), M (mute), T (touch toggle), C (customizer), Esc (close)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'r' || e.key === 'R') {
        handleRestart();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleSound();
      } else if (e.key === 't' || e.key === 'T') {
        setShowTouchControls((prev) => !prev);
        showToast(showTouchControls ? 'Touch controls hidden' : 'Touch controls enabled');
      } else if (e.key === 'c' || e.key === 'C') {
        setShowCustomizer((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowCustomizer(false);
        setShowLeaderboard(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showTouchControls]);

  // Compute best time
  const bestTime = scores.length > 0 ? Math.min(...scores.map((s) => s.timeSeconds)) : null;

  const handleStartGame = () => {
    setShowStartModal(false);
    setShowWinModal(false);
    setStarted(true);
    setWon(false);
    setResetSignal((prev) => prev + 1);
    if (soundOn) playBeep(520, true);
  };

  const handleRestart = () => {
    setShowStartModal(false);
    setShowWinModal(false);
    setStarted(true);
    setWon(false);
    setResetSignal((prev) => prev + 1);
    showToast('Fresh adventure!');
    if (soundOn) playBeep(600, true);
  };

  const handleToggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      if (next) playBeep(600, true);
      return next;
    });
  };

  const handleWin = async (completionTime: number) => {
    setWon(true);
    setFinalTime(completionTime);

    // Save local record
    const newRecord: ScoreRecord = {
      id: Math.random().toString(36).slice(2),
      playerName: playerData.name || 'Explorer',
      timeSeconds: completionTime,
      gems: TOTAL_GEMS,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updatedScores = saveLocalScore(newRecord);
    setScores(updatedScores);

    // Open celebration modal
    setShowWinModal(true);

    // Submit to start.ng iframe if connected
    if (playerData.id) {
      const ok = await submitScoreToStartNg(TOTAL_GEMS, completionTime);
      if (ok) {
        showToast('Score saved to start.ng!');
      }
    }
  };

  const handleSaveCustomizer = (updated: PlayerData) => {
    setPlayerData(updated);
    localStorage.setItem('portal_pals_custom_style', JSON.stringify(updated.style));
    localStorage.setItem('portal_pals_player_name', updated.name);
    showToast('Explorer outfit updated!');
  };

  const handleSignIn = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    window.location.href = `https://start.ng/?return_to=${encodeURIComponent(origin + path)}`;
  };

  const handlePressTouchKey = (key: string) => {
    setActiveTouchKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const handleReleaseTouchKey = (key: string) => {
    setActiveTouchKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-[#59c7ff]">
      {/* 2.5D Isometric Canvas Engine */}
      <GameCanvas
        started={started}
        won={won}
        soundOn={soundOn}
        playerData={playerData}
        activeTouchKeys={activeTouchKeys}
        onGemCollected={setGems}
        onTimeUpdate={setTime}
        onWin={handleWin}
        onToast={showToast}
        onDirectionChange={setDirection}
        resetSignal={resetSignal}
      />

      {/* Head-Up Display with clear text, direction compass, and high contrast */}
      <HUD
        playerData={playerData}
        gems={gems}
        totalGems={TOTAL_GEMS}
        time={time}
        bestTime={bestTime}
        soundOn={soundOn}
        direction={direction}
        showTouchControls={showTouchControls}
        onToggleSound={handleToggleSound}
        onRestart={handleRestart}
        onOpenCustomizer={() => setShowCustomizer(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onToggleTouchControls={() => setShowTouchControls((prev) => !prev)}
        onSignIn={handleSignIn}
      />

      {/* Responsive Multi-Device Touch Controls (Android / iOS / Tablets / Windows touch) */}
      <TouchControls
        visible={showTouchControls}
        activeTouchKeys={activeTouchKeys}
        onPressKey={handlePressTouchKey}
        onReleaseKey={handleReleaseTouchKey}
      />

      {/* Start / Victory Screen Overlay */}
      <OverlayModal
        isOpen={showStartModal || showWinModal}
        type={showWinModal ? 'win' : 'start'}
        finalTime={finalTime}
        bestTime={bestTime}
        onPlay={showWinModal ? handleRestart : handleStartGame}
        onOpenCustomizer={() => setShowCustomizer(true)}
      />

      {/* Character Customizer Modal */}
      <CustomizerModal
        isOpen={showCustomizer}
        playerData={playerData}
        onClose={() => setShowCustomizer(false)}
        onSave={handleSaveCustomizer}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        scores={scores}
        onClose={() => setShowLeaderboard(false)}
      />

      {/* High-visibility Toast Notification */}
      <Toast message={toastMessage} />
    </main>
  );
};
