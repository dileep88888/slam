/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { RiverQuestGame } from './game/RiverQuestGame';
import { Volume2, VolumeX, Tv, Keyboard, Smartphone, Swords } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<RiverQuestGame | null>(null);
  const [showCRT, setShowCRT] = useState<boolean>(true);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new RiverQuestGame(canvasRef.current);
    gameRef.current = game;
    game.start();

    // Keyboard controls handler
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (!gameRef.current) return;

      const code = e.code;
      const key = e.key.toLowerCase();

      // Number keys to switch level on Title Screen
      if (gameRef.current.state === 'TITLE') {
        if (code === 'Digit1' || key === '1') {
          gameRef.current.selectedStartLevel = 1;
          return;
        }
        if (code === 'Digit2' || key === '2') {
          gameRef.current.selectedStartLevel = 2;
          return;
        }
        if (code === 'Digit3' || key === '3') {
          gameRef.current.selectedStartLevel = 3;
          return;
        }
      }

      // Start game on Enter or Space on Title Screen
      if (gameRef.current.state === 'TITLE' && (code === 'Enter' || code === 'Space')) {
        gameRef.current.startGame(gameRef.current.selectedStartLevel);
        return;
      }

      if (gameRef.current.state === 'STAGE_CLEAR') {
        if (code === 'Enter' || code === 'Space') {
          gameRef.current.startNextLevel();
          return;
        }
      }

      if (gameRef.current.state === 'GAME_OVER') {
        if (code === 'Enter' || code === 'Space') {
          gameRef.current.startGame(gameRef.current.currentLevel);
          return;
        }
      }

      // Movement
      if (code === 'KeyA' || code === 'ArrowLeft') {
        gameRef.current.controls.left = true;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        gameRef.current.controls.right = true;
      }
      // Jump
      if (code === 'KeyW' || code === 'ArrowUp' || (code === 'Space' && !e.repeat)) {
        gameRef.current.controls.jump = true;
        gameRef.current.controls.justJumped = true;
      }
      // Crescent Slash Attack
      if (code === 'KeyJ' || code === 'KeyX' || code === 'KeyC' || (code === 'KeyK' && !e.repeat)) {
        gameRef.current.controls.attack = true;
        gameRef.current.controls.justAttacked = true;
      }
      // Pause
      if (code === 'KeyP' || code === 'Escape') {
        gameRef.current.togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameRef.current) return;

      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') {
        gameRef.current.controls.left = false;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        gameRef.current.controls.right = false;
      }
      if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') {
        gameRef.current.controls.jump = false;
      }
      if (code === 'KeyJ' || code === 'KeyX' || code === 'KeyC' || code === 'KeyK') {
        gameRef.current.controls.attack = false;
      }
    };

    const handleBlur = () => {
      if (gameRef.current) {
        gameRef.current.controls.left = false;
        gameRef.current.controls.right = false;
        gameRef.current.controls.jump = false;
        gameRef.current.controls.attack = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      game.stop();
    };
  }, []);

  // Handle click / tap on canvas
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !gameRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 360 / rect.width;
    const scaleY = 640 / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    gameRef.current.handleCanvasClick(x, y);
    setSoundMuted(gameRef.current.soundMuted);
  };

  // Touch Virtual Controls Handlers
  const handleTouchLeft = (pressed: boolean) => {
    if (gameRef.current) {
      gameRef.current.controls.left = pressed;
    }
  };

  const handleTouchRight = (pressed: boolean) => {
    if (gameRef.current) {
      gameRef.current.controls.right = pressed;
    }
  };

  const handleTouchJump = (pressed: boolean) => {
    if (gameRef.current) {
      gameRef.current.controls.jump = pressed;
      if (pressed) {
        gameRef.current.controls.justJumped = true;
      }
    }
  };

  const handleTouchAttack = (pressed: boolean) => {
    if (gameRef.current) {
      gameRef.current.controls.attack = pressed;
      if (pressed) {
        gameRef.current.controls.justAttacked = true;
      }
    }
  };

  const toggleSound = () => {
    if (gameRef.current) {
      const muted = gameRef.current.toggleMute();
      setSoundMuted(muted);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#07090e] p-0 md:p-3 select-none overflow-hidden text-slate-100 font-sans">
      {/* Top Bar for Desktop Utility & Settings */}
      <div className="hidden md:flex w-full max-w-[420px] items-center justify-between pb-2 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 font-bold tracking-widest text-cyan-400">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          16-BIT ARCADE • 9:16 VERTICAL
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCRT(!showCRT)}
            title="Toggle CRT Scanlines"
            className={`flex items-center gap-1 rounded px-2 py-1 transition-colors border ${
              showCRT
                ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv size={12} />
            CRT
          </button>
          <button
            onClick={toggleSound}
            title="Toggle Sound"
            className="flex items-center gap-1 rounded px-2 py-1 transition-colors border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
          >
            {soundMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            {soundMuted ? 'MUTE' : '8-BIT'}
          </button>
          <button
            onClick={() => setShowTouchControls(!showTouchControls)}
            title="Toggle Touch Buttons"
            className={`flex items-center gap-1 rounded px-2 py-1 transition-colors border ${
              showTouchControls
                ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={12} />
          </button>
        </div>
      </div>

      {/* Main 9:16 Vertical Screen Frame */}
      <div className="relative flex h-full max-h-[100vh] w-full max-w-[100vw] md:max-w-[420px] md:max-h-[746px] flex-col items-center justify-center overflow-hidden md:rounded-2xl md:border-2 md:border-slate-800 md:shadow-2xl md:shadow-cyan-950/30 bg-black">
        {/* The Game Canvas */}
        <div className="relative h-full w-full aspect-[9/16] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasPointerDown}
            className="pixel-art h-full w-full object-contain cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Optional Authentic CRT Curved Glass and Scanline Overlay */}
          {showCRT && (
            <div className="crt-overlay absolute inset-0 pointer-events-none rounded-inherit" />
          )}

          {/* On-Screen Touch Controls (Ergonomically tuned for vertical mobile play) */}
          {showTouchControls && (
            <div className="absolute inset-x-0 bottom-4 flex items-end justify-between px-4 pointer-events-none select-none z-10">
              {/* D-Pad Movement (Left & Right) */}
              <div className="flex gap-2.5 pointer-events-auto">
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleTouchLeft(true);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    handleTouchLeft(false);
                  }}
                  onPointerLeave={() => handleTouchLeft(false)}
                  onPointerCancel={() => handleTouchLeft(false)}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-cyan-500/40 bg-slate-900/80 active:bg-cyan-600/70 text-cyan-300 active:text-white shadow-lg backdrop-blur-xs transition-transform active:scale-95"
                  aria-label="Move Left"
                >
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                </button>
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleTouchRight(true);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    handleTouchRight(false);
                  }}
                  onPointerLeave={() => handleTouchRight(false)}
                  onPointerCancel={() => handleTouchRight(false)}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-cyan-500/40 bg-slate-900/80 active:bg-cyan-600/70 text-cyan-300 active:text-white shadow-lg backdrop-blur-xs transition-transform active:scale-95"
                  aria-label="Move Right"
                >
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </button>
              </div>

              {/* Action Buttons (Jump & Crescent Slash Attack) */}
              <div className="flex gap-3 pointer-events-auto">
                {/* Jump Button */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleTouchJump(true);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    handleTouchJump(false);
                  }}
                  onPointerLeave={() => handleTouchJump(false)}
                  onPointerCancel={() => handleTouchJump(false)}
                  className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 border-amber-500/50 bg-slate-900/80 active:bg-amber-500/80 text-amber-300 active:text-slate-950 shadow-lg backdrop-blur-xs transition-transform active:scale-95"
                  aria-label="Jump"
                >
                  <span className="text-base font-black">▲</span>
                  <span className="text-[8px] font-bold">JUMP</span>
                </button>

                {/* Crescent Slash Button */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleTouchAttack(true);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    handleTouchAttack(false);
                  }}
                  onPointerLeave={() => handleTouchAttack(false)}
                  onPointerCancel={() => handleTouchAttack(false)}
                  className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 border-cyan-400 bg-cyan-950/85 active:bg-cyan-400 text-cyan-200 active:text-slate-950 shadow-lg shadow-cyan-500/20 backdrop-blur-xs transition-transform active:scale-95"
                  aria-label="Crescent Slash"
                >
                  <Swords className="h-5 w-5" />
                  <span className="text-[8px] font-bold">SLASH</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Keyboard Hints Footer */}
      <div className="hidden md:flex items-center gap-4 pt-2 text-[9px] text-slate-500">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">A</kbd>
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">D</kbd> Move
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">W</kbd> / <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">Space</kbd> Jump
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">J</kbd> / <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">X</kbd> Slash
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">P</kbd> Pause
        </span>
      </div>
    </div>
  );
}
