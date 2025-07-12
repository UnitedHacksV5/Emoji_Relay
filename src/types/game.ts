export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

export interface GameState {
  roomCode: string;
  players: Player[];
  currentPlayerIndex: number;
  emojiStory: string[];
  gamePhase: 'waiting' | 'playing' | 'finished';
  timeLeft: number;
}

export interface AppState {
  playerName: string;
  playerId: string;
  currentGame: GameState | null;
  currentPage: 'home' | 'lobby' | 'game' | 'story';
}