// src/types/game.ts
export type PlayerColor = "red" | "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "cyan";

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  position: number;
  cash: number;
  netWorth: number;
  properties: number[]; // tile IDs
  inJail: boolean;
  jailTurns: number;
  jailFreeCards: number;
  isBankrupt: boolean;
  isConnected: boolean;
  avatar: string;
  housesOwned: number;
  hotelsOwned: number;
  lastDice: [number, number];
  consecutiveDoubles: number;
}

export interface PropertyOwnership {
  tileId: number;
  ownerId: string;
  houses: number; // 0-4
  hasHotel: boolean;
  isMortgaged: boolean;
  purchasePrice: number;
}

export interface Trade {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  fromCash: number;
  toCash: number;
  fromProperties: number[];
  toProperties: number[];
  fromJailCards: number;
  toJailCards: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
}

export interface Auction {
  tileId: number;
  currentBid: number;
  currentBidderId: string | null;
  bids: { playerId: string; amount: number; timestamp: number }[];
  endsAt: number;
  status: "active" | "finished";
}

export interface GameLog {
  id: string;
  timestamp: number;
  type: "move" | "purchase" | "rent" | "tax" | "card" | "trade" | "upgrade" | "jail" | "bankrupt" | "system";
  message: string;
  playerId?: string;
  amount?: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: PlayerColor;
  message: string;
  timestamp: number;
}

export type GamePhase =
  | "waiting"
  | "rolling"
  | "moving"
  | "action"
  | "buying"
  | "auction"
  | "trading"
  | "card"
  | "paying"
  | "upgrading"
  | "finished";

export interface GameState {
  id: string;
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  properties: PropertyOwnership[];
  diceValues: [number, number];
  diceRolled: boolean;
  lastDiceRoll?: [number, number];
  freeParkingPot: number;
  currentCard?: { type: "treasure" | "surprise"; card: any };
  currentAuction?: Auction;
  pendingTrade?: Trade;
  log: GameLog[];
  chat: ChatMessage[];
  round: number;
  maxRounds: number;
  startedAt: number;
  updatedAt: number;
  winner?: string;
  settings: GameSettings;
}

export interface GameSettings {
  startingCash: number;
  maxPlayers: number;
  turnTimeLimit: number; // seconds
  auctionDuration: number; // seconds
  freeParkingMoney: boolean;
  maxRounds: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  startingCash: 1500,
  maxPlayers: 6,
  turnTimeLimit: 60,
  auctionDuration: 30,
  freeParkingMoney: true,
  maxRounds: 50,
};

export const PLAYER_COLORS: PlayerColor[] = [
  "red", "blue", "green", "yellow", "purple", "orange"
];

export const PLAYER_COLOR_HEX: Record<PlayerColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

export const PLAYER_AVATARS = ["🚀", "🎩", "🦊", "🐉", "🌟", "🏆", "🎭", "🦁"];

export type SocketEvent =
  | "join-room"
  | "leave-room"
  | "start-game"
  | "roll-dice"
  | "buy-property"
  | "decline-purchase"
  | "auction-bid"
  | "mortgage-property"
  | "unmortgage-property"
  | "build-house"
  | "build-hotel"
  | "sell-house"
  | "propose-trade"
  | "accept-trade"
  | "reject-trade"
  | "use-jail-card"
  | "pay-jail-fine"
  | "end-turn"
  | "send-chat"
  | "game-state"
  | "player-joined"
  | "player-left"
  | "error";
