"use client";
// src/components/game/ActionPanel.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { useSocket } from "@/hooks/useSocket";
import { BOARD_TILES, COLOR_HEX } from "@/lib/game/boardData";

export function ActionPanel() {
  const { gameState, myPlayerId } = useGameStore();
  const {
    buyProperty, declinePurchase, auctionBid, processCard,
    useJailCard, payJailFine, respondTrade
  } = useSocket();
  const [bidAmount, setBidAmount] = useState(0);

  if (!gameState) return null;

  const { phase, players, currentPlayerIndex, currentCard, currentAuction, pendingTrade } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isMyTurn = currentPlayer?.id === myPlayerId;

  const myPosition = myPlayer?.position ?? 0;
  const tile = BOARD_TILES.find((t) => t.id === myPosition);

  const renderBuyingPanel = () => {
    if (!tile || !tile.price) return null;
    const tileColor = tile.color && tile.color !== "none" ? COLOR_HEX[tile.color] : "#7c3aed";

    return (
      <div className="space-y-4">
        <div
          className="rounded-xl p-4 border"
          style={{ background: `${tileColor}15`, borderColor: `${tileColor}40` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{tile.flag || "🏙️"}</span>
            <div>
              <h3 className="text-white font-bold text-lg">{tile.name}</h3>
              <p className="text-slate-400 text-sm">{tile.subname}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div className="bg-black/20 rounded-lg p-2">
              <p className="text-slate-500 text-xs">Price</p>
              <p className="text-white font-bold">${tile.price}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <p className="text-slate-500 text-xs">Base Rent</p>
              <p className="text-green-400 font-bold">${tile.baseRent || "—"}</p>
            </div>
          </div>

          {tile.rentLevels && (
            <div className="space-y-1">
              <p className="text-slate-500 text-xs">Rent Levels:</p>
              <div className="flex gap-1 flex-wrap">
                {["Base", "1🏠", "2🏠", "3🏠", "4🏠", "🏨"].map((label, i) => (
                  <span key={i} className="bg-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-300">
                    {label}: ${tile.rentLevels![i]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={() => buyProperty()}
            disabled={!isMyTurn || (myPlayer?.cash ?? 0) < (tile.price || 0)}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Buy for ${tile.price}
          </motion.button>
          <motion.button
            onClick={() => declinePurchase()}
            disabled={!isMyTurn}
            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Auction 🔨
          </motion.button>
        </div>
      </div>
    );
  };

  const renderAuctionPanel = () => {
    if (!currentAuction) return null;
    const auctionTile = BOARD_TILES.find((t) => t.id === currentAuction.tileId);
    const highBidder = players.find((p) => p.id === currentAuction.currentBidderId);
    const timeLeft = Math.max(0, Math.floor((currentAuction.endsAt - Date.now()) / 1000));
    const minBid = currentAuction.currentBid + 10;

    return (
      <div className="space-y-4">
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-amber-400 font-bold flex items-center gap-2">
              🔨 Auction: {auctionTile?.name}
            </h3>
            <span className={`text-2xl font-bold ${timeLeft < 10 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Current Bid:</span>
              <span className="text-yellow-400 font-bold">${currentAuction.currentBid}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Leading:</span>
              <span className="text-white">{highBidder?.name || "No bids"}</span>
            </div>
          </div>

          {/* Bid history */}
          <div className="max-h-24 overflow-y-auto space-y-1 mb-3">
            {currentAuction.bids.slice(-5).reverse().map((bid, i) => {
              const bidder = players.find((p) => p.id === bid.playerId);
              return (
                <div key={i} className="flex justify-between text-xs text-slate-400">
                  <span>{bidder?.name}</span>
                  <span className="text-yellow-400">${bid.amount}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={bidAmount || minBid}
              onChange={(e) => setBidAmount(parseInt(e.target.value) || minBid)}
              min={minBid}
              step={10}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            />
            <motion.button
              onClick={() => auctionBid(bidAmount || minBid)}
              disabled={(myPlayer?.cash ?? 0) < (bidAmount || minBid)}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold px-4 rounded-lg transition-all"
              whileTap={{ scale: 0.95 }}
            >
              Bid
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  const renderCardPanel = () => {
    if (!currentCard) return null;
    const isMine = currentPlayer?.id === myPlayerId;
    const isChest = currentCard.type === "treasure";

    return (
      <div className="space-y-4">
        <motion.div
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className={`rounded-xl p-5 text-center border ${
            isChest
              ? "bg-amber-900/20 border-amber-600/40"
              : "bg-purple-900/20 border-purple-600/40"
          }`}
        >
          <div className="text-4xl mb-3">{isChest ? "💰" : "🎴"}</div>
          <h3 className={`font-bold text-lg mb-2 ${isChest ? "text-amber-400" : "text-purple-400"}`}>
            {isChest ? "Treasure Chest" : "Surprise Card"}
          </h3>
          <p className="text-white text-sm leading-relaxed">{currentCard.card.text}</p>
        </motion.div>

        {isMine && (
          <motion.button
            onClick={() => processCard()}
            className={`w-full font-bold py-3 rounded-xl transition-all ${
              isChest
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-purple-600 hover:bg-purple-500 text-white"
            }`}
            whileTap={{ scale: 0.97 }}
          >
            OK, Got it!
          </motion.button>
        )}
      </div>
    );
  };

  const renderJailPanel = () => {
    if (!myPlayer?.inJail || !isMyTurn || phase !== "rolling") return null;

    return (
      <div className="space-y-3">
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <div className="text-center mb-3">
            <span className="text-4xl">🔒</span>
            <h3 className="text-white font-bold mt-2">You're in Jail!</h3>
            <p className="text-slate-400 text-sm">Turns served: {myPlayer.jailTurns}/3</p>
          </div>

          <div className="space-y-2">
            {myPlayer.jailFreeCards > 0 && (
              <motion.button
                onClick={() => useJailCard()}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                whileTap={{ scale: 0.97 }}
              >
                Use Jail-Free Card 🎫
              </motion.button>
            )}
            {myPlayer.cash >= 50 && (
              <motion.button
                onClick={() => payJailFine()}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                whileTap={{ scale: 0.97 }}
              >
                Pay $50 Fine
              </motion.button>
            )}
            <p className="text-slate-500 text-xs text-center">Or roll doubles to escape!</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTradePanel = () => {
    if (!pendingTrade) return null;
    const isTarget = pendingTrade.toPlayerId === myPlayerId;
    const fromPlayer = players.find((p) => p.id === pendingTrade.fromPlayerId);
    const toPlayer = players.find((p) => p.id === pendingTrade.toPlayerId);

    if (!isTarget) {
      return (
        <div className="bg-slate-800/60 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">Trade proposal sent to {toPlayer?.name}...</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
          <h3 className="text-blue-400 font-bold mb-3">🤝 Trade Offer from {fromPlayer?.name}</h3>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div className="bg-black/20 rounded-lg p-2">
              <p className="text-slate-500 text-xs mb-1">They offer:</p>
              <p className="text-green-400">${pendingTrade.fromCash}</p>
              {pendingTrade.fromProperties.map((id) => {
                const t = BOARD_TILES.find((tile) => tile.id === id);
                return <p key={id} className="text-white text-xs">{t?.flag} {t?.name}</p>;
              })}
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <p className="text-slate-500 text-xs mb-1">They want:</p>
              <p className="text-red-400">${pendingTrade.toCash}</p>
              {pendingTrade.toProperties.map((id) => {
                const t = BOARD_TILES.find((tile) => tile.id === id);
                return <p key={id} className="text-white text-xs">{t?.flag} {t?.name}</p>;
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              onClick={() => respondTrade(true)}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-lg text-sm"
              whileTap={{ scale: 0.97 }}
            >
              Accept ✓
            </motion.button>
            <motion.button
              onClick={() => respondTrade(false)}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm"
              whileTap={{ scale: 0.97 }}
            >
              Decline ✗
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {phase === "buying" && isMyTurn && renderBuyingPanel()}
        {phase === "auction" && renderAuctionPanel()}
        {phase === "card" && renderCardPanel()}
        {myPlayer?.inJail && isMyTurn && phase === "rolling" && renderJailPanel()}
        {phase === "trading" && renderTradePanel()}
      </motion.div>
    </AnimatePresence>
  );
}
