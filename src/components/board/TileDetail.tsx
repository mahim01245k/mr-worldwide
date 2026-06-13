"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { Yanone_Kaffeesatz } from "next/font/google";
import { BOARD_TILES, COLOR_HEX } from "@/lib/game/boardData";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { DivFlagIcon } from "@/components/ui/DivFlagIcon";
import { X } from "lucide-react";

const yanone = Yanone_Kaffeesatz({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-yanone",
});

export function TileDetail() {
  const { gameState, selectedTileId, showTileDetail, toggleTileDetail } = useGameStore();

  if (!gameState) return null;

  const tile = selectedTileId !== null ? BOARD_TILES.find(t => t.id === selectedTileId) : null;
  const ownership = selectedTileId !== null ? gameState.properties.find(p => p.tileId === selectedTileId) : null;
  const owner = ownership ? gameState.players.find(p => p.id === ownership.ownerId) : null;
  const tileColor = tile?.color && tile.color !== "none" ? COLOR_HEX[tile.color] : "#7c3aed";

  return (
    <AnimatePresence>
      {showTileDetail && tile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 w-52 max-w-[70vw]"
          style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.7))" }}
        >
          <div
            className="rounded-lg border overflow-hidden backdrop-blur-md"
            style={{ background: `linear-gradient(135deg, ${tileColor}20, #0a0f1e)`, borderColor: `${tileColor}50` }}
          >
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${tileColor}, ${tileColor}88)` }} />
            <div className="p-1.5">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1">
                  {tile.flagCode ? (
                    <DivFlagIcon code={tile.flagCode} size={24} />
                  ) : (
                    <span className="text-lg">
                      {tile.type === "treasure" ? "💰" : tile.type === "surprise" ? "❓" : tile.type === "airport" ? "✈️" : tile.type === "tax" ? "💸" : tile.type === "start" ? "▶️" : tile.type === "vacation" ? "🏖️" : tile.type === "go-to-prison" ? "☠️" : "🏙️"}
                    </span>
                  )}
                  <div className={`${yanone.variable} font-sans`}>
                    <h3 className="text-white font-black text-xs font-yanone leading-tight">{tile.name}</h3>
                    <p className="text-[#999] text-[8px] font-yanone leading-tight">{tile.subname || (tile.type === "property" ? "CITY" : tile.type.toUpperCase())}</p>
                  </div>
                </div>
                <button onClick={() => toggleTileDetail(false)} className="text-slate-500 hover:text-white transition-colors -mt-0.5">
                  <X size={10} />
                </button>
              </div>

              {owner && (
                <div className="flex items-center gap-1 rounded-md px-1 py-0.5 mb-1 text-[9px]"
                  style={{ background: `${PLAYER_COLOR_HEX[owner.color]}15`, borderColor: `${PLAYER_COLOR_HEX[owner.color]}40` }}
                >
                  <span className="text-xs">{owner.avatar}</span>
                  <div className="flex-1">
                    <p className="text-white text-[9px] font-bold font-yanone">Owned by {owner.name}</p>
                    <p className="text-[#aaa] text-[8px] font-yanone">
                      {ownership!.hasHotel ? "🏨 Hotel" : ownership!.houses > 0 ? `${"🏠".repeat(ownership!.houses)}` : "No buildings"}
                      {ownership!.isMortgaged && " • M"}
                    </p>
                  </div>
                </div>
              )}

              {!owner && tile.price && (
                <div className="bg-[#282828]/60 rounded-md px-1 py-0.5 mb-1">
                  <p className="text-[#aaa] text-[7px] font-yanone">Status</p>
                  <p className="text-[#00e701] text-[9px] font-bold font-yanone">Available</p>
                </div>
              )}

              {tile.price && (
                <div className="grid grid-cols-2 gap-0.5 mb-1 text-[9px]">
                  <div className="bg-[#282828]/60 rounded-md p-0.5">
                    <p className="text-[#888] text-[7px] font-yanone">Price</p>
                    <p className="text-white font-bold text-[9px] font-yanone">${tile.price}</p>
                  </div>
                  <div className="bg-[#282828]/60 rounded-md p-0.5">
                    <p className="text-[#888] text-[7px] font-yanone">Mortgage</p>
                    <p className="text-white font-bold text-[9px] font-yanone">${tile.mortgageValue || Math.floor(tile.price / 2)}</p>
                  </div>
                  {tile.houseCost && (
                    <div className="bg-[#282828]/60 rounded-md p-0.5">
                      <p className="text-[#888] text-[7px] font-yanone">House</p>
                      <p className="text-white font-bold text-[9px] font-yanone">${tile.houseCost}</p>
                    </div>
                  )}
                  {tile.hotelCost && (
                    <div className="bg-[#282828]/60 rounded-md p-0.5">
                      <p className="text-[#888] text-[7px] font-yanone">Hotel</p>
                      <p className="text-white font-bold text-[9px] font-yanone">${tile.hotelCost}</p>
                    </div>
                  )}
                </div>
              )}

              {tile.rentLevels && (
                <div>
                  <p className="text-[#aaa] text-[7px] mb-0.5 font-yanone">Rent:</p>
                  <div className="space-y-0 text-[8px]">
                    {["Base", "1 House", "2 Houses", "3 Houses", "4 Houses", "Hotel"].map((label, i) => {
                      const isCurrent = ownership ? (ownership.hasHotel ? i === 5 : ownership.houses === i) : i === 0;
                      return (
                        <div key={i} className={`flex justify-between items-center px-0.5 py-0 rounded ${isCurrent ? "bg-[#00e701]/40" : ""}`}>
                          <span className="text-[#aaa] font-yanone">{label}</span>
                          <span className={isCurrent ? "text-[#00e701] font-bold font-yanone" : "text-white font-yanone"}>${tile.rentLevels![i]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}