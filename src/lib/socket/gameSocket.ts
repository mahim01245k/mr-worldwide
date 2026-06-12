// src/lib/socket/gameSocket.ts
import { Server, Socket } from "socket.io";
import {
  createGame,
  addPlayerToGame,
  startGame,
  rollDice,
  buyProperty,
  startAuction,
  placeBid,
  finishAuction,
  buildHouse,
  buildHotel,
  mortgageProperty,
  processCard,
  advanceTurn,
} from "../game/gameEngine";
    socket.on("end-turn", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = advanceTurn(gameState);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });
import { GameState } from "@/types/game";
import { v4 as uuidv4 } from "uuid";

// In-memory game store (replace with Redis/DB for production)
const games = new Map<string, GameState>();
const playerRooms = new Map<string, string>(); // playerId -> roomCode

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function setupGameSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("create-room", ({ playerName }: { playerName: string }) => {
      try {
        const roomCode = generateRoomCode();
        const gameState = createGame(roomCode, socket.id, playerName);
        games.set(roomCode, gameState);
        playerRooms.set(socket.id, roomCode);
        socket.join(roomCode);
        socket.emit("room-created", { roomCode, gameState });
        console.log(`Room ${roomCode} created by ${playerName}`);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("join-room", ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      try {
        let gameState = games.get(roomCode);
        if (!gameState) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Check if player is rejoining
        const existingPlayer = gameState.players.find((p) => p.id === socket.id);
        if (!existingPlayer) {
          gameState = addPlayerToGame(gameState, socket.id, playerName);
          games.set(roomCode, gameState);
        } else {
          gameState = {
            ...gameState,
            players: gameState.players.map((p) =>
              p.id === socket.id ? { ...p, isConnected: true } : p
            ),
          };
          games.set(roomCode, gameState);
        }

        playerRooms.set(socket.id, roomCode);
        socket.join(roomCode);
        io.to(roomCode).emit("game-state", gameState);
        io.to(roomCode).emit("player-joined", { playerName, gameState });
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("start-game", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        if (gameState.players[0].id !== socket.id) {
          socket.emit("error", { message: "Only the host can start the game" });
          return;
        }
        gameState = startGame(gameState);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("roll-dice", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = rollDice(gameState, socket.id);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("buy-property", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = buyProperty(gameState, socket.id);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("decline-purchase", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        gameState = startAuction(gameState, currentPlayer.position);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("auction-bid", ({ amount }: { amount: number }) => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = placeBid(gameState, socket.id, amount);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);

        // Auto-finish auction after time limit
        if (gameState.currentAuction) {
          const timeLeft = gameState.currentAuction.endsAt - Date.now();
          if (timeLeft <= 0) {
            gameState = finishAuction(gameState);
            games.set(roomCode, gameState);
            io.to(roomCode).emit("game-state", gameState);
          }
        }
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("finish-auction", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = finishAuction(gameState);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("build-house", ({ tileId }: { tileId: number }) => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = buildHouse(gameState, socket.id, tileId);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("build-hotel", ({ tileId }: { tileId: number }) => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = buildHotel(gameState, socket.id, tileId);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("mortgage-property", ({ tileId }: { tileId: number }) => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = mortgageProperty(gameState, socket.id, tileId);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("process-card", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        gameState = processCard(gameState, socket.id);
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("use-jail-card", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        const players = gameState.players.map((p) =>
          p.id === socket.id && p.jailFreeCards > 0
            ? { ...p, inJail: false, jailTurns: 0, jailFreeCards: p.jailFreeCards - 1 }
            : p
        );
        gameState = { ...gameState, players, updatedAt: Date.now() };
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("pay-jail-fine", () => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        const players = gameState.players.map((p) =>
          p.id === socket.id && p.inJail && p.cash >= 50
            ? { ...p, inJail: false, jailTurns: 0, cash: p.cash - 50 }
            : p
        );
        gameState = { ...gameState, players, updatedAt: Date.now() };
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("propose-trade", (tradeData: any) => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        const trade = {
          id: uuidv4(),
          fromPlayerId: socket.id,
          ...tradeData,
          status: "pending" as const,
        };
        gameState = { ...gameState, pendingTrade: trade, phase: "trading", updatedAt: Date.now() };
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("respond-trade", ({ accept }: { accept: boolean }) => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        const trade = gameState.pendingTrade;
        if (!trade || trade.toPlayerId !== socket.id) return;

        if (accept) {
          const players = gameState.players.map((p) => {
            if (p.id === trade.fromPlayerId) {
              return {
                ...p,
                cash: p.cash - trade.fromCash + trade.toCash,
                properties: [
                  ...p.properties.filter((id) => !trade.fromProperties.includes(id)),
                  ...trade.toProperties,
                ],
              };
            }
            if (p.id === trade.toPlayerId) {
              return {
                ...p,
                cash: p.cash - trade.toCash + trade.fromCash,
                properties: [
                  ...p.properties.filter((id) => !trade.toProperties.includes(id)),
                  ...trade.fromProperties,
                ],
              };
            }
            return p;
          });

          const properties = gameState.properties.map((p) => {
            if (trade.fromProperties.includes(p.tileId)) return { ...p, ownerId: trade.toPlayerId };
            if (trade.toProperties.includes(p.tileId)) return { ...p, ownerId: trade.fromPlayerId };
            return p;
          });

          gameState = {
            ...gameState,
            players,
            properties,
            pendingTrade: undefined,
            phase: "rolling",
            log: [...gameState.log, { id: uuidv4(), timestamp: Date.now(), type: "trade" as const, message: "Trade completed!" }],
            updatedAt: Date.now(),
          };
        } else {
          gameState = {
            ...gameState,
            pendingTrade: undefined,
            phase: "rolling",
            updatedAt: Date.now(),
          };
        }

        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("send-chat", ({ message }: { message: string }) => {
      try {
        const roomCode = playerRooms.get(socket.id);
        if (!roomCode) return;
        let gameState = games.get(roomCode)!;
        const player = gameState.players.find((p) => p.id === socket.id);
        if (!player || !message.trim()) return;

        const chatMsg = {
          id: uuidv4(),
          playerId: socket.id,
          playerName: player.name,
          playerColor: player.color,
          message: message.trim().substring(0, 200),
          timestamp: Date.now(),
        };

        gameState = {
          ...gameState,
          chat: [...gameState.chat.slice(-99), chatMsg],
          updatedAt: Date.now(),
        };
        games.set(roomCode, gameState);
        io.to(roomCode).emit("game-state", gameState);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("get-state", () => {
      const roomCode = playerRooms.get(socket.id);
      if (!roomCode) return;
      const gameState = games.get(roomCode);
      if (gameState) socket.emit("game-state", gameState);
    });

    socket.on("disconnect", () => {
      const roomCode = playerRooms.get(socket.id);
      if (roomCode) {
        let gameState = games.get(roomCode);
        if (gameState) {
          gameState = {
            ...gameState,
            players: gameState.players.map((p) =>
              p.id === socket.id ? { ...p, isConnected: false } : p
            ),
            updatedAt: Date.now(),
          };
          games.set(roomCode, gameState);
          io.to(roomCode).emit("player-left", { playerId: socket.id, gameState });
        }
        playerRooms.delete(socket.id);
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
