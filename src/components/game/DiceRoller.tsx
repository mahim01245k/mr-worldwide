"use client";
// src/components/game/DiceRoller.tsx
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DiceProps {
  value: number;
  isRolling: boolean;
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

function Die({ value, isRolling }: DiceProps) {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1];

  return (
    <motion.div
      className="relative w-14 h-14 rounded-xl shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)",
      }}
      animate={
        isRolling
          ? {
              rotate: [0, -15, 15, -10, 10, -5, 5, 0],
              scale: [1, 1.1, 0.95, 1.05, 0.97, 1.02, 1],
            }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {dots.map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={8}
            fill="#1e293b"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring" }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

interface DiceRollerProps {
  onRoll: () => void;
  diceValues: [number, number];
  canRoll: boolean;
  isMyTurn: boolean;
  phase: string;
}

export function DiceRoller({ onRoll, diceValues, canRoll, isMyTurn, phase }: DiceRollerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRoll = useCallback(() => {
    if (!canRoll || isAnimating) return;
    setIsAnimating(true);
    onRoll();
    setTimeout(() => setIsAnimating(false), 700);
  }, [canRoll, isAnimating, onRoll]);

  const isDouble = diceValues[0] === diceValues[1];
  const total = diceValues[0] + diceValues[1];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        <Die value={diceValues[0]} isRolling={isAnimating} />
        <Die value={diceValues[1]} isRolling={isAnimating} />
      </div>

      {phase !== "waiting" && (
        <div className="text-center">
          <span className="text-white/60 text-sm">Total: </span>
          <span className="text-white font-bold">{total}</span>
          {isDouble && (
            <span className="ml-2 text-yellow-400 font-bold text-sm animate-pulse">
              DOUBLE! 🎲
            </span>
          )}
        </div>
      )}

      <motion.button
        onClick={handleRoll}
        disabled={!canRoll || isAnimating || !isMyTurn}
        className={`
          px-8 py-3 rounded-xl font-bold text-sm tracking-wider uppercase
          transition-all duration-200
          ${canRoll && isMyTurn && !isAnimating
            ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/50 cursor-pointer"
            : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }
        `}
        whileHover={canRoll && isMyTurn ? { scale: 1.05 } : {}}
        whileTap={canRoll && isMyTurn ? { scale: 0.95 } : {}}
      >
        {isAnimating ? "Rolling..." : isMyTurn && phase === "rolling" ? "Roll Dice 🎲" : "Waiting..."}
      </motion.button>
    </div>
  );
}
