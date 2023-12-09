import { CardData } from "./deck";

export type PlayerColor = "red" | "orange" | "green" | "purple";

export type Gamestate = {
  id: string;
  phase: "choosing" | "playing" | "extra-choosing";
  firstPlayerIndex: number;
  currentPlayerIndex: number;
  players: Array<string>;
  playerCount: number;
  playerColors: { [key: string]: PlayerColor };
  deck: Array<CardData>;
  Workshops: Array<PlayerColor | null>;
  Residences: Array<PlayerColor | null>;
  TownspeopleA: Array<PlayerColor | null>;
  TownspeopleB: Array<PlayerColor | null>;
  Trade: Array<PlayerColor | null>;
  Harbor: Array<PlayerColor | null>;
  ships: { [key: string]: number };
  diamonds: { [key: string]: number };
  bonus: {
    Workshops: Array<PlayerColor>;
    Residences: Array<PlayerColor>;
    TownspeopleA: Array<PlayerColor>;
    TownspeopleB: Array<PlayerColor>;
    Trade: Array<PlayerColor>;
  };
  scores: { [key: string]: number };
  hands: Array<Array<CardData>>;
  extras: Array<CardData>;
  chosen: { [key: string]: CardData };
};
