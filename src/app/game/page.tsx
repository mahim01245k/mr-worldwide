"use client";
import { useEffect, useCallback, useState, useRef } from "react";
import { Yanone_Kaffeesatz } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store/gameStore";
import { useSocket } from "@/hooks/useSocket";
import { GameBoard } from "@/components/board/GameBoard";
import { Notifications } from "@/components/ui/Notifications";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { BOARD_TILES } from "@/lib/game/boardData";
import { Copy, RotateCcw, Send, Home, Hotel, DollarSign, Trophy } from "lucide-react";
import { TileDetail } from "@/components/board/TileDetail";

const yanone = Yanone_Kaffeesatz({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-yanone",
});

// ── Game Over Modal ──────────────────────────────────────────────────────────
function GameOverModal() {
  const { gameState, myPlayerId } = useGameStore();
  const router = useRouter();
  if (!gameState || gameState.phase !== "finished") return null;
  const winner = gameState.players.find(p => p.id === gameState.winner);
  const isWinner = winner?.id === myPlayerId;
  const ranked = [...gameState.players].sort((a, b) => b.netWorth - a.netWorth);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#282828] border border-[#3a3a3a] rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">{isWinner ? "🏆" : "🎮"}</div>
        <h2 className="text-3xl font-black text-white mb-2 font-yanone">{isWinner ? "You Won!" : "Game Over!"}</h2>
        {winner && <p className="text-[#cccccc] mb-6 font-yanone">{winner.name} wins with ${winner.netWorth.toLocaleString()} net worth!</p>}
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
        <button onClick={() => router.push("/lobby")} className="w-full flex items-center justify-center gap-2 bg-[#00e701] hover:bg-[#00cc00] text-black font-bold py-3.5 rounded-xl font-yanone">
          <RotateCcw size={16} /> Play Again
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Activity Log with rich entries ──────────────────────────────────────────
const LOG_ICONS: Record<string, string> = {
  move: "🚀", purchase: "🏙️", rent: "💸", tax: "🏛️", card: "🎴", trade: "🤝", upgrade: "🏗️", jail: "🔒", bankrupt: "💀", system: "⚙️",
};
const LOG_COLORS: Record<string, string> = {
  move: "#00e701", // Green
  purchase: "#00e701", // Green
  rent: "#ff4d4d", // Red
  tax: "#ff9900", // Orange
  card: "#9966ff", // Purple
  trade: "#00ccff", // Light Blue
  upgrade: "#ffcc00", // Yellow
  jail: "#888888", // Grey
  bankrupt: "#ff4d4d", // Red
  system: "#cccccc", // Light Grey
};

function ActivityLog() {
  const { gameState } = useGameStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const logs = gameState?.log ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <span className="text-[#cccccc] text-xs font-bold uppercase tracking-wider mb-2 flex-shrink-0 font-yanone">
        Activity
      </span>
      <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
        <AnimatePresence initial={false}>
          {logs.slice(-60).map(log => (
            <motion.div key={log.id}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-1.5 text-xs py-1 border-b border-white/5">
              <span className="flex-shrink-0 mt-0.5">{LOG_ICONS[log.type] ?? "•"}</span>
              <p className="leading-relaxed" style={{ color: LOG_COLORS[log.type] ?? "#94a3b8" }}>
                {log.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
          <p className="text-[#888888] text-xs text-center mt-4 font-yanone">Game not started yet…</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── Main Game Page ───────────────────────────────────────────────────────────
export default function GamePage() {
  const { gameState, myPlayerId, roomCode, isConnected } = useGameStore();
  const {
    rollDice, buyProperty, declinePurchase, auctionBid, processCard,
    useJailCard, payJailFine, respondTrade, sendChat,
    buildHouse, buildHotel, mortgageProperty, proposeTrade,
  } = useSocket();
  const router = useRouter();

  const [chatInput, setChatInput]     = useState("");
  const [bidAmount, setBidAmount]     = useState(10);
  const [rolling, setRolling]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeTarget, setTradeTarget] = useState("");
  const [tradeCash, setTradeCash]     = useState(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!gameState) router.push("/lobby"); }, [gameState, router]);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState?.chat?.length]);

  if (!gameState) return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-4xl mb-4 animate-spin">🌍</div>
        <p>Loading...</p>
      </div>
    </div>
  );

  const myPlayer       = gameState.players.find(p => p.id === myPlayerId);
  const currentPlayer  = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn       = currentPlayer?.id === myPlayerId;
  const canRoll        = isMyTurn && gameState.phase === "rolling";
  const myProps        = gameState.properties.filter(p => p.ownerId === myPlayerId);

  const handleRoll = () => {
    if (!canRoll || rolling) return;
    setRolling(true);
    rollDice();
    setTimeout(() => setRolling(false), 600);
  };

  const handleCopy = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) { sendChat(chatInput.trim()); setChatInput(""); }
  };

  // Buy panel rendered INSIDE the SVG board (no bottom bar)
  const myPosition = myPlayer?.position ?? 0;
  const myTile     = BOARD_TILES.find(t => t.id === myPosition);

  const buyPanel = gameState.phase === "buying" && isMyTurn && myTile ? (
    <div className="bg-[#282828]/95 border border-[#3a3a3a] rounded-xl p-3 w-full backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        {myTile.flagCode
          ? <img src={`https://flagcdn.com/w40/${myTile.flagCode}.png`} alt="" className="w-7 h-7 rounded-full object-cover border border-white/20" />
          : <span className="text-2xl">🏙️</span>
        }
        <div>
          <p className="text-white font-bold text-sm leading-none font-yanone">{myTile.name}</p>
          <p className="text-[#cccccc] text-xs font-yanone">{myTile.subname} · ${myTile.price}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => buyProperty()}
          disabled={(myPlayer?.cash ?? 0) < (myTile.price ?? 0)}
          className="flex-1 bg-[#00e701] hover:bg-[#00cc00] disabled:opacity-40 text-black font-bold py-1.5 rounded-lg text-xs font-yanone">
          Buy ${myTile.price}
        </button>
        <button onClick={() => declinePurchase()}
          className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-bold py-1.5 rounded-lg text-xs font-yanone">
          Auction 🔨
        </button>
      </div>
    </div>
  ) : null;

  // Auction — also inline in board space if needed, but we log and show a minimal
  // non-layout-breaking overlay inside the board SVG foreignObject
  const auctionPanel = gameState.phase === "auction" && gameState.currentAuction ? (
    <div className="bg-[#282828]/95 border border-[#3a3a3a] rounded-xl p-3 w-full backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#ffcc00] font-bold text-xs font-yanone">
          🔨 {BOARD_TILES.find(t => t.id === gameState.currentAuction!.tileId)?.name}
        </span>
        <span className="text-white font-bold text-sm font-yanone">${gameState.currentAuction.currentBid}</span>
      </div>
      <div className="flex gap-2">
        <input type="number" value={bidAmount}
          min={gameState.currentAuction.currentBid + 10} step={10}
          onChange={e => setBidAmount(parseInt(e.target.value))}
          className="flex-1 bg-black/40 border border-[#3a3a3a] rounded-lg px-2 py-1 text-white text-xs font-yanone" />
        <button onClick={() => auctionBid(bidAmount)}
          disabled={(myPlayer?.cash ?? 0) < bidAmount}
          className="bg-[#ffcc00] hover:bg-[#e6b800] disabled:opacity-40 text-black font-bold px-3 rounded-lg text-xs font-yanone">
          Bid
        </button>
      </div>
    </div>
  ) : null;

  // Card — just needs an OK button (text is already in activity log)
  const cardPanel = gameState.phase === "card" && gameState.currentCard && isMyTurn ? (
    <div className="bg-[#282828]/95 border border-[#3a3a3a] rounded-xl p-3 w-full text-center backdrop-blur-sm">
      <p className="text-[#cccccc] text-xs mb-2 font-yanone">{gameState.currentCard.card.text}</p>
      <button onClick={() => processCard()}
        className="bg-[#00e701] hover:bg-[#00cc00] text-black font-bold py-1.5 px-6 rounded-lg text-xs font-yanone">
        OK, Got it!
      </button>
    </div>
  ) : null;

  // Jail options
  const jailPanel = myPlayer?.inJail && isMyTurn && gameState.phase === "rolling" ? (
    <div className="bg-[#282828]/95 border border-[#3a3a3a] rounded-xl p-3 w-full backdrop-blur-sm">
      <p className="text-white font-bold text-xs text-center mb-2 font-yanone">
        🔒 Jail — Turn {myPlayer.jailTurns}/3
      </p>
      <div className="flex gap-2">
        {myPlayer.jailFreeCards > 0 && (
          <button onClick={() => useJailCard()}
            className="flex-1 bg-[#ffcc00] hover:bg-[#e6b800] text-black font-bold py-1.5 rounded-lg text-xs font-yanone">
            Use Card 🎫
          </button>
        )}
        {myPlayer.cash >= 50 && (
          <button onClick={() => payJailFine()} className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-bold py-1.5 rounded-lg text-xs font-yanone">
            Pay $50
          </button>
        )}
      </div>
    </div>
  ) : null;

  // Trade response
  const tradePanel = gameState.phase === "trading" && gameState.pendingTrade
    && gameState.pendingTrade.toPlayerId === myPlayerId ? (
    <div className="bg-[#282828]/95 border border-[#3a3a3a] rounded-xl p-3 w-full backdrop-blur-sm">
      <p className="text-[#00ccff] font-bold text-xs mb-2 font-yanone">
        🤝 Trade from <span className="text-white">{gameState.players.find(p => p.id === gameState.pendingTrade?.fromPlayerId)?.name}</span>
      </p>
      <div className="flex gap-2">
        <button onClick={() => respondTrade(true)}
          className="flex-1 bg-[#00e701] hover:bg-[#00cc00] text-black font-bold py-1.5 rounded-lg text-xs font-yanone">
          Accept ✓
        </button>
        <button onClick={() => respondTrade(false)}
          className="flex-1 bg-[#ff4d4d] hover:bg-[#cc3333] text-white font-bold py-1.5 rounded-lg text-xs font-yanone">
          Decline ✗
        </button>
      </div>
    </div>
  ) : null;

  // Pick whichever action panel is active — passed into board SVG foreignObject
  const activePanel = buyPanel ?? auctionPanel ?? cardPanel ?? jailPanel ?? tradePanel ?? null;

  return (
    <div className={`${yanone.variable} h-screen overflow-hidden flex flex-col font-sans`} style={{ background: "#1a1a1a" }}>
      <Notifications />
      <GameOverModal />

      {/* ── 3-COLUMN LAYOUT fills entire viewport height ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-72 flex flex-col border-r border-[#3a3a3a] min-h-0 flex-shrink-0"
          style={{ background: "#282828" }}>

          {/* Brand & share */}
          <div className="p-4 border-b border-[#3a3a3a] flex-shrink-0" style={{ background: "#282828" }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-black text-white tracking-tight">
                MR.<span className="text-violet-400">WORLDWIDE</span>
              </span>
              <div className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${isConnected ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                {isConnected ? "Online" : "Offline"}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-[#0f0d20] border border-white/10 rounded-lg px-3 py-2">
              <span className="text-[#00e701] font-mono text-xs truncate flex-1">
                {typeof window !== "undefined" ? window.location.origin : ""}/room/{roomCode}
              </span>
              <button onClick={handleCopy} className="text-[#cccccc] hover:text-white transition-colors ml-1">
                {copied ? <span className="text-[#00e701] text-xs">✓</span> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Chat — grows to fill */}
          <div className="flex-1 flex flex-col min-h-0 p-3">
            <span className="text-white font-bold text-sm mb-2 flex-shrink-0 font-yanone">Chat</span>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 mb-2">
              {gameState.chat.length === 0 && (
                <p className="text-[#888888] text-xs text-center pt-4 font-yanone">No messages yet</p>
              )}
              {gameState.chat.map(msg => (
                <div key={msg.id} className="text-xs">
                  <span className="font-bold mr-1" style={{ color: PLAYER_COLOR_HEX[msg.playerColor] }}>
                    {msg.playerName}:
                  </span>
                  <span className="text-slate-300">{msg.message}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <form onSubmit={handleChat} className="flex gap-2 flex-shrink-0">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Say something..." maxLength={200}
                className="flex-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-3 py-2 text-white text-xs placeholder:text-[#888888] focus:outline-none focus:border-[#00e701]" />
              <button type="submit" disabled={!chatInput.trim()}
                className="bg-[#00e701] hover:bg-[#00cc00] disabled:opacity-30 text-black rounded-lg px-3 py-2">
                <Send size={12} />
              </button>
            </form>
          </div>

          {/* Activity log — fixed height at bottom */}
          <div className="h-52 border-t border-[#3a3a3a] p-3 flex flex-col min-h-0 flex-shrink-0"
            style={{ background: "#1a1a1a" }}>
            <ActivityLog />
          </div>
        </div>

        {/* ── CENTER: BOARD ONLY — no bottom bar ── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">

          {/* Board fills ALL remaining height — no bottom bar */}
          <div className="flex-1 w-full flex items-center justify-center min-h-0 p-2">
            <div className="w-full h-full max-w-[min(100%,calc(100vh-2rem))] max-h-[min(100%,calc(100vw-36rem))] aspect-square relative">
              <GameBoard
      onRoll={handleRoll}
      canRoll={canRoll}
      rolling={rolling}
      isMyTurn={isMyTurn}
      phase={gameState.phase}
      buyPanel={activePanel}
    />
              <TileDetail/>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-72 flex flex-col border-l border-[#3a3a3a] min-h-0 flex-shrink-0"
          style={{ background: "#282828" }}>

          {/* Players */}
          <div className="p-3 border-b border-white/10 flex-shrink-0">
            <div className="space-y-1.5">
              {gameState.players.map(player => {
                const color = PLAYER_COLOR_HEX[player.color];
                const isCurrent = player.id === currentPlayer?.id;
                return (
                  <div key={player.id}
                    className={`flex items-center gap-2 p-2 rounded-xl transition-all border ${isCurrent ? "" : "border-transparent"}`}
                    style={isCurrent ? { borderColor: `${color}50`, background: `${color}10` } : {}}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-base border-2 flex-shrink-0"
                      style={{ borderColor: color, background: `${color}20` }}>
                      {player.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-white font-bold text-sm truncate font-yanone">{player.name}</p>
                        {player.id === myPlayerId && <span className="text-[#00e701] text-xs font-yanone">(you)</span>}
                        {gameState.players[0].id === player.id && <span className="text-[#ffcc00] text-xs font-yanone">👑</span>}
                      </div>
                      <p className="text-[#00e701] text-xs font-bold font-yanone">${player.cash.toLocaleString()}</p>
                    </div>
                    {player.isBankrupt && <span className="text-[#ff4d4d] text-xs">💀</span>}
                    {player.inJail && <span className="text-[#cccccc] text-xs">🔒</span>}
                    {!player.isConnected && <span className="text-[#ff4d4d] text-xs">⚡</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Votekick / Bankrupt */}
          <div className="px-3 py-2 border-b border-[#3a3a3a] flex gap-2 flex-shrink-0">
            <button className="flex-1 text-xs bg-[#3a3a3a]/60 hover:bg-[#4a4a4a] text-[#cccccc] rounded-lg py-1.5 transition-colors font-yanone">
              Votekick
            </button>
            <button className="flex-1 text-xs bg-[#ff4d4d]/40 hover:bg-[#ff4d4d]/60 text-[#ff4d4d] rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1 font-yanone">
              <Trophy size={10} /> Bankrupt
            </button>
          </div>

          {/* Trades */}
          <div className="p-3 border-b border-white/10 flex-shrink-0">
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
                      placeholder="Offer cash" min={0}
                      className="w-full bg-[#0f0d20] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs" />
                    <button
                      onClick={() => {
                        if (!tradeTarget) return;
                        proposeTrade({ toPlayerId: tradeTarget, fromCash: tradeCash, toCash: 0, fromProperties: [], toProperties: [], fromJailCards: 0, toJailCards: 0 });
                        setShowTradeForm(false);
                      }}
                      disabled={!tradeTarget}
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
            <p className="text-white font-bold text-sm mb-2 flex-shrink-0 font-yanone">
              My properties ({myProps.length})
            </p>
            {myProps.length === 0 && (
              <p className="text-[#888888] text-xs text-center py-2 font-yanone">No properties yet</p>
            )}
            <div className="space-y-1.5">
              {myProps.map(ownership => {
                const tile = BOARD_TILES.find(t => t.id === ownership.tileId);
                if (!tile) return null;
                return (
                  <div key={tile.id} className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      {tile.flagCode
                        ? <img src={`https://flagcdn.com/w40/${tile.flagCode}.png`} alt="" className="w-6 h-6 rounded-full object-cover border border-white/20 flex-shrink-0" />
                        : <span className="text-base">🏙️</span>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate">{tile.name}</p>
                        <p className="text-[#cccccc] text-xs">
                          {ownership.hasHotel ? "🏨 Hotel"
                            : ownership.houses > 0 ? "🏠".repeat(ownership.houses)
                            : "No buildings"}
                        </p>
                      </div>
                      {ownership.isMortgaged && <span className="text-[#ff4d4d] text-xs">M</span>}
                    </div>
                    <div className="flex gap-1">
                      {!ownership.isMortgaged && !ownership.hasHotel && ownership.houses < 4 && tile.houseCost && (
                        <button onClick={() => buildHouse(tile.id)}
                          disabled={(myPlayer?.cash ?? 0) < tile.houseCost}
                          className="flex-1 flex items-center justify-center gap-0.5 bg-[#00e701]/40 hover:bg-[#00e701]/60 disabled:opacity-30 text-[#00e701] border border-[#00e701]/30 rounded py-1 text-xs font-yanone">
                          <Home size={8} /> ${tile.houseCost}
                        </button>
                      )}
                      {!ownership.isMortgaged && !ownership.hasHotel && ownership.houses === 4 && tile.hotelCost && (
                        <button onClick={() => buildHotel(tile.id)}
                          disabled={(myPlayer?.cash ?? 0) < tile.hotelCost}
                          className="flex-1 flex items-center justify-center gap-0.5 bg-red-900/40 hover:bg-red-900/60 disabled:opacity-30 text-red-400 border border-red-700/30 rounded py-1 text-xs">
                          <Hotel size={8} /> ${tile.hotelCost}
                        </button>
                      )}
                      <button onClick={() => mortgageProperty(tile.id)}
                        disabled={ownership.isMortgaged}
                        className="flex-1 flex items-center justify-center gap-0.5 bg-[#3a3a3a]/60 hover:bg-[#4a4a4a] disabled:opacity-30 text-[#cccccc] border border-[#3a3a3a]/30 rounded py-1 text-xs font-yanone">
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