// src/lib/game/boardData.ts

export type TileType =
  | "start" | "property" | "airport" | "tax" | "treasure"
  | "surprise" | "utility" | "prison" | "go-to-prison" | "vacation";

export type PropertyColor =
  | "brown" | "lightblue" | "pink" | "orange" | "red"
  | "yellow" | "green" | "darkblue" | "none";

export interface BoardTile {
  id: number;       // 0–47, clockwise from START
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
  index: number;    // position within that side (0-based, excluding corners)
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

// Board layout (clockwise from top-left):
//
//  TOP-LEFT(0) →→→ top row →→→ TOP-RIGHT(12)
//      ↑                              ↓
//   left col                      right col
//      ↑                              ↓
//  BOT-LEFT(36) ←←← bot row ←←← BOT-RIGHT(24)
//
// Corners:   0=START(top-left), 12=PRISON(top-right),
//            24=VACATION(bot-right), 36=GO-TO-PRISON(bot-left)
// Top row:   ids 1–11   (left→right), position:"top",    index 0–10
// Right col: ids 13–23  (top→bottom), position:"right",  index 0–10
// Bot row:   ids 25–35  (right→left), position:"bottom", index 0–10
// Left col:  ids 37–47  (bottom→top), position:"left",   index 0–10

export const BOARD_TILES: BoardTile[] = [
  // ── CORNERS ──────────────────────────────────────────────────────────────
  { id:  0, type: "start",        name: "START",       subname: "Collect $200", position: "top",    index: -1, color: "none" },
  { id: 12, type: "prison",       name: "Prison",      subname: "Just Visiting",position: "top",    index: -1, color: "none" },
  { id: 24, type: "vacation",     name: "Vacation",    subname: "Skip 1 Turn",  position: "bottom", index: -1, color: "none" },
  { id: 36, type: "go-to-prison", name: "Go to Prison",                         position: "bottom", index: -1, color: "none" },

  // ── TOP ROW — left to right, ids 1–11 ────────────────────────────────────
  { id:  1, type: "property", name: "Treasure",    subname: "Community",                                                                                   color: "none",                                                                                                 position: "top", index: 0  },
  { id:  2, type: "property", name: "Liverpool",   subname: "UK",        flagCode: "gb", price: 240, baseRent: 24, rentLevels: [24,120,360,850,1025,1200], color: "brown",    group: "europe-uk",        mortgageValue: 120, houseCost: 150, hotelCost: 150, position: "top", index: 1  },
  { id:  3, type: "property", name: "Manchester",  subname: "UK",        flagCode: "gb", price: 240, baseRent: 24, rentLevels: [24,120,360,850,1025,1200], color: "brown",    group: "europe-uk",        mortgageValue: 120, houseCost: 150, hotelCost: 150, position: "top", index: 2  },
  { id:  4, type: "treasure", name: "Treasure",    subname: "Community",                                                                                   color: "none",                                                                                                 position: "top", index: 3  },
  { id:  5, type: "property", name: "Birmingham",  subname: "UK",        flagCode: "gb", price: 280, baseRent: 26, rentLevels: [26,130,390,900,1100,1275], color: "brown",    group: "europe-uk",        mortgageValue: 140, houseCost: 200, hotelCost: 200, position: "top", index: 4  },
  { id:  6, type: "property", name: "London",      subname: "UK",        flagCode: "gb", price: 320, baseRent: 28, rentLevels: [28,150,450,1000,1200,1400], color: "brown",   group: "europe-uk",        mortgageValue: 160, houseCost: 200, hotelCost: 200, position: "top", index: 5  },
  { id:  7, type: "utility",  name: "Electric Co.",subname: "Utility",   flagCode: "gb", price: 150,                                                        color: "none",                                                                                                 position: "top", index: 6  },
  { id:  8, type: "airport",  name: "JFK Airport", subname: "New York",  flagCode: "us", price: 200,                                                        color: "none",                                                                                                 position: "top", index: 7  },
  { id:  9, type: "property", name: "San Francisco",subname: "USA",      flagCode: "us", price: 360, baseRent: 35, rentLevels: [35,175,500,1100,1300,1500], color: "darkblue", group: "americas-premium", mortgageValue: 180, houseCost: 200, hotelCost: 200, position: "top", index: 8  },
  { id: 10, type: "property", name: "New York",    subname: "USA",       flagCode: "us", price: 400, baseRent: 50, rentLevels: [50,200,600,1400,1700,2000], color: "darkblue", group: "americas-premium", mortgageValue: 200, houseCost: 200, hotelCost: 200, position: "top", index: 9  },
  { id: 11, type: "utility",  name: "Water Works", subname: "Utility",   flagCode: "us", price: 150,                                                        color: "none",                                                                                                 position: "top", index: 10 },

  // ── RIGHT COLUMN — top to bottom, ids 13–23 ──────────────────────────────
  { id: 13, type: "property", name: "Berlin",      subname: "Germany",   flagCode: "de", price: 200, baseRent: 16, rentLevels: [16,80,220,600,800,1000],   color: "green",    group: "europe-central",   mortgageValue: 100, houseCost: 150, hotelCost: 150, position: "right", index: 0  },
  { id: 14, type: "property", name: "New Delhi",   subname: "India",     flagCode: "in", price: 120, baseRent: 8,  rentLevels: [8,40,100,300,450,600],     color: "yellow",   group: "asia-south",       mortgageValue: 60,  houseCost: 50,  hotelCost: 50,  position: "right", index: 1  },
  { id: 15, type: "surprise", name: "Surprise",                                                                                                             color: "none",                                                                                                 position: "right", index: 2  },
  { id: 16, type: "property", name: "Mumbai",      subname: "India",     flagCode: "in", price: 120, baseRent: 8,  rentLevels: [8,40,100,300,450,600],     color: "yellow",   group: "asia-south",       mortgageValue: 60,  houseCost: 50,  hotelCost: 50,  position: "right", index: 3  },
  { id: 17, type: "tax",      name: "Earnings Tax",subname: "Pay 10%",                               taxAmount: 0.1,                                        color: "none",                                                                                                 position: "right", index: 4  },
  { id: 18, type: "property", name: "Jerusalem",   subname: "Israel",    flagCode: "il", price: 110, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "green",    group: "middle-east",      mortgageValue: 55,  houseCost: 50,  hotelCost: 50,  position: "right", index: 5  },
  { id: 19, type: "property", name: "Haifa",       subname: "Israel",    flagCode: "il", price: 100, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "green",    group: "middle-east",      mortgageValue: 50,  houseCost: 50,  hotelCost: 50,  position: "right", index: 6  },
  { id: 20, type: "airport",  name: "TLV Airport", subname: "Tel Aviv",  flagCode: "il", price: 200,                                                        color: "none",                                                                                                 position: "right", index: 7  },
  { id: 21, type: "property", name: "Tel Aviv",    subname: "Israel",    flagCode: "il", price: 100, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "lightblue",group: "middle-east",      mortgageValue: 50,  houseCost: 50,  hotelCost: 50,  position: "right", index: 8  },
  { id: 22, type: "tax",      name: "Earnings Tax",subname: "Pay $60",                               taxAmount: 60,                                         color: "none",                                                                                                 position: "right", index: 9  },
  { id: 23, type: "treasure", name: "Treasure",    subname: "Community",                                                                                    color: "none",                                                                                                 position: "right", index: 10 },

  // ── BOTTOM ROW — right to left, ids 25–35 ────────────────────────────────
  { id: 25, type: "property", name: "Venice",      subname: "Italy",     flagCode: "it", price: 140, baseRent: 10, rentLevels: [10,50,150,450,625,750],    color: "orange",   group: "europe-south",     mortgageValue: 70,  houseCost: 100, hotelCost: 100, position: "bottom", index: 0  },
  { id: 26, type: "property", name: "Bologna",     subname: "Italy",     flagCode: "it", price: 240, baseRent: 20, rentLevels: [20,100,300,750,925,1100],  color: "orange",   group: "europe-south",     mortgageValue: 120, houseCost: 100, hotelCost: 100, position: "bottom", index: 1  },
  { id: 27, type: "tax",      name: "Luxury Tax",  subname: "Pay $190",                              taxAmount: 190,                                        color: "none",                                                                                                 position: "bottom", index: 2  },
  { id: 28, type: "property", name: "Milan",       subname: "Italy",     flagCode: "it", price: 250, baseRent: 22, rentLevels: [22,110,330,800,975,1150],  color: "red",      group: "europe-south",     mortgageValue: 125, houseCost: 150, hotelCost: 150, position: "bottom", index: 3  },
  { id: 29, type: "property", name: "Rome",        subname: "Italy",     flagCode: "it", price: 260, baseRent: 24, rentLevels: [24,120,360,850,1025,1200], color: "red",      group: "europe-south",     mortgageValue: 130, houseCost: 150, hotelCost: 150, position: "bottom", index: 4  },
  { id: 30, type: "airport",  name: "MUC Airport", subname: "Munich Hub",flagCode: "de", price: 200,                                                        color: "none",                                                                                                 position: "bottom", index: 5  },
  { id: 31, type: "property", name: "Frankfurt",   subname: "Germany",   flagCode: "de", price: 180, baseRent: 14, rentLevels: [14,70,200,550,750,950],    color: "orange",   group: "europe-central",   mortgageValue: 90,  houseCost: 100, hotelCost: 100, position: "bottom", index: 6  },
  { id: 32, type: "property", name: "Munich",      subname: "Germany",   flagCode: "de", price: 180, baseRent: 14, rentLevels: [14,70,200,550,750,950],    color: "orange",   group: "europe-central",   mortgageValue: 90,  houseCost: 100, hotelCost: 100, position: "bottom", index: 7  },
  { id: 33, type: "surprise", name: "Surprise",                                                                                                             color: "none",                                                                                                 position: "bottom", index: 8  },
  { id: 34, type: "tax",      name: "Passing By",  subname: "Pay $130",                              taxAmount: 130,                                        color: "none",                                                                                                 position: "bottom", index: 9  },
  { id: 35, type: "property", name: "Salvador",    subname: "Brazil",    flagCode: "br", price: 60,  baseRent: 2,  rentLevels: [2,10,30,90,160,250],       color: "brown",    group: "americas",         mortgageValue: 30,  houseCost: 50,  hotelCost: 50,  position: "bottom", index: 10 },

  // ── LEFT COLUMN — bottom to top, ids 37–47 ───────────────────────────────
  { id: 37, type: "property", name: "Rio",         subname: "Brazil",    flagCode: "br", price: 60,  baseRent: 2,  rentLevels: [2,10,30,90,160,250],       color: "brown",    group: "americas",         mortgageValue: 30,  houseCost: 50,  hotelCost: 50,  position: "left", index: 0  },
  { id: 38, type: "tax",      name: "Earnings Tax",subname: "Pay 10%",                               taxAmount: 0.1,                                        color: "none",                                                                                                 position: "left", index: 1  },
  { id: 39, type: "property", name: "Tel Aviv",    subname: "Israel",    flagCode: "il", price: 100, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "lightblue",group: "middle-east",      mortgageValue: 50,  houseCost: 50,  hotelCost: 50,  position: "left", index: 2  },
  { id: 40, type: "airport",  name: "TLV Airport", subname: "Ben Gurion",flagCode: "il", price: 200,                                                        color: "none",                                                                                                 position: "left", index: 3  },
  { id: 41, type: "property", name: "Haifa",       subname: "Israel",    flagCode: "il", price: 110, baseRent: 8,  rentLevels: [8,40,100,300,450,600],     color: "lightblue",group: "middle-east",      mortgageValue: 55,  houseCost: 50,  hotelCost: 50,  position: "left", index: 4  },
  { id: 42, type: "property", name: "Jerusalem",   subname: "Israel",    flagCode: "il", price: 100, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "lightblue",group: "middle-east",      mortgageValue: 50,  houseCost: 50,  hotelCost: 50,  position: "left", index: 5  },
  { id: 43, type: "surprise", name: "Surprise",                                                                                                             color: "none",                                                                                                 position: "left", index: 6  },
  { id: 44, type: "property", name: "Mumbai",      subname: "India",     flagCode: "in", price: 120, baseRent: 8,  rentLevels: [8,40,100,300,450,600],     color: "yellow",   group: "asia-south",       mortgageValue: 60,  houseCost: 50,  hotelCost: 50,  position: "left", index: 7  },
  { id: 45, type: "property", name: "New Delhi",   subname: "India",     flagCode: "in", price: 120, baseRent: 8,  rentLevels: [8,40,100,300,450,600],     color: "yellow",   group: "asia-south",       mortgageValue: 60,  houseCost: 50,  hotelCost: 50,  position: "left", index: 8  },
  { id: 46, type: "treasure", name: "Treasure",    subname: "Community",                                                                                    color: "none",                                                                                                 position: "left", index: 9  },
  { id: 47, type: "property", name: "Salvador",    subname: "Brazil",    flagCode: "br", price: 60,  baseRent: 2,  rentLevels: [2,10,30,90,160,250],       color: "brown",    group: "americas",         mortgageValue: 30,  houseCost: 50,  hotelCost: 50,  position: "left", index: 10 },
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