// src/lib/game/boardData.ts
// Board layout — clockwise from START (top-left):
// id 0 = START (corner, top-left)
// ids 1–11  = top row left→right
// id 12 = IN PRISON (corner, top-right)
// ids 13–23 = right col top→bottom
// id 24 = VACATION (corner, bottom-right)
// ids 25–35 = bottom row right→left
// id 36 = GO TO PRISON (corner, bottom-left)
// ids 37–47 = left col bottom→top

export type TileType =
  | "start" | "property" | "airport" | "tax" | "treasure"
  | "surprise" | "utility" | "prison" | "go-to-prison" | "vacation";

export type PropertyColor =
  | "brown" | "lightblue" | "pink" | "orange" | "red"
  | "yellow" | "green" | "darkblue" | "none";

export interface BoardTile {
  id: number;
  type: TileType;
  name: string;
  subname?: string;
  flagCode?: string;
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
  brown:    "#92400e",
  lightblue:"#38bdf8",
  pink:     "#f472b6",
  orange:   "#f97316",
  red:      "#ef4444",
  yellow:   "#facc15",
  green:    "#10b981",
  darkblue: "#1d4ed8",
  none:     "#4b5563",
};

export const BOARD_TILES: BoardTile[] = [
  // ── CORNERS ──────────────────────────────────────────────
  { id: 0,  type: "start",        name: "START",        subname: "Collect $200", position: "top",    index: -1, color: "none" },
  { id: 12, type: "prison",       name: "In Prison",    subname: "Just Visiting",position: "top",    index: -1, color: "none" },
  { id: 24, type: "vacation",     name: "Vacation",     subname: "Skip 1 Turn",  position: "bottom", index: -1, color: "none" },
  { id: 36, type: "go-to-prison", name: "Go to Prison",                          position: "bottom", index: -1, color: "none" },

  // ── TOP ROW (ids 1–11, left → right) ─────────────────────
  { id: 1,  type: "property", name: "Salvador",  subname: "Brazil",    flagCode: "br", price: 60,  baseRent: 2,  rentLevels: [2,10,30,90,160,250],       color: "brown",    group: "south-america",  mortgageValue: 30,  houseCost: 50,  hotelCost: 50,  position: "top", index: 0 },
  { id: 2,  type: "treasure", name: "Treasure",                                                                                                            color: "none",                                                                                                 position: "top", index: 1 },
  { id: 3,  type: "property", name: "Rio",       subname: "Brazil",    flagCode: "br", price: 60,  baseRent: 4,  rentLevels: [4,20,60,180,320,450],       color: "brown",    group: "south-america",  mortgageValue: 30,  houseCost: 50,  hotelCost: 50,  position: "top", index: 2 },
  { id: 4,  type: "tax",      name: "Earnings Tax", subname: "Pay 10%",               taxAmount: 0.1,                                                     color: "none",                                                                                                 position: "top", index: 3 },
  { id: 5,  type: "property", name: "Tel Aviv",  subname: "Israel",    flagCode: "il", price: 100, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "lightblue",group: "israel",         mortgageValue: 50,  houseCost: 50,  hotelCost: 50,  position: "top", index: 4 },
  { id: 6,  type: "airport",  name: "TLV Airport", subname: "Ben Gurion", flagCode: "il", price: 200,                                                     color: "none",                                                                                                 position: "top", index: 5 },
  { id: 7,  type: "property", name: "Haifa",     subname: "Israel",    flagCode: "il", price: 100, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "lightblue",group: "israel",         mortgageValue: 50,  houseCost: 50,  hotelCost: 50,  position: "top", index: 6 },
  { id: 8,  type: "property", name: "Jerusalem", subname: "Israel",    flagCode: "il", price: 120, baseRent: 8,  rentLevels: [8,40,100,300,450,600],     color: "lightblue",group: "israel",         mortgageValue: 55,  houseCost: 50,  hotelCost: 50,  position: "top", index: 7 },
  { id: 9,  type: "surprise", name: "Surprise",                                                                                                            color: "none",                                                                                                 position: "top", index: 8 },
  { id: 10, type: "property", name: "Mumbai",    subname: "India",     flagCode: "in", price: 120, baseRent: 8,  rentLevels: [8,45,120,350,500,650],      color: "pink",     group: "india",          mortgageValue: 60,  houseCost: 100, hotelCost: 100, position: "top", index: 9 },
  { id: 11, type: "property", name: "New Delhi", subname: "India",     flagCode: "in", price: 130, baseRent: 10, rentLevels: [10,45,130,400,575,700],     color: "pink",     group: "india",          mortgageValue: 65,  houseCost: 100, hotelCost: 100, position: "top", index: 10 },

  // ── RIGHT COLUMN (ids 13–23, top → bottom) ──────────────
  { id: 13, type: "property", name: "Venice",      subname: "Italy",    flagCode: "it", price: 140, baseRent: 10, rentLevels: [10,50,150,450,625,750],  color: "orange",   group: "italy",          mortgageValue: 70,  houseCost: 100, hotelCost: 100, position: "right", index: 0 },
  { id: 14, type: "property", name: "Bologna",     subname: "Italy",    flagCode: "it", price: 140, baseRent: 10, rentLevels: [10,50,150,450,625,750],  color: "orange",   group: "italy",          mortgageValue: 70,  houseCost: 100, hotelCost: 100, position: "right", index: 1 },
  { id: 15, type: "utility",  name: "Electric Company", subname: "Utility", flagCode: "gb", price: 150,                                                    color: "none",                                                                                                 position: "right", index: 2 },
  { id: 16, type: "property", name: "Milan",       subname: "Italy",    flagCode: "it", price: 160, baseRent: 12, rentLevels: [12,60,180,500,700,900],  color: "red",      group: "italy-north",    mortgageValue: 80,  houseCost: 100, hotelCost: 100, position: "right", index: 3 },
  { id: 17, type: "property", name: "Rome",        subname: "Italy",    flagCode: "it", price: 160, baseRent: 12, rentLevels: [12,60,180,500,700,900],  color: "red",      group: "italy-north",    mortgageValue: 80,  houseCost: 100, hotelCost: 100, position: "right", index: 4 },
  { id: 18, type: "airport",  name: "MUC Airport", subname: "Munich",   flagCode: "de", price: 200,                                                      color: "none",                                                                                                 position: "right", index: 5 },
  { id: 19, type: "property", name: "Frankfurt",   subname: "Germany",  flagCode: "de", price: 180, baseRent: 14, rentLevels: [14,70,200,550,750,950],  color: "yellow",   group: "germany",        mortgageValue: 90,  houseCost: 100, hotelCost: 100, position: "right", index: 6 },
  { id: 20, type: "treasure", name: "Treasure",                                                                                                            color: "none",                                                                                                 position: "right", index: 7 },
  { id: 21, type: "property", name: "Munich",      subname: "Germany",  flagCode: "de", price: 180, baseRent: 14, rentLevels: [14,70,200,550,750,950],  color: "yellow",   group: "germany",        mortgageValue: 90,  houseCost: 100, hotelCost: 100, position: "right", index: 8 },
  { id: 22, type: "utility",  name: "Gas Company", subname: "Utility",  flagCode: "de", price: 150,                                                      color: "none",                                                                                                 position: "right", index: 9 },
  { id: 23, type: "property", name: "Berlin",     subname: "Germany",  flagCode: "de", price: 200, baseRent: 16, rentLevels: [16,80,220,600,800,1000], color: "yellow",   group: "germany",        mortgageValue: 100, houseCost: 100, hotelCost: 100, position: "right", index: 10 },

  // ── BOTTOM ROW (ids 25–35, right → left) ──────────────────
  // Note: id 24 is Vacation corner, so bottom row starts at 25
  { id: 25, type: "property", name: "Shenzhen",    subname: "China",    flagCode: "cn", price: 220, baseRent: 18, rentLevels: [18,90,250,700,875,1050], color: "green",    group: "china",          mortgageValue: 110, houseCost: 150, hotelCost: 150, position: "bottom", index: 0 },
  { id: 26, type: "surprise", name: "Surprise",                                                                                                            color: "none",                                                                                                 position: "bottom", index: 1 },
  { id: 27, type: "property", name: "Beijing",     subname: "China",    flagCode: "cn", price: 220, baseRent: 18, rentLevels: [18,90,250,700,875,1050], color: "green",    group: "china",          mortgageValue: 110, houseCost: 150, hotelCost: 150, position: "bottom", index: 2 },
  { id: 28, type: "treasure", name: "Treasure",                                                                                                            color: "none",                                                                                                 position: "bottom", index: 3 },
  { id: 29, type: "property", name: "Shanghai",    subname: "China",    flagCode: "cn", price: 240, baseRent: 20, rentLevels: [20,100,300,750,925,1100], color: "green",    group: "china",          mortgageValue: 120, houseCost: 150, hotelCost: 150, position: "bottom", index: 4 },
  { id: 30, type: "airport",  name: "CDG Airport", subname: "Paris",    flagCode: "fr", price: 200,                                                      color: "none",                                                                                                 position: "bottom", index: 5 },
  { id: 31, type: "property", name: "Toulouse",    subname: "France",   flagCode: "fr", price: 260, baseRent: 22, rentLevels: [22,110,330,800,975,1150], color: "darkblue", group: "france",        mortgageValue: 130, houseCost: 150, hotelCost: 150, position: "bottom", index: 6 },
  { id: 32, type: "property", name: "Paris",       subname: "France",   flagCode: "fr", price: 260, baseRent: 22, rentLevels: [22,110,330,800,975,1150], color: "darkblue", group: "france",        mortgageValue: 130, houseCost: 150, hotelCost: 150, position: "bottom", index: 7 },
  { id: 33, type: "utility",  name: "Water Company", subname: "Utility",flagCode: "fr", price: 150,                                                      color: "none",                                                                                                 position: "bottom", index: 8 },
  { id: 34, type: "property", name: "Yokohama",    subname: "Japan",    flagCode: "jp", price: 280, baseRent: 24, rentLevels: [24,120,360,850,1025,1200], color: "pink",     group: "japan",          mortgageValue: 140, houseCost: 150, hotelCost: 150, position: "bottom", index: 9 },
  { id: 35, type: "property", name: "Tokyo",       subname: "Japan",    flagCode: "jp", price: 280, baseRent: 24, rentLevels: [24,120,360,850,1025,1200], color: "pink",     group: "japan",          mortgageValue: 140, houseCost: 150, hotelCost: 150, position: "bottom", index: 10 },

  // ── LEFT COLUMN (ids 37–47, bottom → top) ─────────────────
  { id: 37, type: "property", name: "Liverpool",   subname: "UK",       flagCode: "gb", price: 300, baseRent: 26, rentLevels: [26,130,390,900,1100,1275], color: "orange",   group: "uk",             mortgageValue: 150, houseCost: 200, hotelCost: 200, position: "left", index: 0 },
  { id: 38, type: "property", name: "Manchester",  subname: "UK",       flagCode: "gb", price: 300, baseRent: 26, rentLevels: [26,130,390,900,1100,1275], color: "orange",   group: "uk",             mortgageValue: 150, houseCost: 200, hotelCost: 200, position: "left", index: 1 },
  { id: 39, type: "treasure", name: "Treasure",                                                                                                            color: "none",                                                                                                 position: "left", index: 2 },
  { id: 40, type: "property", name: "Birmingham",  subname: "UK",       flagCode: "gb", price: 320, baseRent: 28, rentLevels: [28,150,450,1000,1200,1400], color: "red",      group: "uk",             mortgageValue: 160, houseCost: 200, hotelCost: 200, position: "left", index: 3 },
  { id: 41, type: "property", name: "London",      subname: "UK",       flagCode: "gb", price: 320, baseRent: 28, rentLevels: [28,150,450,1000,1200,1400], color: "red",      group: "uk",             mortgageValue: 160, houseCost: 200, hotelCost: 200, position: "left", index: 4 },
  { id: 42, type: "airport",  name: "JFK Airport", subname: "New York", flagCode: "us", price: 200,                                                      color: "none",                                                                                                position: "left", index: 5 },
  { id: 43, type: "property", name: "Los Angeles", subname: "USA",      flagCode: "us", price: 350, baseRent: 35, rentLevels: [35,175,500,1100,1300,1500], color: "green",    group: "usa",            mortgageValue: 175, houseCost: 200, hotelCost: 200, position: "left", index: 6 },
  { id: 44, type: "surprise", name: "Surprise",                                                                                                            color: "none",                                                                                                 position: "left", index: 7 },
  { id: 45, type: "property", name: "San Francisco", subname: "USA",    flagCode: "us", price: 360, baseRent: 40, rentLevels: [40,180,540,1200,1450,1675], color: "green",   group: "usa",            mortgageValue: 180, houseCost: 200, hotelCost: 200, position: "left", index: 8 },
  { id: 46, type: "tax",      name: "Premium Tax",  subname: "Pay $75",                             taxAmount: 75,                                         color: "none",                                                                                                 position: "left", index: 9 },
  { id: 47, type: "property", name: "New York",    subname: "USA",      flagCode: "us", price: 400, baseRent: 50, rentLevels: [50,200,600,1400,1700,2000], color: "darkblue", group: "usa-premium",    mortgageValue: 200, houseCost: 200, hotelCost: 200, position: "left", index: 10 },
];

export const TOTAL_TILES = 48;
export const CORNER_TILE_IDS = [0, 12, 24, 36];

export const TREASURE_CARDS = [
  { id: 1,  text: "Bank dividend! Collect $50.",                       action: "collect",          amount: 50  },
  { id: 2,  text: "Birthday! Collect $10 from each player.",           action: "collect-from-all", amount: 10  },
  { id: 3,  text: "Tax refund! Collect $20.",                          action: "collect",          amount: 20  },
  { id: 4,  text: "Street repair: Pay $40/house, $115/hotel.",         action: "pay-per-building", houseAmount: 40, hotelAmount: 115 },
  { id: 5,  text: "Doctor's fees. Pay $50.",                           action: "pay",              amount: 50  },
  { id: 6,  text: "Sale of stock! Collect $45.",                       action: "collect",          amount: 45  },
  { id: 7,  text: "Advance to Start. Collect $200.",                   action: "move-to-start"                 },
  { id: 8,  text: "Get out of jail free.",                             action: "jail-free"                     },
  { id: 9,  text: "Won second prize in beauty contest. Collect $10.",  action: "collect",          amount: 10  },
  { id: 10, text: "Collect $100 consulting fee.",                      action: "collect",          amount: 100 },
];

export const SURPRISE_CARDS = [
  { id: 1,  text: "Advance to Start. Collect $200.",         action: "move-to-start"             },
  { id: 2,  text: "Go directly to prison.",                  action: "go-to-prison"              },
  { id: 3,  text: "Get out of jail free.",                   action: "jail-free"                 },
  { id: 4,  text: "Go back 3 spaces.",                       action: "move-back",   amount: 3    },
  { id: 5,  text: "Speeding fine. Pay $15.",                 action: "pay",         amount: 15   },
  { id: 6,  text: "Bank pays dividend of $50.",              action: "collect",     amount: 50   },
  { id: 7,  text: "Advance to nearest airport.",             action: "move-to-airport"           },
  { id: 8,  text: "Pay each player $50.",                    action: "pay-all",     amount: 50   },
  { id: 9,  text: "Building loan matures. Collect $150.",    action: "collect",     amount: 150  },
  { id: 10, text: "Drunk in charge. Fine $20.",              action: "pay",         amount: 20   },
];

export function getTileById(id: number): BoardTile | undefined {
  return BOARD_TILES.find(t => t.id === id);
}
export function getPropertyTiles(): BoardTile[] {
  return BOARD_TILES.filter(t => t.type === "property");
}
export function getTilesByColor(color: PropertyColor): BoardTile[] {
  return BOARD_TILES.filter(t => t.color === color);
}
export function getCornerTiles(): BoardTile[] {
  return BOARD_TILES.filter(t =>
    t.type === "start" || t.type === "prison" ||
    t.type === "vacation" || t.type === "go-to-prison"
  );
}

