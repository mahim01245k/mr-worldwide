"use client";
// src/components/game/PropertyManager.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { useSocket } from "@/hooks/useSocket";
import { BOARD_TILES, COLOR_HEX } from "@/lib/game/boardData";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { Home, Hotel, DollarSign, X } from "lucide-react";

interface TradePanelProps {
  onClose: () => void;
}

function TradePanel({ onClose }: TradePanelProps) {
  const { gameState, myPlayerId } = useGameStore();
  const { proposeTrade } = useSocket();
  const [targetPlayerId, setTargetPlayerId] = useState("");
  const [fromCash, setFromCash] = useState(0);
  const [toCash, setToCash] = useState(0);
  const [fromProps, setFromProps] = useState<number[]>([]);
  const [toProps, setToProps] = useState<number[]>([]);

  if (!gameState) return null;
  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const otherPlayers = gameState.players.filter((p) => p.id !== myPlayerId && !p.isBankrupt);
  const targetPlayer = gameState.players.find((p) => p.id === targetPlayerId);

  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">Propose Trade 🤝</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div>
        <label className="text-slate-400 text-xs mb-1 block">Trade with:</label>
        <select
          value={targetPlayerId}
          onChange={(e) => setTargetPlayerId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="">Select player...</option>
          {otherPlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
          ))}
        </select>
      </div>

      {targetPlayer && (
        <div className="grid grid-cols-2 gap-3">
          {/* My side */}
          <div>
            <p className="text-slate-400 text-xs mb-2">You offer:</p>
            <input
              type="number"
              value={fromCash}
              onChange={(e) => setFromCash(parseInt(e.target.value) || 0)}
              min={0}
              max={myPlayer?.cash}
              placeholder="Cash amount"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs mb-2"
            />
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {myPlayer?.properties.map((id) => {
                const tile = BOARD_TILES.find((t) => t.id === id);
                return (
                  <label key={id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fromProps.includes(id)}
                      onChange={(e) =>
                        setFromProps((prev) =>
                          e.target.checked ? [...prev, id] : prev.filter((p) => p !== id)
                        )
                      }
                      className="rounded"
                    />
                    <span className="text-xs text-slate-300">{tile?.flag} {tile?.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Their side */}
          <div>
            <p className="text-slate-400 text-xs mb-2">You want:</p>
            <input
              type="number"
              value={toCash}
              onChange={(e) => setToCash(parseInt(e.target.value) || 0)}
              min={0}
              max={targetPlayer.cash}
              placeholder="Cash amount"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs mb-2"
            />
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {targetPlayer.properties.map((id) => {
                const tile = BOARD_TILES.find((t) => t.id === id);
                return (
                  <label key={id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={toProps.includes(id)}
                      onChange={(e) =>
                        setToProps((prev) =>
                          e.target.checked ? [...prev, id] : prev.filter((p) => p !== id)
                        )
                      }
                      className="rounded"
                    />
                    <span className="text-xs text-slate-300">{tile?.flag} {tile?.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <motion.button
        onClick={() => {
          proposeTrade({ toPlayerId: targetPlayerId, fromCash, toCash, fromProperties: fromProps, toProperties: toProps, fromJailCards: 0, toJailCards: 0 });
          onClose();
        }}
        disabled={!targetPlayerId}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
        whileTap={{ scale: 0.97 }}
      >
        Send Trade Offer
      </motion.button>
    </div>
  );
}

export function PropertyManager() {
  const { gameState, myPlayerId } = useGameStore();
  const { buildHouse, buildHotel, mortgageProperty } = useSocket();
  const [showTrade, setShowTrade] = useState(false);

  if (!gameState) return null;

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  if (!myPlayer) return null;

  const myProperties = gameState.properties
    .filter((p) => p.ownerId === myPlayerId)
    .map((p) => ({
      ownership: p,
      tile: BOARD_TILES.find((t) => t.id === p.tileId)!,
    }))
    .filter((p) => p.tile);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-sm tracking-wider uppercase opacity-70">
          My Properties ({myProperties.length})
        </h2>
        <motion.button
          onClick={() => setShowTrade(!showTrade)}
          className="text-xs bg-blue-900/40 hover:bg-blue-900/60 text-blue-400 border border-blue-700/40 rounded-lg px-3 py-1.5 transition-all"
          whileTap={{ scale: 0.97 }}
        >
          Trade 🤝
        </motion.button>
      </div>

      <AnimatePresence>
        {showTrade && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TradePanel onClose={() => setShowTrade(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {myProperties.map(({ ownership, tile }) => {
          const tileColor = tile.color && tile.color !== "none" ? COLOR_HEX[tile.color] : "#475569";
          const canBuildHouse = !ownership.isMortgaged && !ownership.hasHotel && ownership.houses < 4 && tile.houseCost;
          const canBuildHotel = !ownership.isMortgaged && !ownership.hasHotel && ownership.houses === 4;

          return (
            <div
              key={tile.id}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: `${tileColor}40`, background: `${tileColor}08` }}
            >
              <div
                className="h-1.5 w-full"
                style={{ background: tileColor }}
              />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tile.flag || "🏙️"}</span>
                    <div>
                      <p className="text-white font-bold text-xs">{tile.name}</p>
                      <p className="text-slate-500 text-xs">{tile.subname}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {ownership.hasHotel ? (
                      <span title="Hotel" className="text-red-400">🏨</span>
                    ) : (
                      Array.from({ length: ownership.houses }).map((_, i) => (
                        <span key={i} title="House" className="text-green-400">🏠</span>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {canBuildHouse && (
                    <motion.button
                      onClick={() => buildHouse(tile.id)}
                      disabled={(myPlayer.cash) < (tile.houseCost || 0)}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-900/40 hover:bg-green-900/60 disabled:opacity-30 text-green-400 border border-green-700/40 rounded-lg py-1.5 text-xs transition-all"
                      whileTap={{ scale: 0.95 }}
                      title={`Build house ($${tile.houseCost})`}
                    >
                      <Home size={10} />
                      <span>${tile.houseCost}</span>
                    </motion.button>
                  )}
                  {canBuildHotel && (
                    <motion.button
                      onClick={() => buildHotel(tile.id)}
                      disabled={(myPlayer.cash) < (tile.hotelCost || 0)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-900/40 hover:bg-red-900/60 disabled:opacity-30 text-red-400 border border-red-700/40 rounded-lg py-1.5 text-xs transition-all"
                      whileTap={{ scale: 0.95 }}
                      title={`Build hotel ($${tile.hotelCost})`}
                    >
                      <Hotel size={10} />
                      <span>${tile.hotelCost}</span>
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => mortgageProperty(tile.id)}
                    disabled={ownership.isMortgaged}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 border border-slate-700/40 rounded-lg py-1.5 text-xs transition-all"
                    whileTap={{ scale: 0.95 }}
                    title="Mortgage"
                  >
                    <DollarSign size={10} />
                    <span>{ownership.isMortgaged ? "Mortgaged" : "Mortgage"}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          );
        })}

        {myProperties.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-4">No properties yet. Buy some!</p>
        )}
      </div>
    </div>
  );
}
