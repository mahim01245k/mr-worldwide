"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store/gameStore";
import { useSocket } from "@/hooks/useSocket";
import { GameBoard } from "@/components/board/GameBoard";
import { TileDetail } from "@/components/board/TileDetail";
import { Notifications } from "@/components/ui/Notifications";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { BOARD_TILES } from "@/lib/game/boardData";
import { Copy, Settings, Trophy, RotateCcw, Send, Home, Hotel, DollarSign } from "lucide-react";
import { useState, useRef } from "react";

// ── Dice component ──────────────────────────────────────────────────────────
function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[20, 20], [80, 20], [20, 50], [80, 50], [20, 80], [80, 80]],
  };
  return (
    <motion.div
      className="w-16 h-16 rounded-xl bg-white shadow-2xl relative select-none"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.6)" }}
      animate={rolling ? { rotate: [-15, 15, -10, 10, 0], scale: [1, 1.1, 0.95, 1.05, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {(dots[value] || dots[1]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={8} fill="#1e293b" />
        ))}
      </svg>
    </motion.div>
  );
}

// ── Game Over Modal ─────────────────────────────────────────────────────────
function GameOverModal() {
  const { gameState, myPlayerId } = useGameStore();
  const router = useRouter();
  if (!gameState || gameState.phase !== "finished") return null;
  const winner = gameState.players.find(p => p.id === gameState.winner);
  const isWinner = winner?.id === myPlayerId;
  const ranked = [...gameState.players].sort((a, b) => b.netWorth - a.netWorth);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a1530] border border-[#2d2550] rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">{isWinner ? "🏆" : "🎮"}</div>
        <h2 className="text-3xl font-black text-white mb-2">{isWinner ? "You Won!" : "Game Over!"}</h2>
        {winner && <p className="text-slate-400 mb-6">{winner.name} wins with ${winner.netWorth.toLocaleString()} net worth!</p>}
        <div className="space-y-2 mb-6">
          {ranked.map((player, i) => (
            <div key={player.id} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-yellow-900/30 border border-yellow-700/40" : "bg-slate-800/60"}`}>
              <span className="text-xl">{["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣"][i]}</span>
              <span className="text-lg">{player.avatar}</span>
              <span className="text-white font-bold flex-1 text-left">{player.name}</span>
              <span className="text-yellow-400 font-bold">${player.netWorth.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <button onClick={() => router.push("/lobby")}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-xl transition-all">
          <RotateCcw size={16} /> Play Again
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Game Page ──────────────────────────────────────────────────────────
export default function GamePage() {
  const { gameState, myPlayerId, roomCode, isConnected, selectedTileId } = useGameStore();
  const { rollDice, buyProperty, declinePurchase, auctionBid, processCard,
          useJailCard, payJailFine, respondTrade, sendChat, buildHouse, buildHotel,
          mortgageProperty, proposeTrade } = useSocket();
  const router = useRouter();
  const [chatInput, setChatInput] = useState("");
  const [bidAmount, setBidAmount] = useState(10);
  const [rolling, setRolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeTarget, setTradeTarget] = useState("");
  const [tradeCash, setTradeCash] = useState(0);
  const [tradeFromProps, setTradeFromProps] = useState<number[]>([]);
  const [tradeToProps, setTradeToProps] = useState<number[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const logBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!gameState) router.push("/lobby"); }, [gameState, router]);
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [gameState?.chat?.length]);
  useEffect(() => { logBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [gameState?.log?.length]);

  if (!gameState) return (
    <div className="min-h-screen bg-[#12102a] flex items-center justify-center">
      <div className="text-white text-center"><div className="text-4xl mb-4 animate-spin">🌍</div><p>Loading...</p></div>
    </div>
  );

  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const canRoll = isMyTurn && gameState.phase === "rolling";
  const myProps = gameState.properties.filter(p => p.ownerId === myPlayerId);

  const handleRoll = () => {
    if (!canRoll || rolling) return;
    setRolling(true);
    rollDice();
    setTimeout(() => setRolling(false), 600);
  };

  const handleCopy = () => {
    if (roomCode) { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) { sendChat(chatInput.trim()); setChatInput(""); }
  };

  const handleTrade = () => {
    if (!tradeTarget) return;
    proposeTrade({ toPlayerId: tradeTarget, fromCash: tradeCash, toCash: 0, fromProperties: tradeFromProps, toProperties: tradeToProps, fromJailCards: 0, toJailCards: 0 });
    setShowTradeForm(false);
  };

  // Current tile for buying panel
  const myPosition = myPlayer?.position ?? 0;
  const myTile = BOARD_TILES.find(t => t.id === myPosition);
  const selectedTile = selectedTileId !== null ? BOARD_TILES.find(t => t.id === selectedTileId) : null;

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#12102a" }}>
      <Notifications />
      <GameOverModal />

      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10" style={{ background: "#1a1730" }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-white tracking-tight">
            MR.<span className="text-violet-400">WORLDWIDE</span>
          </span>
          <div className={`text-xs px-2 py-0.5 rounded-full ${isConnected ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
            {isConnected ? "● Online" : "○ Offline"}
          </div>
        </div>

        {/* Share box */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Share this game</span>
          <div className="flex items-center gap-1 bg-[#0f0d20] border border-white/10 rounded-lg px-3 py-1.5">
            <span className="text-violet-300 font-mono text-sm">{typeof window !== "undefined" ? window.location.origin : ""}/room/{roomCode}</span>
            <button onClick={handleCopy} className="ml-2 text-slate-400 hover:text-white transition-colors">
              {copied ? <span className="text-green-400 text-xs">✓ Copied!</span> : <Copy size={14} />}
            </button>
          </div>
          <button className="flex items-center gap-1 text-xs border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/5 transition-colors">
            <Settings size={12} /> View room settings
          </button>
        </div>

        {/* Current turn */}
        <div className="flex items-center gap-2">
          {currentPlayer && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{ borderColor: `${PLAYER_COLOR_HEX[currentPlayer.color]}50`, background: `${PLAYER_COLOR_HEX[currentPlayer.color]}15` }}>
              <span style={{ color: PLAYER_COLOR_HEX[currentPlayer.color] }}>{currentPlayer.avatar}</span>
              <span className="text-white text-sm font-bold">{isMyTurn ? "Your turn" : `${currentPlayer.name} is playing...`}</span>
            </div>
          )}
          <span className="text-slate-500 text-xs">Round {gameState.round}/{gameState.maxRounds}</span>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-72 flex flex-col border-r border-white/10 min-h-0" style={{ background: "#15132a" }}>
          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-sm">Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 mb-2">
              {gameState.chat.length === 0 && (
                <p className="text-slate-600 text-xs text-center pt-4">No messages yet</p>
              )}
              {gameState.chat.map(msg => (
                <div key={msg.id} className="text-xs">
                  <span className="font-bold mr-1" style={{ color: PLAYER_COLOR_HEX[msg.playerColor] }}>{msg.playerName}:</span>
                  <span className="text-slate-300">{msg.message}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <form onSubmit={handleChat} className="flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Say something..." maxLength={200}
                className="flex-1 bg-[#0f0d20] border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50" />
              <button type="submit" disabled={!chatInput.trim()}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white rounded-lg px-3 py-2">
                <Send size={12} />
              </button>
            </form>
          </div>

          {/* Activity Log */}
          <div className="h-48 border-t border-white/10 p-3 flex flex-col min-h-0" style={{ background: "#0f0d20" }}>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Activity</span>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              {gameState.log.slice(-30).map(entry => (
                <div key={entry.id} className="text-xs text-slate-400 leading-relaxed border-b border-white/5 pb-1">
                  {entry.message}
                </div>
              ))}
              <div ref={logBottomRef} />
            </div>
          </div>
        </div>

        {/* ── CENTER: BOARD ── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Board area */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative">
            <GameBoard onRoll={function (): void {
              throw new Error("Function not implemented.");
            } } rolling={false} />
            <TileDetail />
          </div>

          {/* Bottom controls */}
          <div className="border-t border-white/10 p-4" style={{ background: "#15132a" }}>
            <div className="flex items-start gap-6 max-w-3xl mx-auto">
              {/* Dice */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-3">
                  <Die value={gameState.diceValues[0]} rolling={rolling} />
                  <Die value={gameState.diceValues[1]} rolling={rolling} />
                </div>
                {gameState.phase !== "waiting" && (
                  <p className="text-slate-400 text-xs text-center">
                    Total: <span className="text-white font-bold">{gameState.diceValues[0] + gameState.diceValues[1]}</span>
                    {gameState.diceValues[0] === gameState.diceValues[1] && <span className="text-yellow-400 ml-1">Double!</span>}
                  </p>
                )}
                <motion.button onClick={handleRoll} disabled={!canRoll || rolling}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${canRoll && !rolling ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
                  whileTap={canRoll ? { scale: 0.95 } : {}}>
                  {rolling ? "Rolling..." : isMyTurn && gameState.phase === "rolling" ? "Roll Dice 🎲" : "Waiting..."}
                </motion.button>
              </div>

              {/* Action area */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {/* BUYING */}
                  {gameState.phase === "buying" && isMyTurn && myTile && (
                    <motion.div key="buy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-[#0f0d20] border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{myTile.flag || "🏙️"}</span>
                        <div>
                          <p className="text-white font-bold">{myTile.name}</p>
                          <p className="text-slate-400 text-xs">{myTile.subname} • ${myTile.price}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => buyProperty()} disabled={(myPlayer?.cash ?? 0) < (myTile.price ?? 0)}
                          className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold py-2 rounded-lg text-sm">
                          Buy for ${myTile.price}
                        </button>
                        <button onClick={() => declinePurchase()}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm">
                          Auction 🔨
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* AUCTION */}
                  {gameState.phase === "auction" && gameState.currentAuction && (
                    <motion.div key="auction" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-amber-950/40 border border-amber-700/40 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-amber-400 font-bold text-sm">🔨 Auction: {BOARD_TILES.find(t => t.id === gameState.currentAuction!.tileId)?.name}</span>
                        <span className="text-white font-bold">${gameState.currentAuction.currentBid}</span>
                      </div>
                      <div className="flex gap-2">
                        <input type="number" value={bidAmount} min={gameState.currentAuction.currentBid + 10} step={10}
                          onChange={e => setBidAmount(parseInt(e.target.value))}
                          className="flex-1 bg-[#0f0d20] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm" />
                        <button onClick={() => auctionBid(bidAmount)} disabled={(myPlayer?.cash ?? 0) < bidAmount}
                          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold px-4 rounded-lg text-sm">
                          Bid
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* CARD */}
                  {gameState.phase === "card" && gameState.currentCard && (
                    <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`border rounded-xl p-4 ${gameState.currentCard.type === "treasure" ? "bg-amber-950/30 border-amber-700/40" : "bg-purple-950/30 border-purple-700/40"}`}>
                      <div className="text-3xl mb-2 text-center">{gameState.currentCard.type === "treasure" ? "💰" : "🎴"}</div>
                      <p className="text-white text-sm text-center mb-3">{gameState.currentCard.card.text}</p>
                      {isMyTurn && (
                        <button onClick={() => processCard()}
                          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg text-sm">
                          OK, Got it!
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* JAIL */}
                  {myPlayer?.inJail && isMyTurn && gameState.phase === "rolling" && (
                    <motion.div key="jail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
                      <p className="text-white font-bold text-center mb-3">🔒 You're in Jail! (Turn {myPlayer.jailTurns}/3)</p>
                      <div className="flex gap-2">
                        {myPlayer.jailFreeCards > 0 && (
                          <button onClick={() => useJailCard()} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded-lg text-sm">
                            Use Free Card 🎫
                          </button>
                        )}
                        {myPlayer.cash >= 50 && (
                          <button onClick={() => payJailFine()} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm">
                            Pay $50
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TRADE */}
                  {gameState.phase === "trading" && gameState.pendingTrade && (
                    <motion.div key="trade" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-blue-950/30 border border-blue-700/40 rounded-xl p-4">
                      {gameState.pendingTrade.toPlayerId === myPlayerId ? (
                        <>
                          <p className="text-blue-400 font-bold text-sm mb-2">🤝 Trade offer from {gameState.players.find(p => p.id === gameState.pendingTrade?.fromPlayerId)?.name}</p>
                          <div className="flex gap-2">
                            <button onClick={() => respondTrade(true)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg text-sm">Accept ✓</button>
                            <button onClick={() => respondTrade(false)} className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-sm">Decline ✗</button>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-400 text-sm text-center">Waiting for trade response...</p>
                      )}
                    </motion.div>
                  )}

                  {/* Selected tile info */}
                  {selectedTile && !["buying","auction","card","trading"].includes(gameState.phase) && (
                    <motion.div key="tileinfo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-[#0f0d20] border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedTile.flag || "🏙️"}</span>
                        <div>
                          <p className="text-white font-bold text-sm">{selectedTile.name}</p>
                          <p className="text-slate-400 text-xs">{selectedTile.subname} {selectedTile.price ? `• $${selectedTile.price}` : ""}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-72 flex flex-col border-l border-white/10 min-h-0" style={{ background: "#15132a" }}>
          {/* Players list */}
          <div className="p-3 border-b border-white/10">
            <div className="space-y-1.5">
              {gameState.players.map(player => {
                const color = PLAYER_COLOR_HEX[player.color];
                const isCurrent = player.id === currentPlayer?.id;
                return (
                  <div key={player.id} className={`flex items-center gap-2 p-2 rounded-xl transition-all ${isCurrent ? "border" : "border border-transparent"}`}
                    style={isCurrent ? { borderColor: `${color}50`, background: `${color}10` } : {}}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-base border-2 flex-shrink-0"
                      style={{ borderColor: color, background: `${color}20` }}>
                      {player.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-white font-bold text-sm truncate">{player.name}</p>
                        {player.id === myPlayerId && <span className="text-violet-400 text-xs">(you)</span>}
                        {gameState.players[0].id === player.id && <span className="text-yellow-400 text-xs">👑</span>}
                      </div>
                      <p className="text-green-400 text-xs font-bold">${player.cash.toLocaleString()}</p>
                    </div>
                    {player.isBankrupt && <span className="text-red-400 text-xs">💀</span>}
                    {player.inJail && <span className="text-slate-400 text-xs">🔒</span>}
                    {!player.isConnected && <span className="text-red-400 text-xs">⚡</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Votekick / Bankrupt */}
          <div className="px-3 py-2 border-b border-white/10 flex gap-2">
            <button className="flex-1 text-xs bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-lg py-1.5 transition-colors">
              Votekick
            </button>
            <button className="flex-1 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1">
              <Trophy size={10} /> Bankrupt
            </button>
          </div>

          {/* Trades section */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-sm">Trades</span>
              <button onClick={() => setShowTradeForm(!showTradeForm)}
                className="text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-400 border border-violet-700/40 rounded-lg px-2 py-1">
                + Create
              </button>
            </div>
            <AnimatePresence>
              {showTradeForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="space-y-2 pb-2">
                    <select value={tradeTarget} onChange={e => setTradeTarget(e.target.value)}
                      className="w-full bg-[#0f0d20] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs">
                      <option value="">Select player...</option>
                      {gameState.players.filter(p => p.id !== myPlayerId && !p.isBankrupt).map(p => (
                        <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
                      ))}
                    </select>
                    <input type="number" value={tradeCash} onChange={e => setTradeCash(parseInt(e.target.value) || 0)}
                      placeholder="Offer cash amount" min={0}
                      className="w-full bg-[#0f0d20] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs" />
                    <button onClick={handleTrade} disabled={!tradeTarget}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-1.5 rounded-lg text-xs">
                      Send Offer 🤝
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* My Properties */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            <p className="text-white font-bold text-sm mb-2">My properties ({myProps.length})</p>
            {myProps.length === 0 && (
              <p className="text-slate-600 text-xs text-center py-2">No properties yet</p>
            )}
            <div className="space-y-1.5">
              {myProps.map(ownership => {
                const tile = BOARD_TILES.find(t => t.id === ownership.tileId);
                if (!tile) return null;
                return (
                  <div key={tile.id} className="bg-[#0f0d20] border border-white/10 rounded-xl p-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{tile.flag || "🏙️"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate">{tile.name}</p>
                        <p className="text-slate-500 text-xs">{ownership.hasHotel ? "🏨 Hotel" : ownership.houses > 0 ? `${"🏠".repeat(ownership.houses)}` : "No buildings"}</p>
                      </div>
                      {ownership.isMortgaged && <span className="text-red-400 text-xs">M</span>}
                    </div>
                    <div className="flex gap-1">
                      {!ownership.isMortgaged && !ownership.hasHotel && ownership.houses < 4 && tile.houseCost && (
                        <button onClick={() => buildHouse(tile.id)} disabled={(myPlayer?.cash ?? 0) < tile.houseCost}
                          className="flex-1 flex items-center justify-center gap-0.5 bg-green-900/40 hover:bg-green-900/60 disabled:opacity-30 text-green-400 border border-green-700/30 rounded py-1 text-xs transition-all">
                          <Home size={8} /> ${tile.houseCost}
                        </button>
                      )}
                      {!ownership.isMortgaged && !ownership.hasHotel && ownership.houses === 4 && tile.hotelCost && (
                        <button onClick={() => buildHotel(tile.id)} disabled={(myPlayer?.cash ?? 0) < tile.hotelCost}
                          className="flex-1 flex items-center justify-center gap-0.5 bg-red-900/40 hover:bg-red-900/60 disabled:opacity-30 text-red-400 border border-red-700/30 rounded py-1 text-xs transition-all">
                          <Hotel size={8} /> ${tile.hotelCost}
                        </button>
                      )}
                      <button onClick={() => mortgageProperty(tile.id)} disabled={ownership.isMortgaged}
                        className="flex-1 flex items-center justify-center gap-0.5 bg-slate-800/60 hover:bg-slate-700 disabled:opacity-30 text-slate-400 border border-slate-700/30 rounded py-1 text-xs transition-all">
                        <DollarSign size={8} /> {ownership.isMortgaged ? "Mortgaged" : "Mortgage"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
