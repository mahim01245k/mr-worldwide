// src/lib/store/gameStore.ts
import { create } from "zustand";
import { GameState, Player } from "@/types/game";

interface GameStore {
  gameState: GameState | null;
  myPlayerId: string | null;
  roomCode: string | null;
  isConnected: boolean;
  selectedTileId: number | null;
  showTileDetail: boolean;
  showTradePanel: boolean;
  notifications: Notification[];
  
  setGameState: (state: GameState) => void;
  setMyPlayerId: (id: string) => void;
  setRoomCode: (code: string) => void;
  setConnected: (connected: boolean) => void;
  selectTile: (id: number | null) => void;
  toggleTileDetail: (show: boolean) => void;
  toggleTradePanel: (show: boolean) => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  
  // Derived selectors
  getMyPlayer: () => Player | null;
  getCurrentPlayer: () => Player | null;
  isMyTurn: () => boolean;
}

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  myPlayerId: null,
  roomCode: null,
  isConnected: false,
  selectedTileId: null,
  showTileDetail: false,
  showTradePanel: false,
  notifications: [],

  setGameState: (state) => set({ gameState: state }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setRoomCode: (code) => set({ roomCode: code }),
  setConnected: (connected) => set({ isConnected: connected }),
  selectTile: (id) => set({ selectedTileId: id, showTileDetail: id !== null }),
  toggleTileDetail: (show) => set({ showTileDetail: show }),
  toggleTradePanel: (show) => set({ showTradePanel: show }),

  addNotification: (notification) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    const duration = notification.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => get().removeNotification(id), duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  getMyPlayer: () => {
    const { gameState, myPlayerId } = get();
    return gameState?.players.find((p) => p.id === myPlayerId) ?? null;
  },

  getCurrentPlayer: () => {
    const { gameState } = get();
    if (!gameState) return null;
    return gameState.players[gameState.currentPlayerIndex] ?? null;
  },

  isMyTurn: () => {
    const { gameState, myPlayerId } = get();
    if (!gameState || !myPlayerId) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer?.id === myPlayerId;
  },
}));
