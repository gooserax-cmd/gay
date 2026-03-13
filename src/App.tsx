import React, { useState, useCallback, useEffect } from 'react';
import { createBoard, checkCollision } from './game';
import { usePlayer, useBoard, useGameStatus, useInterval } from './hooks';
import { Play, RotateCcw, Pause, ChevronLeft, ChevronRight, ChevronDown, ArrowDownToLine } from 'lucide-react';

const App = () => {
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { player, updatePlayerPos, resetPlayer, playerRotate } = usePlayer();
  const { board, setBoard, rowsCleared } = useBoard(player, resetPlayer);
  const { score, setScore, rows, setRows, level, setLevel } = useGameStatus(rowsCleared);

  const movePlayer = useCallback((dir: number) => {
    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  }, [player, board, updatePlayerPos]);

  const startGame = () => {
    setBoard(createBoard());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
    setIsPaused(false);
  };

  const pauseGame = () => {
    if (gameOver) return;
    if (isPaused) {
      setIsPaused(false);
      setDropTime(1000 / (level + 1) + 200);
    } else {
      setIsPaused(true);
      setDropTime(null);
    }
  };

  const drop = useCallback(() => {
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  }, [player, board, rows, level, setLevel, updatePlayerPos]);

  const dropPlayer = useCallback(() => {
    setDropTime(null);
    drop();
  }, [drop]);

  const hardDrop = useCallback(() => {
    let y = 0;
    while (!checkCollision(player, board, { x: 0, y: y + 1 })) {
      y += 1;
    }
    updatePlayerPos({ x: 0, y, collided: true });
  }, [player, board, updatePlayerPos]);

  const move = useCallback((e: KeyboardEvent) => {
    if (!gameOver && !isPaused) {
      if (e.keyCode === 37) {
        movePlayer(-1);
      } else if (e.keyCode === 39) {
        movePlayer(1);
      } else if (e.keyCode === 40) {
        dropPlayer();
      } else if (e.keyCode === 38) {
        playerRotate(board, 1);
      } else if (e.keyCode === 32) {
        hardDrop();
      }
    }
  }, [gameOver, isPaused, movePlayer, dropPlayer, playerRotate, board, hardDrop]);

  const keyUp = useCallback((e: KeyboardEvent) => {
    if (!gameOver && !isPaused) {
      if (e.keyCode === 40) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  }, [gameOver, isPaused, level]);

  useInterval(() => {
    drop();
  }, dropTime);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }
      move(e);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }
      keyUp(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [move, keyUp]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-zinc-100">
      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
        
        {/* Game Board */}
        <div className="relative bg-zinc-900 p-2 rounded-xl shadow-2xl border border-zinc-800">
          <div 
            className="grid bg-zinc-950 border border-zinc-800"
            style={{ 
              gridTemplateRows: 'repeat(20, minmax(0, 1fr))',
              gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
              width: 'min(80vw, 300px)',
              height: 'min(160vw, 600px)'
            }}
          >
            {board.map((row, y) => 
              row.map((cell, x) => (
                <div 
                  key={`${y}-${x}`} 
                  className={`
                    border-[0.5px] border-zinc-800/30
                    ${cell ? cell.color : 'bg-transparent'}
                    ${cell ? 'shadow-[inset_0_0_8px_rgba(0,0,0,0.3)]' : ''}
                  `}
                />
              ))
            )}
          </div>

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
              <p className="text-xl mb-6">Score: {score}</p>
              <button 
                onClick={startGame}
                className="px-6 py-3 bg-zinc-100 text-zinc-900 font-bold rounded-full hover:bg-zinc-300 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-zinc-100 tracking-widest">PAUSED</h2>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 w-full md:w-64">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
            <h1 className="text-3xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500">
              TETRIS
            </h1>
            
            <div className="space-y-4">
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Score</p>
                <p className="text-2xl font-mono">{score}</p>
              </div>
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Lines</p>
                <p className="text-2xl font-mono">{rows}</p>
              </div>
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Level</p>
                <p className="text-2xl font-mono">{level}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={startGame}
              className="flex-1 py-4 bg-emerald-500 text-emerald-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Play size={20} />
              {gameOver || score === 0 ? 'Start' : 'Restart'}
            </button>
            <button 
              onClick={pauseGame}
              disabled={gameOver || (!isPaused && !dropTime)}
              className="p-4 bg-zinc-800 text-zinc-100 font-bold rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
          </div>

          {/* Controls Help */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hidden md:block">
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-4">Controls</h3>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex justify-between items-center">
                <span>Move Left</span>
                <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 font-mono">←</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Move Right</span>
                <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 font-mono">→</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Soft Drop</span>
                <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 font-mono">↓</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Hard Drop</span>
                <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 font-mono">Space</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Rotate</span>
                <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 font-mono">↑</kbd>
              </div>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden grid grid-cols-3 gap-2 mt-4">
            <button onClick={() => movePlayer(-1)} className="bg-zinc-800 p-4 rounded-xl flex justify-center active:bg-zinc-700"><ChevronLeft /></button>
            <button onClick={() => playerRotate(board, 1)} className="bg-zinc-800 p-4 rounded-xl flex justify-center active:bg-zinc-700"><RotateCcw /></button>
            <button onClick={() => movePlayer(1)} className="bg-zinc-800 p-4 rounded-xl flex justify-center active:bg-zinc-700"><ChevronRight /></button>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <button onClick={dropPlayer} className="bg-zinc-800 p-4 rounded-xl flex justify-center active:bg-zinc-700"><ChevronDown /></button>
              <button onClick={hardDrop} className="bg-zinc-800 p-4 rounded-xl flex justify-center active:bg-zinc-700"><ArrowDownToLine /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
