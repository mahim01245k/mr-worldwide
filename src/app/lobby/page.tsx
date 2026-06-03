"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useGameStore } from "@/lib/store/gameStore";
import { Copy, Check } from "lucide-react";

export default function LobbyPage() {
  const router = useRouter();
  const { createRoom, joinRoom, startGame } = useSocket();
  const { gameState, myPlayerId, roomCode, isConnected } = useGameStore();
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const isHost = gameState?.players[0]?.id === myPlayerId;

  useEffect(() => {
    if (gameState?.phase && gameState.phase !== "waiting") router.push("/game");
  }, [gameState?.phase, router]);

  const handleCreate = () => {
    if (!playerName.trim()) { setError("Enter your name"); return; }
    setError("");
    createRoom(playerName.trim());
  };

  const handleJoin = () => {
    if (!playerName.trim()) { setError("Enter your name"); return; }
    if (!joinCode.trim()) { setError("Enter room code"); return; }
    setError("");
    joinRoom(joinCode.trim().toUpperCase(), playerName.trim());
  };

  const handleCopy = () => {
    if (roomCode) { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  // Waiting room
  if (gameState?.phase === "waiting" && roomCode) {
    const COLORS = ["#ff7ca0","#ffc73f","#7bed9f","#74b9ff","#a29bfe","#fd79a8"];
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at 30% 40%, #1a0e35 0%, #0a0816 70%)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black text-white tracking-tight">
              MR.<span className="text-violet-400">WORLDWIDE</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Global Monopoly</p>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "#15132a" }}>
            {/* Share game */}
            <div className="p-5 border-b border-white/10">
              <p className="text-white font-bold mb-3 flex items-center gap-2">
                Share this game
                <span className="text-slate-500 text-xs font-normal">Click to copy the room link</span>
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#0f0d20] border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-slate-300 text-sm flex-1">{typeof window !== "undefined" ? window.location.origin : ""}/room/{roomCode}</span>
                  <button onClick={handleCopy} className="text-slate-400 hover:text-white ml-2">
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Players */}
            <div className="p-5">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Players ({gameState.players.length}/6)</p>
              <div className="space-y-2 mb-5">
                {gameState.players.map((player, i) => (
                  <motion.div key={player.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{ background: `${COLORS[i] || "#a29bfe"}10`, border: `1px solid ${COLORS[i] || "#a29bfe"}25` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2"
                      style={{ borderColor: COLORS[i] || "#a29bfe", background: `${COLORS[i] || "#a29bfe"}20` }}>
                      {["🚀","🎩","🦊","🐉","🌟","🏆"][i]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{player.name}</p>
                      <p className="text-slate-500 text-xs">
                        {i === 0 ? "👑 Host" : "Ready"}
                        {player.id === myPlayerId ? " · you" : ""}
                      </p>
                    </div>
                    {!player.isConnected && <span className="text-red-400 text-xs">Disconnected</span>}
                  </motion.div>
                ))}
              </div>

              {isHost ? (
                <motion.button onClick={() => startGame()} disabled={gameState.players.length < 1}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 text-white font-black text-lg py-4 rounded-xl transition-all"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  Start Game 🚀
                </motion.button>
              ) : (
                <div className="text-center text-slate-400 py-3">
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    Waiting for host to start...
                  </motion.span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 30% 40%, #1a0e35 0%, #0a0816 70%)" }}>
      {/* Background rings */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full border border-violet-900/15"
            style={{ width: (i+1)*120, height: (i+1)*120, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 25 + i * 8, repeat: Infinity, ease: "linear" }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div className="text-7xl mb-4" animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>
            🌍
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            MR.<span className="text-violet-400">WORLDWIDE</span>
          </h1>
          <p className="text-slate-500 mt-1">Global Monopoly · Multiplayer</p>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "#15132a" }}>
          <AnimatePresence mode="wait">
            {mode === "menu" && (
              <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 space-y-3">
                <motion.button onClick={() => setMode("create")}
                  className="w-full flex items-center gap-4 rounded-xl p-4 border border-violet-700/30 hover:border-violet-600/50 transition-all group"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(139,92,246,0.05))" }}
                  whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "rgba(124,58,237,0.2)" }}>🎮</div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white">Create Room</p>
                    <p className="text-slate-400 text-sm">Host a new game</p>
                  </div>
                  <span className="text-slate-500 group-hover:text-violet-400 transition-colors">→</span>
                </motion.button>

                <motion.button onClick={() => setMode("join")}
                  className="w-full flex items-center gap-4 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all group"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.05)" }}>🚪</div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white">Join Room</p>
                    <p className="text-slate-400 text-sm">Enter a room code</p>
                  </div>
                  <span className="text-slate-500 group-hover:text-white transition-colors">→</span>
                </motion.button>
              </motion.div>
            )}

            {(mode === "create" || mode === "join") && (
              <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => { setMode("menu"); setError(""); }} className="text-slate-400 hover:text-white text-sm transition-colors">← Back</button>
                  <span className="text-white font-bold">{mode === "create" ? "Create Room" : "Join Room"}</span>
                </div>

                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">Your Name</label>
                  <input value={playerName} onChange={e => { setPlayerName(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && (mode === "create" ? handleCreate() : handleJoin())}
                    placeholder="Enter your name..." maxLength={20} autoFocus
                    className="w-full rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/70 transition-colors border border-white/10 focus:border-violet-500/50"
                    style={{ background: "#0f0d20" }} />
                </div>

                {mode === "join" && (
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">Room Code</label>
                    <input value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleJoin()}
                      placeholder="e.g. ABC123" maxLength={8}
                      className="w-full rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors border border-white/10 font-mono text-xl tracking-widest uppercase"
                      style={{ background: "#0f0d20" }} />
                  </div>
                )}

                {error && <p className="text-red-400 text-xs">{error}</p>}
                {!isConnected && <p className="text-yellow-400 text-xs text-center animate-pulse">Connecting to server...</p>}

                <motion.button onClick={mode === "create" ? handleCreate : handleJoin} disabled={!isConnected}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  {mode === "create" ? "Create Room 🚀" : "Join Game 🚪"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
