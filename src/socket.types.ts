import { Gamestate, PlayerColor } from "./types";

export interface ServerToClientEvents {
  "send-waiting-players": (
    players: Array<{ name: string; color: PlayerColor | null }>
  ) => void;
  "send-gamestate": (game: Gamestate) => void;
}

export interface ClientToServerEvents {
  "start-game": () => void;
  "choose-name": (name: string) => void;
  "choose-color": (name: string, color: PlayerColor) => void;
  "lock-in": (index: number, name: string, id: string) => void;
  "choose-space": (space: number, name: string, id: string) => void;
  "choose-extra": (index: number, id: string) => void;
  reconnect: (id: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  displayName: string;
}
