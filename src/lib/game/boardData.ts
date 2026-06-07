// src/lib/game/boardData.ts

export type TileType =
  | "start" | "property" | "airport" | "tax" | "treasure" 
  | "surprise" | "utility" | "prison" | "go-to-prison" | "vacation";

export type PropertyColor =
  | "brown" | "lightblue" | "pink" | "orange" | "red" 
  | "yellow" | "green" | "teal" | "darkblue" | "purple" | "none";

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
}

export const COLOR_HEX: Record<PropertyColor, string> = {
  brown:    "#92400e", lightblue:"#38bdf8", pink:     "#f472b6",
  orange:   "#f97316", red:      "#ef4444", yellow:   "#facc15",
  green:    "#10b981", teal:     "#14b8a6", darkblue: "#1d4ed8",
  purple:   "#7e22ce", none:     "#4b5563",
};

// 48-Tile Mr. Worldwide Layout
export const BOARD_TILES: BoardTile[] = [
  // ── SIDE 1 (Bottom Edge moving Left) ──
  { id: 0,  type: "start",    name: "START",        subname: "Collect $200" },
  { id: 1,  type: "property", name: "Salvador",     subname: "Brazil",   flagCode: "br", price: 60,  baseRent: 2,  rentLevels: [2,10,30,90,160,250],       color: "brown",    group: "brazil",  mortgageValue: 30,  houseCost: 50,  hotelCost: 50 },
  { id: 2,  type: "treasure", name: "Treasure" },
  { id: 3,  type: "property", name: "Rio",          subname: "Brazil",   flagCode: "br", price: 60,  baseRent: 4,  rentLevels: [4,20,60,180,320,450],      color: "brown",    group: "brazil",  mortgageValue: 30,  houseCost: 50,  hotelCost: 50 },
  { id: 4,  type: "tax",      name: "Earnings Tax", subname: "Pay 10%",  taxAmount: 0.1 },
  { id: 5,  type: "property", name: "Tel Aviv",     subname: "Israel",   flagCode: "il", price: 100, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "lightblue",group: "israel",  mortgageValue: 50,  houseCost: 50,  hotelCost: 50 },
  { id: 6,  type: "airport",  name: "TLV Airport",  subname: "Ben Gurion",flagCode: "il", price: 200, mortgageValue: 100 },
  { id: 7,  type: "property", name: "Haifa",        subname: "Israel",   flagCode: "il", price: 100, baseRent: 6,  rentLevels: [6,30,90,270,400,550],      color: "lightblue",group: "israel",  mortgageValue: 50,  houseCost: 50,  hotelCost: 50 },
  { id: 8,  type: "property", name: "Jerusalem",    subname: "Israel",   flagCode: "il", price: 110, baseRent: 8,  rentLevels: [8,40,100,300,450,600],     color: "lightblue",group: "israel",  mortgageValue: 55,  houseCost: 50,  hotelCost: 50 },
  { id: 9,  type: "surprise", name: "Surprise" },
  { id: 10, type: "property", name: "Mumbai",       subname: "India",    flagCode: "in", price: 120, baseRent: 8,  rentLevels: [8,45,120,350,500,650],     color: "pink",     group: "india",   mortgageValue: 60,  houseCost: 100, hotelCost: 100 },
  { id: 11, type: "property", name: "New Delhi",    subname: "India",    flagCode: "in", price: 130, baseRent: 10, rentLevels: [10,45,130,400,575,700],    color: "pink",     group: "india",   mortgageValue: 65,  houseCost: 100, hotelCost: 100 },
  
  // ── SIDE 2 (Left Edge moving Up) ──
  { id: 12, type: "prison",   name: "Prison",       subname: "Just Visiting" },
  { id: 13, type: "property", name: "Venice",       subname: "Italy",    flagCode: "it", price: 140, baseRent: 10, rentLevels: [10,50,150,450,625,750],    color: "orange",   group: "italy",   mortgageValue: 70,  houseCost: 100, hotelCost: 100 },
  { id: 14, type: "property", name: "Bologna",      subname: "Italy",    flagCode: "it", price: 140, baseRent: 10, rentLevels: [10,50,150,450,625,750],    color: "orange",   group: "italy",   mortgageValue: 70,  houseCost: 100, hotelCost: 100 },
  { id: 15, type: "utility",  name: "Electric Co.", subname: "Utility",  price: 150, mortgageValue: 75 },
  { id: 16, type: "property", name: "Milan",        subname: "Italy",    flagCode: "it", price: 160, baseRent: 12, rentLevels: [12,60,180,500,700,900],    color: "orange",   group: "italy",   mortgageValue: 80,  houseCost: 100, hotelCost: 100 },
  { id: 17, type: "property", name: "Rome",         subname: "Italy",    flagCode: "it", price: 160, baseRent: 12, rentLevels: [12,60,180,500,700,900],    color: "orange",   group: "italy",   mortgageValue: 80,  houseCost: 100, hotelCost: 100 },
  { id: 18, type: "airport",  name: "MUC Airport",  subname: "Munich Hub",flagCode: "de", price: 200, mortgageValue: 100 },
  { id: 19, type: "property", name: "Frankfurt",    subname: "Germany",  flagCode: "de", price: 180, baseRent: 14, rentLevels: [14,70,200,550,750,950],    color: "red",      group: "germany", mortgageValue: 90,  houseCost: 100, hotelCost: 100 },
  { id: 20, type: "treasure", name: "Treasure" },
  { id: 21, type: "property", name: "Munich",       subname: "Germany",  flagCode: "de", price: 180, baseRent: 14, rentLevels: [14,70,200,550,750,950],    color: "red",      group: "germany", mortgageValue: 90,  houseCost: 100, hotelCost: 100 },
  { id: 22, type: "utility",  name: "Gas Company",  subname: "Utility",  price: 150, mortgageValue: 75 },
  { id: 23, type: "property", name: "Berlin",       subname: "Germany",  flagCode: "de", price: 200, baseRent: 16, rentLevels: [16,80,220,600,800,1000],   color: "red",      group: "germany", mortgageValue: 100, houseCost: 100, hotelCost: 100 },

  // ── SIDE 3 (Top Edge moving Right) ──
  { id: 24, type: "vacation", name: "Vacation",     subname: "Free Parking" },
  { id: 25, type: "property", name: "Shenzhen",     subname: "China",    flagCode: "cn", price: 220, baseRent: 18, rentLevels: [18,90,250,700,875,1050],   color: "yellow",   group: "china",   mortgageValue: 110, houseCost: 150, hotelCost: 150 },
  { id: 26, type: "surprise", name: "Surprise" },
  { id: 27, type: "property", name: "Beijing",      subname: "China",    flagCode: "cn", price: 220, baseRent: 18, rentLevels: [18,90,250,700,875,1050],   color: "yellow",   group: "china",   mortgageValue: 110, houseCost: 150, hotelCost: 150 },
  { id: 28, type: "treasure", name: "Treasure" },
  { id: 29, type: "property", name: "Shanghai",     subname: "China",    flagCode: "cn", price: 240, baseRent: 20, rentLevels: [20,100,300,750,925,1100],  color: "yellow",   group: "china",   mortgageValue: 120, houseCost: 150, hotelCost: 150 },
  { id: 30, type: "airport",  name: "CDG Airport",  subname: "Paris Hub", flagCode: "fr", price: 200, mortgageValue: 100 },
  { id: 31, type: "property", name: "Toulouse",     subname: "France",   flagCode: "fr", price: 260, baseRent: 22, rentLevels: [22,110,330,800,975,1150],  color: "green",    group: "france",  mortgageValue: 130, houseCost: 150, hotelCost: 150 },
  { id: 32, type: "property", name: "Paris",        subname: "France",   flagCode: "fr", price: 260, baseRent: 22, rentLevels: [22,110,330,800,975,1150],  color: "green",    group: "france",  mortgageValue: 130, houseCost: 150, hotelCost: 150 },
  { id: 33, type: "utility",  name: "Water Works",  subname: "Utility",  price: 150, mortgageValue: 75 },
  { id: 34, type: "property", name: "Yokohama",     subname: "Japan",    flagCode: "jp", price: 280, baseRent: 24, rentLevels: [24,120,360,850,1025,1200], color: "teal",     group: "japan",   mortgageValue: 140, houseCost: 150, hotelCost: 150 },
  { id: 35, type: "property", name: "Tokyo",        subname: "Japan",    flagCode: "jp", price: 280, baseRent: 24, rentLevels: [24,120,360,850,1025,1200], color: "teal",     group: "japan",   mortgageValue: 140, houseCost: 150, hotelCost: 150 },

  // ── SIDE 4 (Right Edge moving Down) ──
  { id: 36, type: "go-to-prison", name: "Go to Prison", subname: "No passing GO" },
  { id: 37, type: "property", name: "Liverpool",    subname: "UK",       flagCode: "gb", price: 300, baseRent: 26, rentLevels: [26,130,390,900,1100,1275], color: "darkblue", group: "uk",      mortgageValue: 150, houseCost: 200, hotelCost: 200 },
  { id: 38, type: "property", name: "Manchester",   subname: "UK",       flagCode: "gb", price: 300, baseRent: 26, rentLevels: [26,130,390,900,1100,1275], color: "darkblue", group: "uk",      mortgageValue: 150, houseCost: 200, hotelCost: 200 },
  { id: 39, type: "treasure", name: "Treasure" },
  { id: 40, type: "property", name: "Birmingham",   subname: "UK",       flagCode: "gb", price: 320, baseRent: 28, rentLevels: [28,150,450,1000,1200,1400],color: "darkblue", group: "uk",      mortgageValue: 160, houseCost: 200, hotelCost: 200 },
  { id: 41, type: "property", name: "London",       subname: "UK",       flagCode: "gb", price: 320, baseRent: 28, rentLevels: [28,150,450,1000,1200,1400],color: "darkblue", group: "uk",      mortgageValue: 160, houseCost: 200, hotelCost: 200 },
  { id: 42, type: "airport",  name: "JFK Airport",  subname: "New York", flagCode: "us", price: 200, mortgageValue: 100 },
  { id: 43, type: "property", name: "Los Angeles",  subname: "USA",      flagCode: "us", price: 350, baseRent: 35, rentLevels: [35,175,500,1100,1300,1500],color: "purple",   group: "usa",     mortgageValue: 175, houseCost: 200, hotelCost: 200 },
  { id: 44, type: "surprise", name: "Surprise" },
  { id: 45, type: "property", name: "San Francisco",subname: "USA",      flagCode: "us", price: 360, baseRent: 40, rentLevels: [40,180,540,1200,1450,1675],color: "purple",   group: "usa",     mortgageValue: 180, houseCost: 200, hotelCost: 200 },
  { id: 46, type: "tax",      name: "Premium Tax",  subname: "Pay $75",  taxAmount: 75 },
  { id: 47, type: "property", name: "New York",     subname: "USA",      flagCode: "us", price: 400, baseRent: 50, rentLevels: [50,200,600,1400,1700,2000],color: "purple",   group: "usa",     mortgageValue: 200, houseCost: 200, hotelCost: 200 },
];

export const TOTAL_TILES = 48;
export const CORNER_TILE_IDS = [0, 12, 24, 36];

// The Cards Arrays... (keep exactly as you had them)
export const TREASURE_CARDS = [
  { id: 1,  text: "Bank dividend! Collect $50.", action: "collect", amount: 50 },
  { id: 2,  text: "Birthday! Collect $10 from each player.", action: "collect-from-all", amount: 10 },
  { id: 3,  text: "Tax refund! Collect $20.", action: "collect", amount: 20 },
  { id: 4,  text: "Street repair: Pay $40/house, $115/hotel.", action: "pay-per-building", houseAmount: 40, hotelAmount: 115 },
  { id: 5,  text: "Doctor's fees. Pay $50.", action: "pay", amount: 50 },
  { id: 6,  text: "Sale of stock! Collect $45.", action: "collect", amount: 45 },
  { id: 7,  text: "Advance to Start. Collect $200.", action: "move-to-start" },
  { id: 8,  text: "Get out of jail free.", action: "jail-free" },
  { id: 9,  text: "Won second prize in beauty contest. Collect $10.", action: "collect", amount: 10 },
  { id: 10, text: "Collect $100 consulting fee.", action: "collect", amount: 100 },
];

export const SURPRISE_CARDS = [
  { id: 1,  text: "Advance to Start. Collect $200.", action: "move-to-start" },
  { id: 2,  text: "Go directly to prison.", action: "go-to-prison" },
  { id: 3,  text: "Get out of jail free.", action: "jail-free" },
  { id: 4,  text: "Go back 3 spaces.", action: "move-back", amount: 3 },
  { id: 5,  text: "Speeding fine. Pay $15.", action: "pay", amount: 15 },
  { id: 6,  text: "Bank pays dividend of $50.", action: "collect", amount: 50 },
  { id: 7,  text: "Advance to nearest airport.", action: "move-to-airport" },
  { id: 8,  text: "Pay each player $50.", action: "pay-all", amount: 50 },
  { id: 9,  text: "Building loan matures. Collect $150.", action: "collect", amount: 150 },
  { id: 10, text: "Drunk in charge. Fine $20.", action: "pay", amount: 20 },
];

export function getTileById(id: number): BoardTile | undefined { return BOARD_TILES.find(t => t.id === id); }
export function getPropertyTiles(): BoardTile[] { return BOARD_TILES.filter(t => t.type === "property"); }
export function getTilesByColor(color: PropertyColor): BoardTile[] { return BOARD_TILES.filter(t => t.color === color); }