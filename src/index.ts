const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./socket.types";
import { CardData, createDeck } from "./deck";
import { Gamestate, PlayerColor } from "./types";
import { v4 } from "uuid";
import { shuffle } from "./utils";
import {
  harbor,
  residences,
  townspeopleA,
  townspeopleB,
  trade,
  workshops,
} from "./score-funcs";

const port = process.env.PORT || 3000;

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

const locations = [
  "Workshops",
  "Residences",
  "TownspeopleA",
  "TownspeopleB",
  "Trade",
  "Harbor",
];
const extraSort = (a: CardData, b: CardData) => {
  const indexA = locations.indexOf(a.location);
  const indexB = locations.indexOf(b.location);

  if (indexA !== indexB) return indexB - indexA;
  if ("symbol" in a && "symbol" in b) {
    const symbolA = a.symbol;
    const symbolB = b.symbol;

    if (symbolA === symbolB) return a.value - b.value;
    else return symbolA.localeCompare(symbolB);
  } else {
    return a.value - b.value;
  }
};

const createGame = (): Gamestate => {
  const deck = createDeck();
  const players = waitingColors.map((wc) => wc.name);
  const extras = deck.splice(0, players.length === 3 ? 4 : 9).sort(extraSort);

  const playerCount = players.length;
  const hands = Array.from({ length: playerCount }, () => deck.splice(0, 5));
  const playerColors = waitingColors.reduce(
    (a: Gamestate["playerColors"], b) => ({ ...a, [b.name]: b.color! }),
    {}
  );
  const scores = players.reduce((a, b) => ({ ...a, [b]: 0 }), {});
  const ships = players.reduce((a, b) => ({ ...a, [b]: 0 }), {});
  const diamonds = players.reduce((a, b) => ({ ...a, [b]: 27 }), {});

  return {
    id: v4(),
    phase: "choosing",
    firstPlayerIndex: 0,
    currentPlayerIndex: 0,
    players: shuffle(players),
    playerColors,
    playerCount,
    deck,
    Workshops: Array(30).fill(null),
    Residences: Array(20).fill(null),
    TownspeopleA: Array(12).fill(null),
    TownspeopleB: Array(12).fill(null),
    Trade: Array(20).fill(null),
    Harbor: Array(15).fill(null),
    ships,
    diamonds,
    bonus: {
      Workshops: [],
      Residences: [],
      TownspeopleA: [],
      TownspeopleB: [],
      Trade: [],
    },
    scores,
    hands,
    chosen: {},
    extras,
  };
};

const games: { [key: string]: Gamestate } = {};
const waitingColors: Array<{ name: string; color: PlayerColor | null }> = [];

const getNames = async () => {
  const sockets = await io.fetchSockets();
  return sockets
    .filter((s) => s.data.displayName)
    .map((s) => s.data.displayName)
    .sort();
};

io.on("connection", (socket) => {
  console.log(`${socket.id} connecting.`);

  io.to(socket.id).emit("send-waiting-players", waitingColors);

  socket.on("choose-name", async (name) => {
    socket.data.displayName = name;
    waitingColors.push({
      name,
      color: null,
    });
    io.emit("send-waiting-players", waitingColors);
  });

  socket.on("choose-color", (name, color) => {
    const found = waitingColors.find((v) => v.name === name);
    if (!found) {
      throw Error(`Could not find ${name} in waitingColors.`);
    }
    found.color = color;
    io.emit("send-waiting-players", waitingColors);
  });

  socket.on("start-game", () => {
    const game = createGame();
    games[game.id] = game;
    io.emit("send-gamestate", game);
  });

  socket.on("lock-in", async (index, name, id) => {
    const game = games[id];
    const nameIdx = game.players.indexOf(name);
    const card = game.hands[nameIdx].splice(index, 1);
    game.chosen[name] = card[0];

    if (Object.keys(game.chosen).length === game.playerCount) {
      game.phase = "playing";
    }

    await new Promise((res) => setTimeout(res, 500));

    io.emit("send-gamestate", game);
  });

  socket.on("reconnect", (id) => {
    io.to(socket.id).emit("send-gamestate", games[id]);
  });

  socket.on("choose-space", (index, name, id) => {
    const game = games[id];
    const card = game.chosen[name];
    const color = game.playerColors[name];

    if (index === -1) {
      // handle moving ship
    } else {
      --game.diamonds[name];
      game[card.location][index] = color;

      let extra = false;
      switch (card.location) {
        case "Residences":
          extra = residences(game, index, name);
          break;
        case "TownspeopleA":
          extra = townspeopleA(game, index, name, card);
          break;
        case "TownspeopleB":
          extra = townspeopleB(game, index, name, card);
          break;
        case "Harbor":
          extra = harbor(game, index, name, card.value);
          break;
        case "Trade":
          extra = trade(game, index, name);
          break;
        case "Workshops":
          extra = workshops(game, index, name);
          break;
      }

      if (extra) {
        game.phase = "extra-choosing";
      } else {
        game.currentPlayerIndex += 1;
        game.currentPlayerIndex %= game.playerCount;

        // DONE PLAYING
        if (game.currentPlayerIndex === game.firstPlayerIndex) {
          if (
            game.hands[0].length === 1 ||
            (game.playerCount === 2 && game.hands[0].length === 2)
          ) {
            console.log("checking for game end or next round");
            if (game.deck.length === 0) {
              // GAME END
            } else {
              // NEXT ROUND
              console.log("next round");
              game.extras.push(...game.hands.flat());
              ++game.firstPlayerIndex;
              game.firstPlayerIndex %= game.playerCount;
              game.currentPlayerIndex = game.firstPlayerIndex;
              game.hands = [];
              for (let i = 0; i < game.playerCount; ++i) {
                game.hands.push(game.deck.splice(0, 5));
              }
            }
          } else {
            // NEXT DRAFT
            game.hands.unshift(game.hands.pop()!);
          }
          game.chosen = {};
          game.phase = "choosing";
        }
      }
    }

    io.emit("send-gamestate", game);
  });

  socket.on("choose-extra", (index: number, id: string) => {
    const game = games[id];
    game.chosen[game.players[game.currentPlayerIndex]] = game.extras[index];
    game.extras.splice(index, 1);
    game.phase = "playing";
    io.emit("send-gamestate", game);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnecting.`);
    if (socket.data.displayName) {
      const index = waitingColors.findIndex(
        (player) => player.name === socket.data.displayName
      );
      waitingColors.splice(index, 1);
    }
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`listening on port ${port}.`);
});
