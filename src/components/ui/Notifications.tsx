"use client";
// src/components/ui/Notifications.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: "border-green-500/40 bg-green-950/80 text-green-300",
  error: "border-red-500/40 bg-red-950/80 text-red-300",
  info: "border-blue-500/40 bg-blue-950/80 text-blue-300",
  warning: "border-yellow-500/40 bg-yellow-950/80 text-yellow-300",
};

export function Notifications() {
  const { notifications, removeNotification } = useGameStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => {
          const Icon = ICONS[n.type];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
                shadow-2xl pointer-events-auto ${COLORS[n.type]}
              `}
            >
              <Icon size={16} className="flex-shrink-0" />
              <p className="text-sm flex-1">{n.message}</p>
              <button
                onClick={() => removeNotification(n.id)}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
