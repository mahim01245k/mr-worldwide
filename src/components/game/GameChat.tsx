"use client";
// src/components/game/GameChat.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { useSocket } from "@/hooks/useSocket";
import { Send } from "lucide-react";

export function GameChat() {
  const [input, setInput] = useState("");
  const { gameState, myPlayerId } = useGameStore();
  const { sendChat } = useSocket();
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = gameState?.chat || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChat(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-white font-bold text-sm tracking-wider uppercase opacity-70 mb-3">Chat</h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 min-h-0">
        <AnimatePresence initial={false}>
          {chat.map((msg) => {
            const isMe = msg.playerId === myPlayerId;
            const color = PLAYER_COLOR_HEX[msg.playerColor];
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="text-xs text-slate-500 mb-0.5 px-1">
                  <span style={{ color }}>{msg.playerName}</span>
                </div>
                <div
                  className={`
                    max-w-[85%] px-3 py-1.5 rounded-xl text-sm
                    ${isMe
                      ? "bg-violet-600/40 text-white rounded-tr-sm"
                      : "bg-slate-800/80 text-slate-200 rounded-tl-sm"
                    }
                  `}
                >
                  {msg.message}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {chat.length === 0 && (
          <p className="text-slate-600 text-xs text-center mt-4">No messages yet. Say hello! 👋</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={200}
          className="
            flex-1 bg-slate-800/80 border border-slate-700/50 rounded-xl
            px-3 py-2 text-sm text-white placeholder:text-slate-600
            focus:outline-none focus:border-violet-500/50
          "
        />
        <motion.button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl w-9 h-9 flex items-center justify-center transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Send size={14} />
        </motion.button>
      </div>
    </div>
  );
}
