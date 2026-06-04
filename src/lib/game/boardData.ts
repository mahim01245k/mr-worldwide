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
  flagCode?: string; // ISO country code instead of emoji
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

export const COLOR_HEX: Record<PropertyColor, string> = {
  brown: "#92400e",
  lightblue: "#38bdf8",
  pink: "#f472b6",
  orange: "#f97316",
  red: "#ef4444",
  yellow: "#facc15",
  green: "#10b981",
  darkblue: "#1d4ed8",
  none: "#4b5563",
};

export const BOARD_TILES: BoardTile[] = [
  // BOTTOM ROW (Left → Right)
  { id: 0, type: "start", name: "START", position: "bottom", index: 0, color: "none" },
  { id: 1, type: "property", name: "Salvador", subname: "Brazil", flagCode: "br", price: 60, baseRent: 2, rentLevels: [2, 10, 30, 90, 160, 250], color: "brown", group: "americas", mortgageValue: 30, houseCost: 50, hotelCost: 50, position: "bottom", index: 1 },
  { id: 2, type: "treasure", name: "Treasure", subname: "Community", position: "bottom", index: 2, color: "none" },
  { id: 3, type: "property", name: "Rio", subname: "Brazil", flagCode: "br", price: 60, baseRent: 2, rentLevels: [2, 10, 30, 90, 160, 250], color: "brown", group: "americas", mortgageValue: 30, houseCost: 50, hotelCost: 50, position: "bottom", index: 3 },
  { id: 4, type: "tax", name: "Earnings Tax", subname: "Pay 10%", taxAmount: 0.1, flagCode: "sa", position: "bottom", index: 4, color: "none" },
  { id: 5, type: "property", name: "Tel Aviv", subname: "Israel", flagCode: "il", price: 100, baseRent: 6, rentLevels: [6, 30, 90, 270, 400, 550], color: "lightblue", group: "middle-east", mortgageValue: 50, houseCost: 50, hotelCost: 50, position: "bottom", index: 5 },
  { id: 6, type: "airport", name: "TLV Airport", subname: "Ben Gurion", flagCode: "il", price: 200, position: "bottom", index: 6, color: "none" },
  { id: 7, type: "property", name: "Haifa", subname: "Israel", flagCode: "il", price: 110, baseRent: 8, rentLevels: [8, 40, 100, 300, 450, 600], color: "lightblue", group: "middle-east", mortgageValue: 55, houseCost: 50, hotelCost: 50, position: "bottom", index: 7 },
  { id: 8, type: "property", name: "Jerusalem", subname: "Israel", flagCode: "il", price: 100, baseRent: 6, rentLevels: [6, 30, 90, 270, 400, 550], color: "lightblue", group: "middle-east", mortgageValue: 50, houseCost: 50, hotelCost: 50, position: "bottom", index: 8 },
  { id: 9, type: "surprise", name: "Surprise", position: "bottom", index: 9, color: "none" },
  { id: 10, type: "property", name: "Mumbai", subname: "India", flagCode: "in", price: 120, baseRent: 8, rentLevels: [8, 40, 100, 300, 450, 600], color: "yellow", group: "asia-south", mortgageValue: 60, houseCost: 50, hotelCost: 50, position: "bottom", index: 10 },
  { id: 11, type: "property", name: "New Delhi", subname: "India", flagCode: "in", price: 120, baseRent: 8, rentLevels: [8, 40, 100, 300, 450, 600], color: "yellow", group: "asia-south", mortgageValue: 60, houseCost: 50, hotelCost: 50, position: "bottom", index: 11 },
  { id: 12, type: "vacation", name: "Vacation", subname: "Free Parking", flagCode: "jp", position: "bottom", index: 12, color: "none" },

  // RIGHT COLUMN (Bottom → Top)
  { id: 13, type: "property", name: "Passing By", subname: "Tax", taxAmount: 130, flagCode: "ar", position: "right", index: 0, color: "none" },
  { id: 14, type: "property", name: "Venice", subname: "Italy", flagCode: "it", price: 140, baseRent: 10, rentLevels: [10, 50, 150, 450, 625, 750], color: "orange", group: "europe-south", mortgageValue: 70, houseCost: 100, hotelCost: 100, position: "right", index: 1 },
  { id: 15, type: "property", name: "Bologna", subname: "Italy", flagCode: "it", price: 240, baseRent: 20, rentLevels: [20, 100, 300, 750, 925, 1100], color: "orange", group: "europe-south", mortgageValue: 120, houseCost: 100, hotelCost: 100, position: "right", index: 2 },
  { id: 16, type: "tax", name: "Luxury", subname: "Pay $190", taxAmount: 190, position: "right", index: 3, color: "none" },
  { id: 17, type: "property", name: "Milan", subname: "Italy", flagCode: "it", price: 250, baseRent: 22, rentLevels: [22, 110, 330, 800, 975, 1150], color: "red", group: "europe-south", mortgageValue: 125, houseCost: 150, hotelCost: 150, position: "right", index: 4 },
  { id: 18, type: "property", name: "Rome", subname: "Italy", flagCode: "it", price: 260, baseRent: 24, rentLevels: [24, 120, 360, 850, 1025, 1200], color: "red", group: "europe-south", mortgageValue: 130, houseCost: 150, hotelCost: 150, position: "right", index: 5 },
  { id: 19, type: "airport", name: "MUC Airport", subname: "Munich Hub", flagCode: "de", price: 200, position: "right", index: 6, color: "none" },
  { id: 20, type: "property", name: "Frankfurt", subname: "Germany", flagCode: "de", price: 180, baseRent: 14, rentLevels: [14, 70, 200, 550, 750, 950], color: "orange", group: "europe-central", mortgageValue: 90, houseCost: 100, hotelCost: 100, position: "right", index: 7 },
  { id: 21, type: "property", name: "Munich", subname: "Germany", flagCode: "de", price: 180, baseRent: 14, rentLevels: [14, 70, 200, 550, 750, 950], color: "orange", group: "europe-central", mortgageValue: 90, houseCost: 100, hotelCost: 100, position: "right", index: 8 },
  { id: 22, type: "surprise", name: "Surprise", position: "right", index: 9, color: "none" },
  { id: 23, type: "utility", name: "Gas Company", subname: "Utility", flagCode: "de", price: 150, position: "right", index: 10, color: "none" },

  // TOP ROW (Right → Left)
  { id: 24, type: "property", name: "Berlin", subname: "Germany", flagCode: "de", price: 200, baseRent: 16, rentLevels: [16, 80, 220, 600, 800, 1000], color: "green", group: "europe-central", mortgageValue: 100, houseCost: 150, hotelCost: 150, position: "top", index: 0 },
  { id: 25, type: "property", name: "New Delhi", subname: "India", flagCode: "in", price: 120, baseRent: 8, rentLevels: [8, 40, 100, 300, 450, 600], color: "yellow", group: "asia-south", mortgageValue: 60, houseCost: 50, hotelCost: 50, position: "top", index: 1 },
  { id: 26, type: "surprise", name: "Surprise", position: "top", index: 2, color: "none" },
  { id: 27, type: "property", name: "Mumbai", subname: "India", flagCode: "in", price: 120, baseRent: 8, rentLevels: [8, 40, 100, 300, 450, 600], color: "yellow", group: "asia-south", mortgageValue: 60, houseCost: 50, hotelCost: 50, position: "top", index: 3 },
  { id: 28, type: "tax", name: "Earnings Tax", subname: "Pay 10%", taxAmount: 0.1, position: "top", index: 4, color: "none" },
  { id: 29, type: "property", name: "Jerusalem", subname: "Israel", flagCode: "il", price: 110, baseRent: 6, rentLevels: [6, 30, 90, 270, 400, 550], color: "green", group: "middle-east", mortgageValue: 55, houseCost: 50, hotelCost: 50, position: "top", index: 5 },
  { id: 30, type: "property", name: "Haifa", subname: "Israel", flagCode: "il", price: 100, baseRent: 6, rentLevels: [6, 30, 90, 270, 400, 550], color: "green", group: "middle-east", mortgageValue: 50, houseCost: 50, hotelCost: 50, position: "top", index: 6 },
  { id: 31, type: "airport", name: "TLV Airport", subname: "Tel Aviv Hub", flagCode: "il", price: 200, position: "top", index: 7, color: "none" },
  { id: 32, type: "property", name: "Tel Aviv", subname: "Israel", flagCode: "il", price: 100, baseRent: 6, rentLevels: [6, 30, 90, 270, 400, 550], color: "lightblue", group: "middle-east", mortgageValue: 50, houseCost: 50, hotelCost: 50, position: "top", index: 8 },
  { id: 33, type: "tax", name: "Earnings Tax", subname: "Pay $60", taxAmount: 60, position: "top", index: 9, color: "none" },
  { id: 34, type: "treasure", name: "Treasure", subname: "Community", position: "top", index: 10, color: "none" },

  // LEFT COLUMN (Top → Bottom)
  { id: 35, type: "property", name: "Liverpool", subname: "UK", flagCode: "gb", price: 240, baseRent: 24, rentLevels: [24, 120, 360, 850, 1025, 1200], color: "brown", group: "europe-uk", mortgageValue: 120, houseCost: 150, hotelCost: 150, position: "left", index: 0 },
  { id: 36, type: "property", name: "Manchester", subname: "UK", flagCode: "gb", price: 240, baseRent: 24, rentLevels: [24, 120, 360, 850, 1025, 1200], color: "brown", group: "europe-uk", mortgageValue: 120, houseCost: 150, hotelCost: 150, position: "left", index: 1 },
  { id: 37, type: "treasure", name: "Treasure", subname: "Community", position: "left", index: 2, color: "none" },
  { id: 38, type: "property", name: "Birmingham", subname: "UK", flagCode: "gb", price: 280, baseRent: 26, rentLevels: [26, 130, 390, 900, 1100, 1275], color: "brown", group: "europe-uk", mortgageValue: 140, houseCost: 200, hotelCost: 200, position: "left", index: 3 },
  { id: 39, type: "property", name: "London", subname: "UK", flagCode: "gb", price: 320, baseRent: 28, rentLevels: [28, 150, 450, 1000, 1200, 1400], color: "brown", group: "europe-uk", mortgageValue: 160, houseCost: 200, hotelCost: 200, position: "left", index: 4 },
  { id: 40, type: "utility", name: "Electric Company", subname: "Utility", flagCode: "gb", price: 150, position: "left", index: 5, color: "none" },
  { id: 41, type: "airport", name: "JFK Airport", subname: "New York Hub", flagCode: "us", price: 200, position: "left", index: 6, color: "none" },
  { id: 42, type: "property", name: "San Francisco", subname: "USA", flagCode: "us", price: 360, baseRent: 35, rentLevels: [35, 175, 500, 1100, 1300, 1500], color: "darkblue", group: "americas-premium", mortgageValue: 180, houseCost: 200, hotelCost: 200, position: "left", index: 7 },
  { id: 43, type: "property", name: "New York", subname: "USA", flagCode: "us", price: 400, baseRent: 50, rentLevels: [50, 200, 600, 1400, 1700, 2000], color: "darkblue", group: "americas-premium", mortgageValue: 200, houseCost: 200, hotelCost: 200, position: "left", index: 8 },
  { id: 44, type: "treasure", name: "Treasure", subname: "Community", position: "left", index: 9, color: "none" },
  { id: 45, type: "property", name: "Rio", subname: "Brazil", flagCode: "br", price: 60, baseRent: 2, rentLevels: [2, 10, 30, 90, 160, 250], color: "brown", group: "americas", mortgageValue: 30, houseCost: 50, hotelCost: 50, position: "left", index: 10 },
  { id: 46, type: "go-to-prison", name: "Go to Prison", flagCode: "us", position: "left", index: 11, color: "none" },
];

export const TOTAL_TILES = 48;
export const CORNER_TILE_IDS = [0, 12, 23, 46];

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