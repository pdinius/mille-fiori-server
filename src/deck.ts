import { shuffle } from "./utils";

const deck: {
  workshops: {
    [key: string]: {
      [key: number]: number;
    };
  };
  townspeople: { [key: string]: { [key: number]: number } };
} = {
  workshops: {
    quartz: {
      1: 1,
      2: 1,
      3: 4,
      4: 1,
      5: 1,
    },
    ash: {
      1: 1,
      2: 2,
      3: 1,
      4: 2,
      5: 1,
    },
    lime: {
      1: 2,
      2: 1,
      3: 1,
      4: 1,
      5: 2,
    },
    pigments: {
      1: 2,
      2: 2,
      3: 1,
      4: 2,
      5: 1,
    },
  },
  townspeople: {
    lion: {
      1: 1,
      2: 1,
      3: 1,
      4: 0,
      5: 1,
    },
    coin: {
      1: 1,
      2: 1,
      3: 1,
      4: 0,
      5: 1,
    },
    cross: {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 0,
    },
    fish: {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 0,
    },
    shell: {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 0,
    },
    crab: {
      1: 1,
      2: 1,
      3: 1,
      4: 0,
      5: 1,
    },
  },
};

export type CardData = { value: number } & (
  | {
      location: "Residences" | "Harbor";
    }
  | {
      location: "Workshops";
      symbol: "quartz" | "ash" | "lime" | "pigments";
    }
  | {
      location: "TownspeopleA";
      symbol: "lion" | "coin" | "cross";
    }
  | {
      location: "TownspeopleB";
      symbol: "fish" | "shell" | "crab";
    }
  | {
      location: "Trade";
      symbol: "glasses" | "carafes" | "jewelry" | "swans";
    }
);

export const createDeck = (): Array<CardData> => {
  const res: Array<CardData> = [];

  for (const symbol in deck.workshops) {
    for (let i = 1; i <= 5; ++i) {
      const qtx = deck.workshops[symbol][i];
      res.push(
        ...Array(qtx).fill({
          location: "Workshops",
          symbol,
          value: i,
        })
      );
    }
  }

  for (const symbol in deck.townspeople) {
    for (let i = 1; i <= 5; ++i) {
      const qtx = deck.townspeople[symbol][i];
      res.push(
        ...Array(qtx).fill({
          location: ["lion", "coin", "cross"].includes(symbol) ? "TownspeopleA" : "TownspeopleB",
          symbol,
          value: i,
        })
      );
    }
  }

  for (let i = 1; i <= 5; ++i) {
    res.push(
      ...Array(4).fill({
        location: "Residences",
        value: i,
      })
    );
    res.push({
      location: "Trade",
      value: i,
      symbol: "glasses",
    });
    res.push({
      location: "Trade",
      value: i,
      symbol: "carafes",
    });
    res.push({
      location: "Trade",
      value: i,
      symbol: "jewelry",
    });
    res.push({
      location: "Trade",
      value: i,
      symbol: "swans",
    });
    res.push(
      ...Array(3).fill({
        location: "Harbor",
        value: i,
      })
    );
  }

  return shuffle(res);
};
