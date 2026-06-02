"use client";
// src/app/lobby/page.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useGameStore } from "@/lib/store/gameStore";
import { Globe, Users, Gamepad2, ArrowRight, Copy, Check } from "lucide-react";

export default function LobbyPage() {
  const router = useRouter();
  const { createRoom, joinRoom, startGame } = useSocket();
  const { gameState, myPlayerId, roomCode, isConnected } = useGameStore();
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [copied, setCopied] = useState(false);
  const [nameError, setNameError] = useState("");

  const myPlayer = gameState?.players.find((p) => p.id === myPlayerId);
  const isHost = gameState?.players[0]?.id === myPlayerId;

  // Once game starts, redirect to game page
  useEffect(() => {
    if (gameState?.phase !== "waiting" && gameState?.phase) {
      router.push("/game");
    }
  }, [gameState?.phase, router]);

  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name too short";
    if (name.trim().length > 20) return "Name too long";
    return "";
  };

  const handleCreate = () => {
    const err = validateName(playerName);
    if (err) { setNameError(err); return; }
    setNameError("");
    createRoom(playerName.trim());
  };

  const handleJoin = () => {
    const err = validateName(playerName);
    if (err) { setNameError(err); return; }
    if (!joinCode.trim()) { setNameError("Room code is required"); return; }
    setNameError("");
    joinRoom(joinCode.trim().toUpperCase(), playerName.trim());
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Waiting room (after creating/joining)
  if (gameState?.phase === "waiting" && roomCode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Room code */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🌍</div>
              <h2 className="text-white font-black text-2xl">Waiting Room</h2>
              <p className="text-slate-400 text-sm mt-1">Share the code with friends!</p>
            </div>

            <div
              className="flex items-center justify-between bg-slate-800 rounded-xl p-4 mb-6 cursor-pointer hover:bg-slate-750 transition-colors border border-slate-700"
              onClick={handleCopyCode}
            >
              <div>
                <p className="text-slate-400 text-xs mb-1">Room Code</p>
                <p className="text-3xl font-black tracking-[0.3em] text-violet-400 font-mono">
                  {roomCode}
                </p>
              </div>
              <div className="text-slate-400 hover:text-white transition-colors">
                {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
              </div>
            </div>

            {/* Players list */}
            <div className="space-y-2 mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider">
                Players ({gameState.players.length}/6)
              </p>
              {gameState.players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xl border-2"
                    style={{
                      borderColor: ["#ef4444","#3b82f6","#22c55e","#eab308","#a855f7","#f97316"][i] || "#7c3aed",
                      background: `${["#ef4444","#3b82f6","#22c55e","#eab308","#a855f7","#f97316"][i] || "#7c3aed"}20`,
                    }}
                  >
                    {["🚀","🎩","🦊","🐉","🌟","🏆"][i]}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{player.name}</p>
                    <p className="text-slate-500 text-xs">
                      {i === 0 ? "👑 Host" : "Ready"}
                      {player.id === myPlayerId ? " (you)" : ""}
                    </p>
                  </div>
                  {!player.isConnected && (
                    <span className="text-xs text-red-400">Disconnected</span>
                  )}
                </motion.div>
              ))}
            </div>

            {isHost ? (
              <motion.button
                onClick={() => startGame()}
                disabled={gameState.players.length < 1}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-purple-900/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Start Game 🚀
              </motion.button>
            ) : (
              <div className="text-center text-slate-400 py-4">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Waiting for host to start...
                </motion.div>
              </div>
            )}
          </div>

          {/* Connection status */}
          <div className={`text-center text-xs ${isConnected ? "text-green-400" : "text-red-400"}`}>
            {isConnected ? "● Connected" : "○ Connecting..."}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 20% 50%, #1a0a2e 0%, #050a14 60%)",
      }}
    >
      {/* Background globe grid effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-violet-900/20"
            style={{
              width: `${(i + 1) * 80}px`,
              height: `${(i + 1) * 80}px`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 30 + i * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Hero */}
        <div className="text-center mb-8">
          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🌍
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Mr. Worldwide
          </h1>
          <p className="text-slate-400 text-lg">Global Monopoly • Multiplayer</p>
        </div>

        {/* Main card */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {mode === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <motion.button
                  onClick={() => setMode("create")}
                  className="w-full flex items-center gap-4 bg-gradient-to-r from-violet-900/60 to-purple-900/60 hover:from-violet-800/60 hover:to-purple-800/60 border border-violet-700/40 text-white rounded-xl p-4 transition-all group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-600/30 flex items-center justify-center text-2xl">
                    🎮
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">Create Room</p>
                    <p className="text-slate-400 text-sm">Host a new game</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
                </motion.button>

                <motion.button
                  onClick={() => setMode("join")}
                  className="w-full flex items-center gap-4 bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/40 text-white rounded-xl p-4 transition-all group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center text-2xl">
                    🚪
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">Join Room</p>
                    <p className="text-slate-400 text-sm">Enter a room code</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                </motion.button>

                <div className="border-t border-slate-800 pt-3 mt-3">
                  <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Users size={12} /> Up to 6 players</span>
                    <span className="flex items-center gap-1"><Globe size={12} /> 30+ world cities</span>
                    <span className="flex items-center gap-1"><Gamepad2 size={12} /> Real-time play</span>
                  </div>
                </div>
              </motion.div>
            )}

            {(mode === "create" || mode === "join") && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => { setMode("menu"); setNameError(""); }}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    ← Back
                  </button>
                  <h3 className="text-white font-bold">
                    {mode === "create" ? "Create New Room" : "Join Room"}
                  </h3>
                </div>

                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">Your Name</label>
                  <input
                    value={playerName}
                    onChange={(e) => { setPlayerName(e.target.value); setNameError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (mode === "create" ? handleCreate() : handleJoin())}
                    placeholder="Enter your name..."
                    maxLength={20}
                    autoFocus
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/70 transition-colors"
                  />
                </div>

                {mode === "join" && (
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">Room Code</label>
                    <input
                      value={joinCode}
                      onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setNameError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                      placeholder="e.g. ABC123"
                      maxLength={8}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/70 transition-colors font-mono text-lg tracking-widest uppercase"
                    />
                  </div>
                )}

                {nameError && (
                  <p className="text-red-400 text-xs">{nameError}</p>
                )}

                <motion.button
                  onClick={mode === "create" ? handleCreate : handleJoin}
                  disabled={!isConnected}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {mode === "create" ? "Create Room 🚀" : "Join Game 🚪"}
                </motion.button>

                {!isConnected && (
                  <p className="text-center text-yellow-400 text-xs animate-pulse">
                    Connecting to server...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-slate-700 text-xs mt-4">
          Mr. Worldwide • Global Monopoly
        </p>
      </motion.div>
    </div>
  );
}
