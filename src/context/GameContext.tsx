import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, GameState, Player } from '../types/game';

interface GameContextType {
  appState: AppState;
  setPlayerName: (name: string) => void;
  createGame: () => void;
  joinGame: (roomCode: string) => void;
  startGame: () => void;
  addEmoji: (emoji: string) => void;
  playAgain: () => void;
  navigateHome: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generatePlayerId = () => {
  return Math.random().toString(36).substring(2, 15);
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    playerName: '',
    playerId: generatePlayerId(),
    currentGame: null,
    currentPage: 'home'
  });

  const setPlayerName = (name: string) => {
    setAppState(prev => ({ ...prev, playerName: name }));
  };

  const createGame = () => {
    const newGame: GameState = {
      roomCode: generateRoomCode(),
      players: [{
        id: appState.playerId,
        name: appState.playerName,
        isHost: true,
        isReady: true
      }],
      currentPlayerIndex: 0,
      emojiStory: [],
      gamePhase: 'waiting',
      timeLeft: 30
    };

    setAppState(prev => ({
      ...prev,
      currentGame: newGame,
      currentPage: 'lobby'
    }));
  };

  const joinGame = (roomCode: string) => {
    // Mock joining a game
    const newPlayer: Player = {
      id: appState.playerId,
      name: appState.playerName,
      isHost: false,
      isReady: false
    };

    const mockGame: GameState = {
      roomCode,
      players: [
        { id: 'host123', name: 'GameHost', isHost: true, isReady: true },
        newPlayer
      ],
      currentPlayerIndex: 0,
      emojiStory: [],
      gamePhase: 'waiting',
      timeLeft: 30
    };

    setAppState(prev => ({
      ...prev,
      currentGame: mockGame,
      currentPage: 'lobby'
    }));
  };

  const startGame = () => {
    setAppState(prev => ({
      ...prev,
      currentGame: prev.currentGame ? {
        ...prev.currentGame,
        gamePhase: 'playing'
      } : null,
      currentPage: 'game'
    }));
  };

  const addEmoji = (emoji: string) => {
    setAppState(prev => {
      if (!prev.currentGame) return prev;

      const newStory = [...prev.currentGame.emojiStory, emoji];
      const nextPlayerIndex = (prev.currentGame.currentPlayerIndex + 1) % prev.currentGame.players.length;
      
      // End game after 10 emojis
      const isGameFinished = newStory.length >= 10;

      return {
        ...prev,
        currentGame: {
          ...prev.currentGame,
          emojiStory: newStory,
          currentPlayerIndex: nextPlayerIndex,
          gamePhase: isGameFinished ? 'finished' : 'playing'
        },
        currentPage: isGameFinished ? 'story' : 'game'
      };
    });
  };

  const playAgain = () => {
    setAppState(prev => ({
      ...prev,
      currentGame: prev.currentGame ? {
        ...prev.currentGame,
        emojiStory: [],
        currentPlayerIndex: 0,
        gamePhase: 'playing'
      } : null,
      currentPage: 'game'
    }));
  };

  const navigateHome = () => {
    setAppState(prev => ({
      ...prev,
      currentGame: null,
      currentPage: 'home'
    }));
  };

  return (
    <GameContext.Provider value={{
      appState,
      setPlayerName,
      createGame,
      joinGame,
      startGame,
      addEmoji,
      playAgain,
      navigateHome
    }}>
      {children}
    </GameContext.Provider>
  );
};