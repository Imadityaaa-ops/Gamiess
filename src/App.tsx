/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  User, 
  Monitor, 
  Settings, 
  X, 
  Circle, 
  Timer,
  Play,
  LogOut,
  ChevronRight,
  Medal,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  Player, 
  GameMode, 
  Difficulty, 
  INITIAL_STATE, 
  GameState, 
  SOUNDS 
} from './types';
import { checkWinner, getBestMove } from './lib/gameLogic';

// --- Utilities ---
const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.5;
  audio.play().catch(() => {}); // Sink errors if user hasn't interacted yet
};

// --- Components ---

export default function App() {
  const [view, setView] = useState<'LOGIN' | 'MENU' | 'LEVEL' | 'GAME'>('LOGIN');
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [mode, setMode] = useState<GameMode>('PVB');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [scores, setScores] = useState({ X: 0, O: 0, DRAWS: 0 });
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for existing session
  useEffect(() => {
    const saved = localStorage.getItem('ttt_pro_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setView('MENU');
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (view === 'GAME' && !gameState.winner) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
             clearInterval(timerRef.current!);
             handleMove(null); // Timeout move - skip turn or random? Let's make it a random move for now to keep game moving
             return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, gameState.winner, gameState.xIsNext]);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    if (username) {
      const newUser = { username };
      setUser(newUser);
      localStorage.setItem('ttt_pro_user', JSON.stringify(newUser));
      setView('MENU');
      playSound(SOUNDS.START);
    }
  };

  const logout = () => {
    localStorage.removeItem('ttt_pro_user');
    setUser(null);
    setView('LOGIN');
  };

  const handleMove = useCallback((index: number | null) => {
    if (view !== 'GAME' || gameState.winner) return;

    let targetIdx = index;
    if (targetIdx === null) {
      // Timeout case: pick random available move
      const available = gameState.board.map((v, i) => v === null ? i : null).filter((v): v is number => v !== null);
      if (available.length === 0) return;
      targetIdx = available[Math.floor(Math.random() * available.length)];
    }

    if (gameState.board[targetIdx]) return;

    const newBoard = [...gameState.board];
    newBoard[targetIdx] = gameState.xIsNext ? 'X' : 'O';
    
    const { winner, line } = checkWinner(newBoard);
    
    playSound(SOUNDS.CLICK);
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      xIsNext: !prev.xIsNext,
      winner,
      winningLine: line
    }));

    setTimeLeft(15);

    if (winner) {
      if (winner === 'DRAW') {
        playSound(SOUNDS.DRAW);
        setScores(s => ({ ...s, DRAWS: s.DRAWS + 1 }));
      } else {
        playSound(SOUNDS.WIN);
        setScores(s => ({ ...s, [winner]: s[winner] + 1 }));
      }
    }
  }, [view, gameState, scores]);

  // Bot logic
  useEffect(() => {
    if (mode === 'PVB' && !gameState.winner && !gameState.xIsNext) {
      const timeout = setTimeout(() => {
        const botMove = getBestMove(gameState.board, difficulty);
        handleMove(botMove);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [gameState, mode, difficulty, handleMove]);

  const resetGame = () => {
    setGameState(INITIAL_STATE);
    setTimeLeft(15);
  };

  const returnToMenu = () => {
    setView('MENU');
    resetGame();
  };

  // --- Views ---

  const LoginView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center"
    >
      <div className="w-24 h-24 mb-6 relative">
        <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full animate-pulse"></div>
        <div className="relative bg-card-blue rounded-3xl p-4 flex items-center justify-center border-2 border-brand-gold shadow-lg shadow-brand-gold/20">
          <Trophy className="w-12 h-12 text-brand-gold" />
        </div>
      </div>
      <h1 className="text-4xl title-pro mb-2">TTT PRO</h1>
      <p className="text-text-muted mb-10 text-xs tracking-[0.2em] uppercase font-black">Professional Gameplay</p>
      
      <form onSubmit={handleLogin} className="w-full space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input 
            name="username"
            type="text" 
            placeholder="ENTER USERNAME" 
            className="w-full h-14 bg-black/30 border border-white/5 rounded-2xl pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 transition-colors font-bold text-sm tracking-wide"
            required
          />
        </div>
        <div className="relative">
          <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input 
            type="password" 
            placeholder="ENTER PASSWORD" 
            className="w-full h-14 bg-black/30 border border-white/5 rounded-2xl pl-12 pr-4 focus:outline-none focus:border-brand-primary/50 transition-colors font-bold text-sm tracking-wide"
            required
          />
        </div>
        <button 
          type="submit"
          className="w-full btn-primary h-14 text-sm"
        >
          START LOGO
        </button>
      </form>

      <p className="mt-16 sagar-tag">Made with Sagar</p>
    </motion.div>
  );

  const MenuView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col p-8"
    >
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
            <User className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">Current Player</p>
            <h2 className="text-xl font-black">{user?.username}</h2>
          </div>
        </div>
        <button onClick={logout} className="p-3 bg-white/5 rounded-xl text-text-muted hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        <button 
          onClick={() => { setMode('PVB'); setView('LEVEL'); }}
          className="w-full menu-card flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Monitor className="w-6 h-6 text-brand-primary" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mb-0.5">Mode 01</p>
              <h3 className="text-lg font-black uppercase tracking-tight">vs Computer</h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => { setMode('PVP'); setView('GAME'); }}
          className="w-full menu-card flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <User className="w-6 h-6 text-brand-gold" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest mb-0.5">Mode 02</p>
              <h3 className="text-lg font-black uppercase tracking-tight">vs Friend</h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 p-5 bg-black/20 rounded-3xl border border-white/5">
        <div className="text-center">
          <p className="text-[9px] text-text-muted uppercase font-black mb-1">Wins</p>
          <p className="text-lg font-black text-brand-gold">{scores.X}</p>
        </div>
        <div className="text-center border-x border-white/5">
          <p className="text-[9px] text-text-muted uppercase font-black mb-1">Draws</p>
          <p className="text-lg font-black">{scores.DRAWS}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-text-muted uppercase font-black mb-1">Losses</p>
          <p className="text-lg font-black text-accent-red">{scores.O}</p>
        </div>
      </div>

      <p className="text-center mt-8 sagar-tag">Made with Sagar</p>
    </motion.div>
  );

  const LevelSelectionView = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col p-8"
    >
      <button onClick={() => setView('MENU')} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-10 hover:bg-white/10 transition-colors">
        <ChevronRight className="w-6 h-6 rotate-180" />
      </button>

      <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Difficulty</h1>
      <p className="text-text-muted text-xs font-black uppercase tracking-widest mb-10">Select Challenge Level</p>

      <div className="flex-1 space-y-4">
        {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((level) => (
          <button 
            key={level}
            onClick={() => { setDifficulty(level); setView('GAME'); }}
            className="w-full menu-card flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                level === 'EASY' ? 'bg-green-500/10 text-green-400' : 
                level === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400' : 
                'bg-red-500/10 text-red-400'
              }`}>
                <Medal className="w-6 h-6" />
              </div>
              <span className="font-black text-lg uppercase tracking-tight">{level}</span>
            </div>
            <Play className="w-5 h-5 text-text-muted group-hover:text-brand-primary group-hover:scale-110 transition-all" />
          </button>
        ))}
      </div>

      <p className="text-center mt-8 sagar-tag">Made with Sagar</p>
    </motion.div>
  );

  const GameView = () => {
    return (
      <div className="h-full flex flex-col p-8">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="title-pro text-xl">TTT PRO</div>
          <div className="timer-pill">
            <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-accent-red animate-pulse' : 'text-text-muted'}`} />
            <span className={`text-sm font-black font-mono ${timeLeft <= 5 ? 'text-accent-red' : 'text-white'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div className={`p-4 rounded-3xl text-center border-2 transition-all ${gameState.xIsNext ? 'bg-brand-primary/10 border-brand-primary' : 'bg-black/20 border-transparent opacity-60'}`}>
            <p className="text-[10px] text-text-muted font-black uppercase mb-1">YOU</p>
            <strong className="text-lg font-black text-brand-primary">{scores.X}</strong>
          </div>
          <div className="p-4 rounded-3xl text-center bg-black/20 border border-white/5">
             <p className="text-[10px] text-text-muted font-black uppercase mb-1">LVL</p>
             <strong className="text-xs font-black text-white">{difficulty}</strong>
          </div>
          <div className={`p-4 rounded-3xl text-center border-2 transition-all ${!gameState.xIsNext ? 'bg-accent-red/10 border-accent-red' : 'bg-black/20 border-transparent opacity-60'}`}>
            <p className="text-[10px] text-text-muted font-black uppercase mb-1">CPU</p>
            <strong className="text-lg font-black text-accent-red">{scores.O}</strong>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex flex-col items-center justify-center">
           <div className="grid grid-cols-3 gap-4 w-full aspect-square">
             {gameState.board.map((cell, i) => {
               const win = gameState.winningLine?.includes(i);
               return (
                 <button
                   key={i}
                    disabled={!!cell || !!gameState.winner}
                    onClick={() => handleMove(i)}
                    className={`game-cell text-5xl font-black ${win ? 'game-cell-win' : ''}`}
                 >
                    <AnimatePresence mode="wait">
                      {cell && (
                        <motion.span
                          initial={{ scale: 0.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cell === 'X' ? 'text-brand-primary' : 'text-accent-red'}
                        >
                          {cell}
                        </motion.span>
                      )}
                    </AnimatePresence>
                 </button>
               );
             })}
           </div>

           <div className="mt-8 h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {gameState.winner ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                  >
                    <h2 className="text-xl font-black text-brand-gold uppercase tracking-tighter flex items-center gap-2">
                       <Trophy className="w-5 h-5" />
                       {gameState.winner === 'DRAW' ? "Round Draw!" : `${gameState.winner} Takes Round!`}
                    </h2>
                  </motion.div>
                ) : (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-text-muted font-black uppercase tracking-[0.3em]"
                  >
                    {gameState.xIsNext ? `${user?.username}'s Turn` : `${mode === 'PVB' ? 'CPU' : 'Player O'}'s Turn`}
                  </motion.p>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-auto pt-8">
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={returnToMenu}
                className="btn-secondary h-14 text-[10px]"
              >
                HOME PAGE
              </button>
              <button 
                onClick={resetGame}
                className="btn-primary h-14 text-[10px]"
              >
                RESET GAME
              </button>
           </div>
           <p className="text-center mt-8 sagar-tag">Made with Sagar</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-[430px] aspect-[9/19] sm:max-h-[850px] neat-container">
        {/* Content Area */}
        <main className="relative h-full">
          <AnimatePresence mode="wait">
            {view === 'LOGIN' && <LoginView key="login" />}
            {view === 'MENU' && <MenuView key="menu" />}
            {view === 'LEVEL' && <LevelSelectionView key="level" />}
            {view === 'GAME' && <GameView key="game" />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

const PlayerIcon = ({ player, size = 24, className = "" }: { player: Player, size?: number, className?: string }) => {
  if (player === 'X') return <X style={{ width: size, height: size }} className={`text-brand-primary ${className}`} />;
  if (player === 'O') return <Circle style={{ width: size, height: size }} className={`text-accent-red ${className}`} />;
  return null;
};
