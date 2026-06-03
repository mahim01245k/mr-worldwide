// src/lib/game/boardData.ts

export type TileType =
  | "start"
  | "property"
  | "airport"
  | "tax"
  | "treasure"
  | "surprise"
  | "utility"
  | "prison"
  | "go-to-prison"
  | "vacation";

export type PropertyColor =
  | "brown"
  | "lightblue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "darkblue"
  | "none";

export interface BoardTile {
  id: number;
  type: TileType;
  name: string;
  subname?: string;
  flag?: string;
  price?: number;
  baseRent?: number;
  rentLevels?: number[];
  color?: PropertyColor;
  group?: string;
  taxAmount?: number;
  mortgageValue?: number;
  houseCost?: number;
  hotelCost?: number;
  position: "bottom" | "right" | "top" | "left";
  index: number;
}

// Card Interfaces
export interface Card {
  id: number;
  text: string;
  action: string;
  amount?: number;
  houseAmount?: number;
  hotelAmount?: number;
}

export const COLOR_HEX: Record<PropertyColor, string> = {
  brown: "#8B4513",
  lightblue: "#87CEEB",
  pink: "#FF69B4",
  orange: "#FFA500",
  red: "#FF4500",
  yellow: "#FFD700",
  green: "#32CD32",
  darkblue: "#1E90FF",
  none: "#1e293b",
};

export const BOARD_TILES: BoardTile[] = [
  // ═══════════════════════════════════════════════════════
  // BOTTOM ROW (Left to Right)
  // 0: Start -> 1-11: 11 Tiles -> 12: Vacation
  // ═══════════════════════════════════════════════════════
  { id: 0, type: "start", name: "START", position: "bottom", index: 0, color: "none" },
  { id: 1, type: "property", name: "Tokyo", subname: "Japan", flag: "🇯🇵", price: 280, baseRent: 24, rentLevels: [24, 120, 360, 850, 1025, 1200], color: "brown", group: "asia-east", mortgageValue: 140, houseCost: 150, hotelCost: 150, position: "bottom", index: 1 },
  { id: 2, type: "property", name: "Yokohama", subname: "Japan", flag: "🇯🇵", price: 280, baseRent: 24, rentLevels: [24, 120, 360, 850, 1025, 1200], color: "brown", group: "asia-east", mortgageValue: 140, houseCost: 150, hotelCost: 150, position: "bottom", index: 2 },
  { id: 3, type: "utility", name: "Water Company", subname: "Utility", flag: "💧", price: 150, position: "bottom", index: 3, color: "none" },
  { id: 4, type: "property", name: "Paris", subname: "France", flag: "🇫🇷", price: 260, baseRent: 22, rentLevels: [22, 110, 330, 800, 975, 1150], color: "lightblue", group: "europe-west", mortgageValue: 130, houseCost: 150, hotelCost: 150, position: "bottom", index: 4 },
  { id: 5, type: "property", name: "Toulouse", subname: "France", flag: "🇫🇷", price: 260, baseRent: 22, rentLevels: [22, 110, 330, 800, 975, 1150], color: "lightblue", group: "europe-west", mortgageValue: 130, houseCost: 150, hotelCost: 150, position: "bottom", index: 5 },
  { id: 6, type: "airport", name: "CDG Airport", subname: "Paris Hub", flag: "✈️", price: 200, position: "bottom", index: 6, color: "none" },
  { id: 7, type: "property", name: "Shanghai", subname: "China", flag: "🇨🇳", price: 240, baseRent: 20, rentLevels: [20, 100, 300, 750, 925, 1100], color: "pink", group: "asia-china", mortgageValue: 120, houseCost: 150, hotelCost: 150, position: "bottom", index: 7 },
  { id: 8, type: "treasure", name: "Treasure", subname: "Community", position: "bottom", index: 8, color: "none" },
  { id: 9, type: "property", name: "Beijing", subname: "China", flag: "🇨🇳", price: 220, baseRent: 18, rentLevels: [18, 90, 270, 700, 875, 1050], color: "pink", group: "asia-china", mortgageValue: 110, houseCost: 150, hotelCost: 150, position: "bottom", index: 9 },
  { id: 10, type: "surprise", name: "Surprise", position: "bottom", index: 10, color: "none" },
  { id: 11, type: "property", name: "Shenzhen", subname: "China", flag: "🇨🇳", price: 220, baseRent: 18, rentLevels: [18, 90, 270, 700, 875, 1050], color: "pink", group: "asia-china", mortgageValue: 110, houseCost: 150, hotelCost: 150, position: "bottom", index: 11 },
  { id: 12, type: "vacation", name: "Vacation", subname: "Free Parking", flag: "🌴", position: "bottom", index: 12, color: "none" },

  // ═══════════════════════════════════════════════════════
  // RIGHT COLUMN (Bottom to Top)
  // 0: Next to Vacation -> 10: Next to Prison
  // ═══════════════════════════════════════════════════════
  { id: 13, type: "property", name: "Berlin", subname: "Germany", flag: "🇩🇪", price: 200, baseRent: 16, rentLevels: [16, 80, 220, 600, 800, 1000], color: "orange", group: "europe-central", mortgageValue: 100, houseCost: 150, hotelCost: 150, position: "right", index: 0 },
  { id: 14, type: "utility", name: "Gas Company", subname: "Utility", flag: "⛽", price: 150, position: "right", index: 1, color: "none" },
  { id: 15, type: "property", name: "Munich", subname: "Germany", flag: "🇩🇪", price: 180, baseRent: 14, rentLevels: [14, 70, 200, 550, 750, 950], color: "orange", group: "europe-central", mortgageValue: 90, houseCost: 100, hotelCost: 100, position: "right", index: 2 },
  { id: 16, type: "surprise", name: "Surprise", position: "right", index: 3, color: "none" },
  { id: 17, type: "property", name: "Frankfurt", subname: "Germany", flag: "🇩🇪", price: 180, baseRent: 14, rentLevels: [14, 70, 200, 550, 750, 950], color: "orange", group: "europe-central", mortgageValue: 90, houseCost: 100, hotelCost: 100, position: "right", index: 4 },
  { id: 18, type: "airport", name: "MUC Airport", subname: "Munich Hub", flag: "✈️", price: 200, position: "right", index: 5, color: "none" },
  { id: 19, type: "property", name: "Rome", subname: "Italy", flag: "🇮🇹", price: 250, baseRent: 20, rentLevels: [20, 100, 300, 750, 925, 1100], color: "red", group: "europe-south", mortgageValue: 125, houseCost: 150, hotelCost: 150, position: "right", index: 6 },
  { id: 20, type: "property", name: "Milan", subname: "Italy", flag: "🇮🇹", price: 240, baseRent: 20, rentLevels: [20, 100, 300, 750, 925, 1100], color: "red", group: "europe-south", mortgageValue: 120, houseCost: 150, hotelCost: 150, position: "right", index: 7 },
  { id: 21, type: "surprise", name: "Surprise", position: "right", index: 8, color: "none" },
  { id: 22, type: "property", name: "Bologna", subname: "Italy", flag: "🇮🇹", price: 220, baseRent: 18, rentLevels: [18, 90, 270, 700, 875, 1050], color: "red", group: "europe-south", mortgageValue: 110, houseCost: 150, hotelCost: 150, position: "right", index: 9 },
  { id: 23, type: "tax", name: "Passing By", subname: "Tax", flag: "🇦🇷", price: 130, taxAmount: 130, position: "right", index: 10, color: "none" },

  // ═══════════════════════════════════════════════════════
  // TOP ROW (Right to Left)
  // 0: Next to Prison -> 10: Next to Start
  // ═══════════════════════════════════════════════════════
  { id: 24, type: "property", name: "New Delhi", subname: "India", flag: "🇮🇳", price: 120, baseRent: 8, rentLevels: [8, 40, 100, 300, 450, 600], color: "yellow", group: "asia-south", mortgageValue: 60, houseCost: 50, hotelCost: 50, position: "top", index: 0 },
  { id: 25, type: "surprise", name: "Surprise", position: "top", index: 1, color: "none" },
  { id: 26, type: "property", name: "Mumbai", subname: "India", flag: "🇮🇳", price: 120, baseRent: 8, rentLevels: [8, 40, 100, 300, 450, 600], color: "yellow", group: "asia-south", mortgageValue: 60, houseCost: 50, hotelCost: 50, position: "top", index: 2 },
  { id: 27, type: "tax", name: "Earnings Tax", subname: "Pay 10%", flag: "🇸🇦", taxAmount: 0.1, position: "top", index: 3, color: "none" },
  { id: 28, type: "property", name: "Jerusalem", subname: "Israel", flag: "🇮🇱", price: 110, baseRent: 6, rentLevels: [6, 30, 90, 270, 400, 550], color: "green", group: "middle-east", mortgageValue: 55, houseCost: 50, hotelCost: 50, position: "top", index: 4 },
  { id: 29, type: "property", name: "Haifa", subname: "Israel", flag: "🇮🇱", price: 100, baseRent: 6, rentLevels: [6, 30, 90, 270, 400, 550], color: "green", group: "middle-east", mortgageValue: 50, houseCost: 50, hotelCost: 50, position: "top", index: 5 },
  { id: 30, type: "airport", name: "TLV Airport", subname: "Ben Gurion", flag: "✈️", price: 200, position: "top", index: 6, color: "none" },
  { id: 31, type: "property", name: "Tel Aviv", subname: "Israel", flag: "🇮🇱", price: 100, baseRent: 6, rentLevels: [6, 30, 90, 270, 400, 550], color: "lightblue", group: "middle-east", mortgageValue: 50, houseCost: 50, hotelCost: 50, position: "top", index: 7 },
  { id: 32, type: "treasure", name: "Treasure", subname: "Community", position: "top", index: 8, color: "none" },
  { id: 33, type: "property", name: "Rio", subname: "Brazil", flag: "🇧🇷", price: 60, baseRent: 4, rentLevels: [4, 20, 60, 180, 320, 450], color: "brown", group: "central-america", mortgageValue: 30, houseCost: 50, hotelCost: 50, position: "top", index: 9 },
  { id: 34, type: "property", name: "Salvadore", subname: "El Salvador", flag: "🇸🇻", price: 60, baseRent: 2, rentLevels: [2, 10, 30, 90, 160, 250], color: "brown", group: "central-america", mortgageValue: 30, houseCost: 50, hotelCost: 50, position: "top", index: 10 },

  // ═══════════════════════════════════════════════════════
  // LEFT COLUMN (Top to Bottom)
  // 0: Next to Start -> 10: Next to Go To Prison
  // ═══════════════════════════════════════════════════════
  { id: 35, type: "property", name: "New York", subname: "USA", flag: "🇺🇸", price: 400, baseRent: 50, rentLevels: [50, 200, 600, 1400, 1700, 2000], color: "darkblue", group: "north-america", mortgageValue: 200, houseCost: 200, hotelCost: 200, position: "left", index: 0 },
  { id: 36, type: "property", name: "San Francisco", subname: "USA", flag: "🇺🇸", price: 360, baseRent: 40, rentLevels: [40, 180, 500, 1100, 1300, 1500], color: "darkblue", group: "north-america", mortgageValue: 180, houseCost: 200, hotelCost: 200, position: "left", index: 1 },
  { id: 37, type: "surprise", name: "Surprise", position: "left", index: 2, color: "none" },
  { id: 38, type: "property", name: "Los Angeles", subname: "USA", flag: "🇺🇸", price: 320, baseRent: 35, rentLevels: [35, 175, 500, 1100, 1300, 1500], color: "brown", group: "north-america-west", mortgageValue: 160, houseCost: 200, hotelCost: 200, position: "left", index: 3 },
  { id: 39, type: "property", name: "London", subname: "UK", flag: "🇬🇧", price: 320, baseRent: 35, rentLevels: [35, 175, 500, 1100, 1300, 1500], color: "brown", group: "north-america-west", mortgageValue: 160, houseCost: 200, hotelCost: 200, position: "left", index: 4 },
  { id: 40, type: "utility", name: "Electric Company", subname: "Utility", flag: "⚡", price: 150, position: "left", index: 5, color: "none" },
  { id: 41, type: "property", name: "Chicago", subname: "USA", flag: "🇺🇸", price: 300, baseRent: 30, rentLevels: [30, 150, 450, 1000, 1200, 1400], color: "green", group: "north-america-mid", mortgageValue: 150, houseCost: 200, hotelCost: 200, position: "left", index: 6 },
  { id: 42, type: "property", name: "Boston", subname: "USA", flag: "🇺🇸", price: 300, baseRent: 30, rentLevels: [30, 150, 450, 1000, 1200, 1400], color: "green", group: "north-america-mid", mortgageValue: 150, houseCost: 200, hotelCost: 200, position: "left", index: 7 },
  { id: 43, type: "treasure", name: "Treasure", subname: "Community", position: "left", index: 8, color: "none" },
  { id: 44, type: "property", name: "Las Vegas", subname: "USA", flag: "🇺🇸", price: 280, baseRent: 26, rentLevels: [26, 130, 390, 900, 1100, 1275], color: "pink", group: "north-america-south", mortgageValue: 140, houseCost: 150, hotelCost: 150, position: "left", index: 9 },
  { id: 45, type: "property", name: "Seattle", subname: "USA", flag: "🇺🇸", price: 280, baseRent: 26, rentLevels: [26, 130, 390, 900, 1100, 1275], color: "pink", group: "north-america-south", mortgageValue: 140, houseCost: 150, hotelCost: 150, position: "left", index: 10 },
  { id: 46, type: "go-to-prison", name: "Go to Prison", flag: "🚔", position: "left", index: 11, color: "none" },
];

export const TREASURE_CARDS = [
  { id: 1, text: "Bank dividend! Collect $50.", action: "collect", amount: 50 },
  { id: 2, text: "Birthday! Collect $10 from each player.", action: "collect-from-all", amount: 10 },
  { id: 3, text: "Tax refund! Collect $20.", action: "collect", amount: 20 },
  { id: 4, text: "Street repair: Pay $40 per house, $115 per hotel.", action: "pay-per-building", houseAmount: 40, hotelAmount: 115 },
  { id: 5, text: "Doctor's fees. Pay $50.", action: "pay", amount: 50 },
  { id: 6, text: "Sale of stock! Collect $45.", action: "collect", amount: 45 },
  { id: 7, text: "Advance to Start. Collect $200.", action: "move-to-start" },
  { id: 8, text: "Get out of jail free.", action: "jail-free" },
  { id: 9, text: "You won second prize in a beauty contest. Collect $10.", action: "collect", amount: 10 },
  { id: 10, text: "Collect $100 consulting fee.", action: "collect", amount: 100 },
];

export const SURPRISE_CARDS = [
  { id: 1, text: "Advance to Start. Collect $200.", action: "move-to-start" },
  { id: 2, text: "Go directly to prison.", action: "go-to-prison" },
  { id: 3, text: "Get out of jail free.", action: "jail-free" },
  { id: 4, text: "Go back 3 spaces.", action: "move-back", amount: 3 },
  { id: 5, text: "Speeding fine. Pay $15.", action: "pay", amount: 15 },
  { id: 6, text: "Bank pays you dividend of $50.", action: "collect", amount: 50 },
  { id: 7, text: "Advance to nearest airport.", action: "move-to-airport" },
  { id: 8, text: "Pay each player $50.", action: "pay-all", amount: 50 },
  { id: 9, text: "Your building loan matures. Collect $150.", action: "collect", amount: 150 },
  { id: 10, text: "Drunk in charge. Fine $20.", action: "pay", amount: 20 },
];

export function getTileById(id: number): BoardTile | undefined {
  return BOARD_TILES.find((tile) => tile.id === id);
}

export function getPropertyTiles(): BoardTile[] {
  return BOARD_TILES.filter((tile) => tile.type === "property");
}

export function getTilesByColor(color: PropertyColor): BoardTile[] {
  return BOARD_TILES.filter((tile) => tile.color === color);
}

export function getCornerTiles(): BoardTile[] {
  return BOARD_TILES.filter(
    (tile) =>
      tile.type === "start" ||
      tile.type === "prison" ||
      tile.type === "vacation" ||
      tile.type === "go-to-prison"
  );
}

export const TOTAL_TILES = BOARD_TILES.length;