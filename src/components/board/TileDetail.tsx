"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { Yanone_Kaffeesatz } from "next/font/google"; // Import Yanone Kaffeesatz
import { BOARD_TILES, COLOR_HEX } from "@/lib/game/boardData";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { X } from "lucide-react";

// Define Yanone Kaffeesatz at the module level to fix build errors
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
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-80 max-w-[90vw]"
        style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.8))" }}
      >
        <div className="rounded-2xl border overflow-hidden backdrop-blur-md"
          style={{ background: `linear-gradient(135deg, ${tileColor}20, #0a0f1e)`, borderColor: `${tileColor}50` }}>
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${tileColor}, ${tileColor}88)` }} />
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {tile.flagCode ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://flagcdn.com/w80/${tile.flagCode.toLowerCase()}.png`}
                      alt={tile.subname || tile.name}
                      className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-4xl">
                    {tile.type === "treasure" ? "💰" : tile.type === "surprise" ? "❓" : tile.type === "airport" ? "✈️" : tile.type === "tax" ? "💸" : tile.type === "start" ? "▶️" : tile.type === "vacation" ? "🏖️" : tile.type === "go-to-prison" ? "☠️" : "🏙️"}
                  </span>
                )}
                <div className={`${yanone.variable} font-sans`}>
                  <h3 className="text-white font-black text-lg font-yanone">{tile.name}</h3>
                  <p className="text-[#cccccc] text-sm font-yanone">{tile.subname || (tile.type === "property" ? "CITY" : tile.type.toUpperCase())}</p>
                </div>
              </div>
              <button onClick={() => toggleTileDetail(false)} className="text-slate-500 hover:text-white transition-colors mt-1">
                <X size={16} />
              </button>
            </div>

            {owner && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 border"
                style={{ background: `${PLAYER_COLOR_HEX[owner.color]}15`, borderColor: `${PLAYER_COLOR_HEX[owner.color]}40` }}>
                <span className="text-lg">{owner.avatar}</span> {/* Keep emojis */}
                <div className={`flex-1 ${yanone.variable} font-sans`}>
                  <p className="text-white text-xs font-bold font-yanone">Owned by {owner.name}</p>
                  <p className="text-[#cccccc] text-xs font-yanone">
                    {ownership!.hasHotel ? "🏨 Hotel" : ownership!.houses > 0 ? `${"🏠".repeat(ownership!.houses)}` : "No buildings"}
                    {ownership!.isMortgaged && " • Mortgaged"}
                  </p>
                </div>
              </div>
            )}
            {!owner && tile.price && ( // Keep as is, dark background
              <div className={`bg-[#282828]/60 rounded-lg px-3 py-2 mb-3 ${yanone.variable} font-sans`}>
                <p className="text-[#cccccc] text-xs font-yanone">Status</p>
                <p className="text-[#00e701] text-sm font-bold font-yanone">Available for purchase</p>
              </div>
            )}
            {tile.price && ( // Keep as is, dark background
              <div className={`grid grid-cols-2 gap-2 mb-3 ${yanone.variable} font-sans`}>
                <div className="bg-[#282828]/60 rounded-lg p-2">
                  <p className="text-[#888888] text-xs font-yanone">Price</p>
                  <p className="text-white font-bold font-yanone">${tile.price}</p>
                </div>
                <div className="bg-[#282828]/60 rounded-lg p-2">
                  <p className="text-[#888888] text-xs font-yanone">Mortgage</p>
                  <p className="text-white font-bold font-yanone">${tile.mortgageValue || Math.floor(tile.price / 2)}</p>
                </div>
                {tile.houseCost && (
                  <div className="bg-[#282828]/60 rounded-lg p-2">
                    <p className="text-[#888888] text-xs font-yanone">House</p>
                    <p className="text-white font-bold font-yanone">${tile.houseCost}</p>
                  </div>
                )}
                {tile.hotelCost && (
                  <div className="bg-[#282828]/60 rounded-lg p-2">
                    <p className="text-[#888888] text-xs font-yanone">Hotel</p>
                    <p className="text-white font-bold font-yanone">${tile.hotelCost}</p>
                  </div>
                )}
              </div>
            )}
            {tile.rentLevels && (
              <div className={`${yanone.variable} font-sans`}>
                <p className="text-[#cccccc] text-xs mb-2 font-yanone">Rent Schedule:</p>
                <div className="space-y-1 font-yanone">
                  {["Base", "1 House", "2 Houses", "3 Houses", "4 Houses", "Hotel"].map((label, i) => {
                    const isCurrent = ownership ? (ownership.hasHotel ? i === 5 : ownership.houses === i) : i === 0; // Keep logic
                    return (
                      <div key={i} className={`flex justify-between items-center text-xs px-2 py-1 rounded ${isCurrent ? "bg-[#00e701]/40 border border-[#00e701]/40" : ""}`}>
                        <span className="text-[#cccccc] font-yanone">{label}</span>
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
