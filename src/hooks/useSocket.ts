"use client";
// src/hooks/useSocket.ts
// Connects to the STANDALONE socket server (not Next.js API routes).
// Set NEXT_PUBLIC_SOCKET_URL to your Render/Railway/Fly URL in .env.local
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "@/lib/store/gameStore";
import { GameState } from "@/types/game";

let socket: Socket | null = null;

export function useSocket() {
  const { setGameState, setMyPlayerId, setConnected, addNotification } = useGameStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || socket?.connected) return;
    initializedRef.current = true;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      setMyPlayerId(socket!.id || "");
      setConnected(true);
      console.log("Socket connected:", socket!.id);
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      if (reason !== "io client disconnect") {
        addNotification({ type: "warning", message: "Connection lost. Reconnecting..." });
      }
    });

    socket.on("reconnect", () => {
      setMyPlayerId(socket!.id || "");
      setConnected(true);
      addNotification({ type: "success", message: "Reconnected!" });
      socket!.emit("get-state");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setConnected(false);
    });

    socket.on("game-state", (state: GameState) => {
      setGameState(state);
    });

    socket.on("room-created", ({ roomCode, gameState }: { roomCode: string; gameState: GameState }) => {
      useGameStore.getState().setRoomCode(roomCode);
      setGameState(gameState);
      addNotification({ type: "success", message: `Room ${roomCode} created!` });
    });

    socket.on("player-joined", ({ playerName, gameState }: { playerName: string; gameState: GameState }) => {
      setGameState(gameState);
      addNotification({ type: "info", message: `${playerName} joined the game!` });
    });

    socket.on("player-left", ({ playerName, gameState }: { playerName: string; gameState: GameState }) => {
      setGameState(gameState);
      addNotification({ type: "warning", message: `${playerName} disconnected` });
    });

    socket.on("error", ({ message }: { message: string }) => {
      addNotification({ type: "error", message });
    });

    return () => {
      // Don't disconnect on re-renders; only on true unmount
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn("Socket not connected, queuing:", event);
    }
  }, []);

  return {
    socket,
    createRoom: (playerName: string) => emit("create-room", { playerName }),
    joinRoom: (roomCode: string, playerName: string) => emit("join-room", { roomCode, playerName }),
    startGame: () => emit("start-game"),
    rollDice: () => emit("roll-dice"),
    buyProperty: () => emit("buy-property"),
    declinePurchase: () => emit("decline-purchase"),
    auctionBid: (amount: number) => emit("auction-bid", { amount }),
    finishAuction: () => emit("finish-auction"),
    buildHouse: (tileId: number) => emit("build-house", { tileId }),
    buildHotel: (tileId: number) => emit("build-hotel", { tileId }),
    mortgageProperty: (tileId: number) => emit("mortgage-property", { tileId }),
    processCard: () => emit("process-card"),
    useJailCard: () => emit("use-jail-card"),
    payJailFine: () => emit("pay-jail-fine"),
    proposeTrade: (tradeData: any) => emit("propose-trade", tradeData),
    respondTrade: (accept: boolean) => emit("respond-trade", { accept }),
    sendChat: (message: string) => emit("send-chat", { message }),
  };
}
