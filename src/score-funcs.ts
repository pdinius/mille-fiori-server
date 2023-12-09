import { CardData } from "./deck";
import { Gamestate, PlayerColor } from "./types";

const TOWNSPEOPLE_A_SYMBOLS = [
  "coin",
  "lion",
  "cross",
  "lion",
  "cross",
  "coin",
  "lion",
  "cross",
  "coin",
  "lion",
  "cross",
  "coin",
];
const TOWNSPEOPLE_B_SYMBOLS = [
  "shell",
  "fish",
  "crab",
  "fish",
  "crab",
  "shell",
  "fish",
  "crab",
  "shell",
  "fish",
  "crab",
  "shell",
];
const WORKSHOPS_SYMBOLS = [
  "pigments",
  "ash",
  "pigments",
  "lime",
  "ash",
  "lime",
  "ash",
  "quartz",
  "lime",
  "quartz",
  "ash",
  "pigments",
  "quartz",
  "pigments",
  "quartz",
  "pigments",
  "ash",
  "quartz",
  "lime",
  "pigments",
  "quartz",
  "lime",
  "pigments",
  "quartz",
  "lime",
  "pigments",
  "ash",
  "lime",
  "pigments",
  "ash",
];
const RESIDENCE_SCORES = [
  2, 4, 3, 5, 1, 4, 2, 3, 1, 5, 10, 2, 3, 4, 5, 10, 1, 5, 4, 3,
];
const SHIP_TRACK = [
  1, 1, 1, 3, 1, 10, 0, 1, 5, 1, 1, 10, 10, 1, 5, 0, 1, 1, 1, 10,
];
const SHIP_EXTRA = [7, 16, 20];
const BONUS_SCORES = [20, 15, 10, 5];

const colorToName = (game: Gamestate, color: PlayerColor) => {
  return Object.entries(game.playerColors).find((v) => v[1] === color)![0];
};

const gainBonus = (
  game: Gamestate,
  which: "Residences" | "TownspeopleA" | "TownspeopleB" | "Workshops" | "Trade",
  color: PlayerColor,
  name: string
) => {
  --game.diamonds[name];
  game.bonus[which].push(color);
  game.scores[name] += BONUS_SCORES[game.bonus[which].length - 1];
};

export const residences = (game: Gamestate, index: number, name: string) => {
  const color = game.playerColors[name];

  let score = 0;
  while (index > -1 && game.Residences[index] === color) {
    score += RESIDENCE_SCORES[index];
    --index;
  }
  const unique = [
    ...new Set(
      game.Residences.reduce((a: Array<number>, b, i) => {
        if (b !== color) return a;
        return [...a, RESIDENCE_SCORES[i]];
      }, [])
    ),
  ].length;
  game.scores[name] += score;

  if (unique === 3) {
    return true;
  } else if (unique === 4) {
    gainBonus(game, "Residences", color, name);
  } else if (unique === 5) {
    return true;
  }

  return false;
};

export const townspeopleA = (
  game: Gamestate,
  index: number,
  name: string,
  card: CardData
) => {
  if (card.location !== "TownspeopleA") {
    throw Error(
      `Tried to get townspeopleA scoring with non-townspeopleA card.`
    );
  }

  const color = game.playerColors[name];
  const symbol = TOWNSPEOPLE_A_SYMBOLS[index];
  let extra = false;

  if (index < 3) {
    game.scores[colorToName(game, color)] += symbol === card.symbol ? 12 : 6;
    game.scores[colorToName(game, game.TownspeopleA[index + 3]!)] += 3;
    game.scores[colorToName(game, game.TownspeopleA[index + 4]!)] += 3;
    game.scores[colorToName(game, game.TownspeopleA[index + 7]!)] += 1;
    game.scores[colorToName(game, game.TownspeopleA[index + 8]!)] += 1;
    game.scores[colorToName(game, game.TownspeopleA[index + 9]!)] += 1;
    extra = true;
  } else if (index < 7) {
    game.scores[colorToName(game, color)] += symbol === card.symbol ? 6 : 3;
    game.scores[colorToName(game, game.TownspeopleA[index + 4]!)] += 1;
    game.scores[colorToName(game, game.TownspeopleA[index + 5]!)] += 1;
  } else {
    game.scores[colorToName(game, color)] += symbol === card.symbol ? 2 : 1;
  }

  const completed = game.TownspeopleA.reduce((a: Array<string>, b, i) => {
    if (b !== color) return a;
    return [...a, TOWNSPEOPLE_A_SYMBOLS[i]];
  }, []);

  if (
    [...new Set(completed)].length === 3 &&
    completed.filter((u) => u === card.symbol).length === 1
  ) {
    gainBonus(game, "TownspeopleA", color, name);
  }

  return extra;
};

export const townspeopleB = (
  game: Gamestate,
  index: number,
  name: string,
  card: CardData
) => {
  if (card.location !== "TownspeopleB") {
    throw Error(
      `Tried to get townspeopleB scoring with non-townspeopleB card.`
    );
  }

  const color = game.playerColors[name];
  const symbol = TOWNSPEOPLE_B_SYMBOLS[index];
  let extra = false;

  if (index < 3) {
    game.scores[colorToName(game, color)] += symbol === card.symbol ? 12 : 6;
    game.scores[colorToName(game, game.TownspeopleA[index + 3]!)] += 3;
    game.scores[colorToName(game, game.TownspeopleA[index + 4]!)] += 3;
    game.scores[colorToName(game, game.TownspeopleA[index + 7]!)] += 1;
    game.scores[colorToName(game, game.TownspeopleA[index + 8]!)] += 1;
    game.scores[colorToName(game, game.TownspeopleA[index + 9]!)] += 1;
    extra = true;
  } else if (index < 7) {
    game.scores[colorToName(game, color)] += symbol === card.symbol ? 6 : 3;
    game.scores[colorToName(game, game.TownspeopleA[index + 4]!)] += 1;
    game.scores[colorToName(game, game.TownspeopleA[index + 5]!)] += 1;
  } else {
    game.scores[colorToName(game, color)] += symbol === card.symbol ? 2 : 1;
  }

  const completed = game.TownspeopleB.reduce((a: Array<string>, b, i) => {
    if (b !== color) return a;
    return [...a, TOWNSPEOPLE_B_SYMBOLS[i]];
  }, []);

  if (
    [...new Set(completed)].length === 3 &&
    completed.filter((u) => u === card.symbol).length === 1
  ) {
    gainBonus(game, "TownspeopleB", color, name);
  }

  return extra;
};

export const trade = (game: Gamestate, index: number, name: string) => {
  const color = game.playerColors[name];
  const column = game.Trade.filter((_, i) => i % 4 === index % 4);
  const points = column.filter((c) => c !== null).length;
  const frequencies = {
    red: 0,
    orange: 0,
    green: 0,
    purple: 0,
  };
  let extra = false;

  for (const c of column) {
    if (c === null) continue;
    ++frequencies[c];
    game.scores[colorToName(game, c)] += points;
  }

  if (Math.max(...Object.values(frequencies)) > frequencies[color]) {
    extra = true;
  }

  const columns = [
    ...game.Trade.reduce((a: Array<number>, b, i) => {
      if (b !== color) return a;
      return [...a, i % 4];
    }, []),
  ].length;
  if (column.filter((c) => c === color).length === 1 && columns === 4) {
    gainBonus(game, "Trade", color, name);
  }

  return extra;
};

export const harbor = (
  game: Gamestate,
  index: number,
  name: string,
  amt: number
) => {
  game.ships[name] += amt;
  const extra = SHIP_EXTRA.includes(game.ships[name]);
  game.scores[name] += SHIP_TRACK[game.ships[name]];

  const baseIndex = Math.floor(index / 3) * 3;
  if (game.Harbor.slice(baseIndex, baseIndex + 3).every((v) => v !== null)) {
    const pointsBaseIndex = (baseIndex / 3) * 4;
    let points = game.Trade.slice(pointsBaseIndex, pointsBaseIndex + 4).filter(
      (c) => c !== null
    ).length;
    points = (points ** 2 + points) / 2;
    for (let i = baseIndex; i < baseIndex + 3; ++i) {
      game.scores[colorToName(game, game.Harbor[i]!)] += points;
    }
  }

  return extra;
};

export const workshops = (game: Gamestate, index: number, name: string) => {
  const color = game.playerColors[name];

  const seen: Array<number> = [];
  const getGrouping = (index: number) => {
    if (game.Workshops[index] !== color || seen.includes(index)) return 0;
    seen.push(index);
    for (const idx of WORKSHOP_ADJACENCIES[index]) {
      getGrouping(idx);
    }
    return seen;
  };
  getGrouping(index);

  game.scores[name] +=
    seen.length * (WORKSHOPS_SYMBOLS[index] === "pigments" ? 2 : 1);
  
  const group = WORKSHOP_GROUPS.find(g => g.includes(index));
  return group!.every(i => game.Workshops[i] !== null);
};

const WORKSHOP_GROUPS = [
  [0, 7, 8],
  [1, 2, 9],
  [3, 10, 11],
  [4, 5, 12],
  [6, 13, 14],
  [15, 16, 23],
  [17, 24, 25],
  [18, 19, 26],
  [20, 27, 28],
  [21, 22, 29],
];

const WORKSHOP_ADJACENCIES: { [key: number]: Array<number> } = {
  0: [1, 7, 8],
  1: [0, 2, 8, 9],
  2: [1, 3, 9, 10],
  3: [2, 4, 10, 11],
  4: [3, 5, 11, 12],
  5: [4, 12],
  6: [13, 14],
  7: [0, 8, 15],
  8: [0, 1, 7, 9, 15, 16],
  9: [1, 2, 8, 10, 16],
  10: [2, 3, 9, 11, 17],
  11: [3, 4, 10, 12, 17, 18],
  12: [4, 5, 11, 18, 19],
  13: [6, 14, 20, 21],
  14: [6, 13, 21, 22],
  15: [7, 8, 16, 23],
  16: [8, 9, 15, 23],
  17: [10, 11, 18, 24, 25],
  18: [11, 12, 17, 19, 25, 26],
  19: [12, 18, 26, 27],
  20: [13, 19, 21, 27, 28],
  21: [13, 14, 20, 22, 28, 29],
  22: [14, 21, 29],
  23: [15, 16],
  24: [17, 25],
  25: [17, 18, 24, 26],
  26: [18, 19, 25, 27],
  27: [19, 20, 26, 28],
  28: [20, 21, 27, 29],
  29: [21, 22, 28],
};
