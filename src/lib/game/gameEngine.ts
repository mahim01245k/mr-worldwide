// src/lib/game/gameEngine.ts
import {
  GameState, Player, PropertyOwnership, GameLog, GamePhase,
  DEFAULT_SETTINGS, PLAYER_COLORS, PLAYER_AVATARS
} from "@/types/game";
import { BOARD_TILES, TREASURE_CARDS, SURPRISE_CARDS, TOTAL_TILES } from "./boardData";
import { v4 as uuidv4 } from "uuid";

export function createGame(roomCode: string, hostId: string, hostName: string): GameState {
  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    color: PLAYER_COLORS[0],
    position: 0,
    cash: DEFAULT_SETTINGS.startingCash,
    netWorth: DEFAULT_SETTINGS.startingCash,
    properties: [],
    inJail: false,
    jailTurns: 0,
    jailFreeCards: 0,
    isBankrupt: false,
    isConnected: true,
    avatar: PLAYER_AVATARS[0],
    housesOwned: 0,
    hotelsOwned: 0,
    consecutiveDoubles: 0,
    lastDice: [1, 1],
  };

  return {
    id: uuidv4(),
    roomCode,
    phase: "waiting",
    players: [hostPlayer],
    currentPlayerIndex: 0,
    properties: [],
    diceValues: [1, 1],
    diceRolled: false,
    freeParkingPot: 0,
    log: [createLog("system", "Game room created! Waiting for players...")],
    chat: [],
    round: 0,
    maxRounds: DEFAULT_SETTINGS.maxRounds,
    startedAt: Date.now(),
    updatedAt: Date.now(),
    settings: DEFAULT_SETTINGS,
  };
}

export function addPlayerToGame(state: GameState, playerId: string, playerName: string): GameState {
  if (state.players.length >= state.settings.maxPlayers) {
    throw new Error("Game is full");
  }
  if (state.phase !== "waiting") {
    throw new Error("Game already started");
  }

  const colorIndex = state.players.length % PLAYER_COLORS.length;
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    color: PLAYER_COLORS[colorIndex],
    position: 0,
    cash: state.settings.startingCash,
    netWorth: state.settings.startingCash,
    properties: [],
    inJail: false,
    jailTurns: 0,
    jailFreeCards: 0,
    isBankrupt: false,
    isConnected: true,
    avatar: PLAYER_AVATARS[colorIndex],
    housesOwned: 0,
    hotelsOwned: 0,
    consecutiveDoubles: 0,
    lastDice: [1, 1],
  };

  return {
    ...state,
    players: [...state.players, newPlayer],
    log: [...state.log, createLog("system", `${playerName} joined the game!`)],
    updatedAt: Date.now(),
  };
}

export function startGame(state: GameState): GameState {
  if (state.players.length < 1) throw new Error("Need at least 2 players");
  return {
    ...state,
    phase: "rolling",
    round: 1,
    log: [...state.log, createLog("system", "Game started! Good luck everyone!")],
    updatedAt: Date.now(),
  };
}

function sendToJail(player: Player): Player {
  return {
    ...player,
    position: 23,
    inJail: true,
    jailTurns: 0,
    consecutiveDoubles: 0,
    lastDice: player.lastDice ?? [1, 1],
  };
}

export function rollDice(state: GameState, playerId: string): GameState {
  if (state.phase !== "rolling") throw new Error("Not time to roll");
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.id !== playerId) throw new Error("Not your turn");

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const isDouble = die1 === die2;
  const total = die1 + die2;

  // Build updated player as a full Player object to avoid inference issues
  let updatedPlayer: Player = {
    ...currentPlayer,
    lastDice: [die1, die2] as [number, number],
    consecutiveDoubles: isDouble ? currentPlayer.consecutiveDoubles + 1 : 0,
  };

  // Three doubles = go to jail
  if (updatedPlayer.consecutiveDoubles >= 3) {
    const jailedPlayer: Player = sendToJail(updatedPlayer);
    const players = state.players.map((p) =>
      p.id === playerId ? jailedPlayer : p
    );
    return {
      ...state,
      players,
      diceValues: [die1, die2],
      diceRolled: true,
      phase: "rolling",
      log: [
        ...state.log,
        createLog("jail", `${currentPlayer.name} rolled 3 doubles and goes to jail!`, playerId),
      ],
      updatedAt: Date.now(),
    };
  }

  // Handle jail
  if (currentPlayer.inJail) {
    if (isDouble) {
      updatedPlayer = { ...updatedPlayer, inJail: false, jailTurns: 0 };
    } else if (currentPlayer.jailTurns >= 2) {
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash - 50,
        inJail: false,
        jailTurns: 0,
      };
    } else {
      updatedPlayer = { ...updatedPlayer, jailTurns: updatedPlayer.jailTurns + 1 };
      const players = state.players.map((p) =>
        p.id === playerId ? updatedPlayer : p
      );
      return advanceTurn({ ...state, players, diceValues: [die1, die2], diceRolled: true, updatedAt: Date.now() });
    }
  }

  const newPosition = (updatedPlayer.position + total) % TOTAL_TILES;
  const passedStart = newPosition < updatedPlayer.position && !currentPlayer.inJail;

  if (passedStart) {
    updatedPlayer = { ...updatedPlayer, cash: updatedPlayer.cash + 200 };
  }

  updatedPlayer = { ...updatedPlayer, position: newPosition };

  const players = state.players.map((p) =>
    p.id === playerId ? updatedPlayer : p
  );

  const newState: GameState = {
    ...state,
    players,
    diceValues: [die1, die2],
    diceRolled: true,
    phase: "action" as GamePhase,
    log: [
      ...state.log,
      createLog(
        "move",
        `${currentPlayer.name} rolled ${die1}+${die2}=${total}${isDouble ? " (Double!)" : ""}${passedStart ? " and collected $200" : ""}`,
        playerId,
        passedStart ? 200 : undefined
      ),
    ],
    updatedAt: Date.now(),
  };

  return processLanding(newState, playerId, newPosition);
}

function processLanding(state: GameState, playerId: string, position: number): GameState {
  const tile = BOARD_TILES.find((t) => t.id === position);
  if (!tile) return state;

  const currentPlayer = state.players.find((p) => p.id === playerId)!;

  switch (tile.type) {
    case "start":
      return advanceTurn(state);

    case "property":
    case "airport":
    case "utility": {
      const owned = state.properties.find((p) => p.tileId === position);
      if (!owned) {
        return { ...state, phase: "buying" };
      } else if (owned.ownerId === playerId) {
        return advanceTurn(state);
      } else if (!owned.isMortgaged) {
        return payRent(state, playerId, position, owned);
      }
      return advanceTurn(state);
    }

    case "tax": {
      const amount =
        tile.taxAmount && tile.taxAmount < 1
          ? Math.floor(currentPlayer.cash * tile.taxAmount)
          : tile.taxAmount || 0;
      return payTax(state, playerId, amount, tile.name);
    }

    case "treasure": {
      const card = TREASURE_CARDS[Math.floor(Math.random() * TREASURE_CARDS.length)];
      return {
        ...state,
        phase: "card",
        currentCard: { type: "treasure", card },
        log: [...state.log, createLog("card", `${currentPlayer.name} drew a Treasure card!`, playerId)],
        updatedAt: Date.now(),
      };
    }

    case "surprise": {
      const card = SURPRISE_CARDS[Math.floor(Math.random() * SURPRISE_CARDS.length)];
      return {
        ...state,
        phase: "card",
        currentCard: { type: "surprise", card },
        log: [...state.log, createLog("card", `${currentPlayer.name} drew a Surprise card!`, playerId)],
        updatedAt: Date.now(),
      };
    }

    case "go-to-prison": {
      const players = state.players.map((p) =>
        p.id === playerId ? sendToJail(p) : p
      );
      return {
        ...state,
        players,
        phase: "rolling",
        log: [...state.log, createLog("jail", `${currentPlayer.name} goes to jail!`, playerId)],
        updatedAt: Date.now(),
      };
    }

    case "vacation": {
      const vacationState: GameState = {
        ...state,
        log: [...state.log, createLog("system", `${currentPlayer.name} is on vacation!`, playerId)],
        updatedAt: Date.now(),
      };
      return advanceTurn(vacationState);
    }

    default:
      return advanceTurn(state);
  }
}

function payRent(
  state: GameState,
  payerId: string,
  tileId: number,
  ownership: PropertyOwnership
): GameState {
  const tile = BOARD_TILES.find((t) => t.id === tileId)!;
  const payer = state.players.find((p) => p.id === payerId)!;
  const owner = state.players.find((p) => p.id === ownership.ownerId)!;

  let rent = 0;

  if (tile.type === "airport") {
    const ownerAirports = state.properties.filter(
      (p) =>
        p.ownerId === ownership.ownerId &&
        BOARD_TILES.find((t) => t.id === p.tileId)?.type === "airport"
    ).length;
    rent = 25 * Math.pow(2, ownerAirports - 1);
  } else if (tile.type === "utility") {
    const ownerUtils = state.properties.filter(
      (p) =>
        p.ownerId === ownership.ownerId &&
        BOARD_TILES.find((t) => t.id === p.tileId)?.type === "utility"
    ).length;
    rent = (state.diceValues[0] + state.diceValues[1]) * (ownerUtils >= 2 ? 10 : 4);
  } else {
    const rentLevel = ownership.hasHotel ? 5 : ownership.houses;
    rent = tile.rentLevels?.[rentLevel] || tile.baseRent || 0;
    if (rentLevel === 0 && tile.group) {
      const groupTiles = BOARD_TILES.filter((t) => t.group === tile.group);
      const ownsAll = groupTiles.every((t) =>
        state.properties.some((p) => p.tileId === t.id && p.ownerId === ownership.ownerId)
      );
      if (ownsAll) rent *= 2;
    }
  }

  const actualRent = Math.min(rent, payer.cash);

  const players = state.players.map((p) => {
    if (p.id === payerId) return { ...p, cash: p.cash - actualRent };
    if (p.id === ownership.ownerId) return { ...p, cash: p.cash + actualRent };
    return p;
  });

  const newState: GameState = {
    ...state,
    players,
    log: [
      ...state.log,
      createLog(
        "rent",
        `${payer.name} paid $${actualRent} rent to ${owner.name} for ${tile.name}`,
        payerId,
        actualRent
      ),
    ],
    updatedAt: Date.now(),
  };

  if (payer.cash - actualRent <= 0) {
    return handleBankruptcy(newState, payerId, ownership.ownerId);
  }

  return advanceTurn(newState);
}

function payTax(state: GameState, playerId: string, amount: number, taxName: string): GameState {
  const player = state.players.find((p) => p.id === playerId)!;
  const actualAmount = Math.min(amount, player.cash);

  const freeParkingPot = state.settings.freeParkingMoney
    ? state.freeParkingPot + actualAmount
    : state.freeParkingPot;

  const players = state.players.map((p) =>
    p.id === playerId ? { ...p, cash: p.cash - actualAmount } : p
  );

  return advanceTurn({
    ...state,
    players,
    freeParkingPot,
    log: [
      ...state.log,
      createLog("tax", `${player.name} paid $${actualAmount} for ${taxName}`, playerId, actualAmount),
    ],
    updatedAt: Date.now(),
  });
}

export function buyProperty(state: GameState, playerId: string): GameState {
  const player = state.players.find((p) => p.id === playerId)!;
  const tile = BOARD_TILES.find((t) => t.id === player.position)!;

  if (!tile.price || player.cash < tile.price) {
    throw new Error("Cannot afford this property");
  }

  const newOwnership: PropertyOwnership = {
    tileId: tile.id,
    ownerId: playerId,
    houses: 0,
    hasHotel: false,
    isMortgaged: false,
    purchasePrice: tile.price,
  };

  const players = state.players.map((p) =>
    p.id === playerId
      ? { ...p, cash: p.cash - tile.price, properties: [...p.properties, tile.id] }
      : p
  );

  return advanceTurn({
    ...state,
    players,
    properties: [...state.properties, newOwnership],
    phase: "rolling" as GamePhase,
    log: [
      ...state.log,
      createLog("purchase", `${player.name} bought ${tile.name} for $${tile.price}`, playerId, tile.price),
    ],
    updatedAt: Date.now(),
  });
}

export function startAuction(state: GameState, tileId: number): GameState {
  return {
    ...state,
    phase: "auction",
    currentAuction: {
      tileId,
      currentBid: 0,
      currentBidderId: null,
      bids: [],
      endsAt: Date.now() + state.settings.auctionDuration * 1000,
      status: "active",
    },
    log: [...state.log, createLog("system", `Auction started for ${BOARD_TILES.find(t => t.id === tileId)?.name}!`)],
    updatedAt: Date.now(),
  };
}

export function placeBid(state: GameState, playerId: string, amount: number): GameState {
  if (!state.currentAuction) throw new Error("No active auction");
  const player = state.players.find((p) => p.id === playerId)!;

  if (amount <= state.currentAuction.currentBid) throw new Error("Bid too low");
  if (amount > player.cash) throw new Error("Not enough cash");

  return {
    ...state,
    currentAuction: {
      ...state.currentAuction,
      currentBid: amount,
      currentBidderId: playerId,
      bids: [...state.currentAuction.bids, { playerId, amount, timestamp: Date.now() }],
    },
    log: [...state.log, createLog("system", `${player.name} bid $${amount}`, playerId, amount)],
    updatedAt: Date.now(),
  };
}

export function finishAuction(state: GameState): GameState {
  if (!state.currentAuction || state.currentAuction.status !== "active") return state;

  const auction = state.currentAuction;
  if (!auction.currentBidderId) {
    return advanceTurn({ ...state, currentAuction: undefined, phase: "rolling" });
  }

  const winner = state.players.find((p) => p.id === auction.currentBidderId)!;
  const tile = BOARD_TILES.find((t) => t.id === auction.tileId)!;

  const newOwnership: PropertyOwnership = {
    tileId: tile.id,
    ownerId: winner.id,
    houses: 0,
    hasHotel: false,
    isMortgaged: false,
    purchasePrice: auction.currentBid,
  };

  const players = state.players.map((p) =>
    p.id === winner.id
      ? { ...p, cash: p.cash - auction.currentBid, properties: [...p.properties, tile.id] }
      : p
  );

  return advanceTurn({
    ...state,
    players,
    properties: [...state.properties, newOwnership],
    currentAuction: { ...auction, status: "finished" },
    log: [
      ...state.log,
      createLog("purchase", `${winner.name} won auction for ${tile.name} at $${auction.currentBid}!`, winner.id, auction.currentBid),
    ],
    updatedAt: Date.now(),
  });
}

export function buildHouse(state: GameState, playerId: string, tileId: number): GameState {
  const tile = BOARD_TILES.find((t) => t.id === tileId)!;
  const ownership = state.properties.find((p) => p.tileId === tileId && p.ownerId === playerId);

  if (!ownership || ownership.hasHotel || ownership.isMortgaged) throw new Error("Cannot build here");
  if (ownership.houses >= 4) throw new Error("Build a hotel instead");

  const player = state.players.find((p) => p.id === playerId)!;
  const cost = tile.houseCost || 100;
  if (player.cash < cost) throw new Error("Not enough cash");

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, cash: p.cash - cost } : p
    ),
    properties: state.properties.map((p) =>
      p.tileId === tileId ? { ...p, houses: p.houses + 1 } : p
    ),
    log: [...state.log, createLog("upgrade", `${player.name} built a house on ${tile.name}`, playerId, cost)],
    updatedAt: Date.now(),
  };
}

export function buildHotel(state: GameState, playerId: string, tileId: number): GameState {
  const tile = BOARD_TILES.find((t) => t.id === tileId)!;
  const ownership = state.properties.find((p) => p.tileId === tileId && p.ownerId === playerId);

  if (!ownership || ownership.houses < 4) throw new Error("Need 4 houses first");

  const player = state.players.find((p) => p.id === playerId)!;
  const cost = tile.hotelCost || 100;
  if (player.cash < cost) throw new Error("Not enough cash");

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, cash: p.cash - cost } : p
    ),
    properties: state.properties.map((p) =>
      p.tileId === tileId ? { ...p, houses: 0, hasHotel: true } : p
    ),
    log: [...state.log, createLog("upgrade", `${player.name} built a hotel on ${tile.name}!`, playerId, cost)],
    updatedAt: Date.now(),
  };
}

export function mortgageProperty(state: GameState, playerId: string, tileId: number): GameState {
  const tile = BOARD_TILES.find((t) => t.id === tileId)!;
  const ownership = state.properties.find((p) => p.tileId === tileId && p.ownerId === playerId);
  if (!ownership || ownership.isMortgaged) throw new Error("Cannot mortgage");

  const mortgageValue = tile.mortgageValue || Math.floor((tile.price || 0) / 2);
  const player = state.players.find((p) => p.id === playerId)!;

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, cash: p.cash + mortgageValue } : p
    ),
    properties: state.properties.map((p) =>
      p.tileId === tileId ? { ...p, isMortgaged: true } : p
    ),
    log: [...state.log, createLog("system", `${player.name} mortgaged ${tile.name} for $${mortgageValue}`, playerId, mortgageValue)],
    updatedAt: Date.now(),
  };
}

export function processCard(state: GameState, playerId: string): GameState {
  if (!state.currentCard) return advanceTurn(state);

  const { card } = state.currentCard;
  const player = state.players.find((p) => p.id === playerId)!;
  let updatedState: GameState = { ...state, currentCard: undefined };

  switch (card.action) {
    case "collect":
      updatedState = {
        ...updatedState,
        players: updatedState.players.map((p) =>
          p.id === playerId ? { ...p, cash: p.cash + card.amount } : p
        ),
        log: [...updatedState.log, createLog("card", `${player.name} collected $${card.amount}: ${card.text}`, playerId, card.amount)],
      };
      break;

    case "pay":
      updatedState = {
        ...updatedState,
        players: updatedState.players.map((p) =>
          p.id === playerId ? { ...p, cash: p.cash - card.amount } : p
        ),
        log: [...updatedState.log, createLog("card", `${player.name} paid $${card.amount}: ${card.text}`, playerId, card.amount)],
      };
      break;

    case "collect-from-all": {
      const collected = card.amount * (state.players.length - 1);
      updatedState = {
        ...updatedState,
        players: updatedState.players.map((p) => {
          if (p.id === playerId) return { ...p, cash: p.cash + collected };
          return { ...p, cash: p.cash - card.amount };
        }),
        log: [...updatedState.log, createLog("card", `${player.name} collected $${card.amount} from each player!`, playerId, collected)],
      };
      break;
    }

    case "go-to-prison":
      updatedState = {
        ...updatedState,
        players: updatedState.players.map((p) =>
          p.id === playerId ? sendToJail(p) : p
        ),
        log: [...updatedState.log, createLog("jail", `${player.name} goes to jail! (Surprise card)`, playerId)],
      };
      break;

    case "jail-free":
      updatedState = {
        ...updatedState,
        players: updatedState.players.map((p) =>
          p.id === playerId ? { ...p, jailFreeCards: p.jailFreeCards + 1 } : p
        ),
        log: [...updatedState.log, createLog("card", `${player.name} got a Get Out of Jail Free card!`, playerId)],
      };
      break;

    case "move-to-start":
      updatedState = {
        ...updatedState,
        players: updatedState.players.map((p) =>
          p.id === playerId ? { ...p, position: 0, cash: p.cash + 200 } : p
        ),
        log: [...updatedState.log, createLog("card", `${player.name} advances to START and collects $200!`, playerId, 200)],
      };
      break;

    case "move-back": {
      const newPos = Math.max(0, player.position - card.amount);
      updatedState = {
        ...updatedState,
        players: updatedState.players.map((p) =>
          p.id === playerId ? { ...p, position: newPos } : p
        ),
        log: [...updatedState.log, createLog("card", `${player.name} moves back ${card.amount} spaces!`, playerId)],
      };
      break;
    }
  }

  return advanceTurn({ ...updatedState, updatedAt: Date.now() });
}

function handleBankruptcy(state: GameState, bankruptId: string, creditorId?: string): GameState {
  const bankrupt = state.players.find((p) => p.id === bankruptId)!;
  const players = state.players.map((p) =>
    p.id === bankruptId ? { ...p, isBankrupt: true, cash: 0 } : p
  );

  const properties = creditorId
    ? state.properties.map((p) =>
        p.ownerId === bankruptId ? { ...p, ownerId: creditorId } : p
      )
    : state.properties.filter((p) => p.ownerId !== bankruptId);

  const activePlayers = players.filter((p) => !p.isBankrupt);
  const winner = activePlayers.length === 1 ? activePlayers[0].id : undefined;

  return {
    ...state,
    players,
    properties,
    phase: winner ? "finished" : "rolling",
    winner,
    log: [
      ...state.log,
      createLog("bankrupt", `${bankrupt.name} has gone bankrupt!`, bankruptId),
      ...(winner ? [createLog("system", `${activePlayers[0].name} wins the game!`)] : []),
    ],
    updatedAt: Date.now(),
  };
}

function advanceTurn(state: GameState): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const rolledDouble =
    state.diceValues[0] === state.diceValues[1] &&
    !currentPlayer.inJail;

  if (rolledDouble && !state.players[state.currentPlayerIndex].isBankrupt) {
    return {
      ...state,
      phase: "rolling",
      diceRolled: false,
      updatedAt: Date.now(),
    };
  }

  let nextIndex = state.currentPlayerIndex;
  let attempts = 0;
  do {
    nextIndex = (nextIndex + 1) % state.players.length;
    attempts++;
  } while (state.players[nextIndex].isBankrupt && attempts < state.players.length);

  const isNewRound = nextIndex <= state.currentPlayerIndex;
  const newRound = isNewRound ? state.round + 1 : state.round;

  if (newRound > state.maxRounds) {
    const winner = [...state.players]
      .filter((p) => !p.isBankrupt)
      .sort((a, b) => calculateNetWorth(b, state) - calculateNetWorth(a, state))[0];
    return {
      ...state,
      phase: "finished",
      winner: winner?.id,
      round: newRound,
      log: [...state.log, createLog("system", `Game over! ${winner?.name} wins with highest net worth!`)],
      updatedAt: Date.now(),
    };
  }

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    phase: "rolling",
    diceRolled: false,
    round: newRound,
    updatedAt: Date.now(),
  };
}

function calculateNetWorth(player: Player, state: GameState): number {
  const propertyValue = state.properties
    .filter((p) => p.ownerId === player.id)
    .reduce((sum, p) => {
      const tile = BOARD_TILES.find((t) => t.id === p.tileId)!;
      return sum + (tile.price || 0) + p.houses * 50 + (p.hasHotel ? 250 : 0);
    }, 0);
  return player.cash + propertyValue;
}

export function createLog(
  type: GameLog["type"],
  message: string,
  playerId?: string,
  amount?: number
): GameLog {
  return { id: uuidv4(), timestamp: Date.now(), type, message, playerId, amount };
}
