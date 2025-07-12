import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, GameState, Player } from '../types/game';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface GameContextType {
  appState: AppState;
  setPlayerName: (name: string) => void;
  createGame: () => Promise<void>;
  joinGame: (roomCode: string) => Promise<void>;
  startGame: () => Promise<void>;
  addEmoji: (emoji: string) => Promise<void>;
  playAgain: () => Promise<void>;
  navigateHome: () => void;
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameChannel, setGameChannel] = useState<RealtimeChannel | null>(null);

  // Cleanup realtime subscription on unmount
  useEffect(() => {
    return () => {
      if (gameChannel) {
        gameChannel.unsubscribe();
      }
    };
  }, [gameChannel]);

  const setPlayerName = (name: string) => {
    setAppState(prev => ({ ...prev, playerName: name }));
  };

  const subscribeToGame = (roomCode: string) => {
    // Unsubscribe from previous channel
    if (gameChannel) {
      gameChannel.unsubscribe();
    }

    const channel = supabase
      .channel(`game-${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `room_code=eq.${roomCode}`
        },
        async (payload) => {
          console.log('Game update:', payload);
          await fetchGameState(roomCode);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players'
        },
        async (payload) => {
          console.log('Players update:', payload);
          await fetchGameState(roomCode);
        }
      )
      .subscribe();

    setGameChannel(channel);
  };

  const fetchGameState = async (roomCode: string) => {
    try {
      // Fetch game data
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (gameError) throw gameError;

      // Fetch players data
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameData.id)
        .order('player_order');

      if (playersError) throw playersError;

      // Convert to our app format
      const players: Player[] = playersData.map(player => ({
        id: player.id,
        name: player.name,
        isHost: player.is_host,
        isReady: player.is_ready
      }));

      const gameState: GameState = {
        roomCode: gameData.room_code,
        players,
        currentPlayerIndex: gameData.current_player_index,
        emojiStory: gameData.emoji_story,
        gamePhase: gameData.game_phase,
        timeLeft: 30
      };

      setAppState(prev => ({
        ...prev,
        currentGame: gameState,
        currentPage: gameData.game_phase === 'finished' ? 'story' : 
                    gameData.game_phase === 'playing' ? 'game' : 'lobby'
      }));

    } catch (err) {
      console.error('Error fetching game state:', err);
      setError('Failed to sync game state');
    }
  };

  const createGame = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const roomCode = generateRoomCode();

      // Create game in database
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          room_code: roomCode,
          current_player_index: 0,
          emoji_story: [],
          game_phase: 'waiting'
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Add host player
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: gameData.id,
          name: appState.playerName,
          is_host: true,
          is_ready: true,
          player_order: 0
        });

      if (playerError) throw playerError;

      // Subscribe to real-time updates
      subscribeToGame(roomCode);

      // Fetch initial game state
      await fetchGameState(roomCode);

    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async (roomCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if game exists
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (gameError) {
        throw new Error('Game not found');
      }

      // Get current player count to determine order
      const { data: existingPlayers, error: playersError } = await supabase
        .from('players')
        .select('player_order')
        .eq('game_id', gameData.id)
        .order('player_order', { ascending: false })
        .limit(1);

      if (playersError) throw playersError;

      const nextPlayerOrder = existingPlayers.length > 0 ? existingPlayers[0].player_order + 1 : 0;

      // Add player to game
      const { error: joinError } = await supabase
        .from('players')
        .insert({
          game_id: gameData.id,
          name: appState.playerName,
          is_host: false,
          is_ready: false,
          player_order: nextPlayerOrder
        });

      if (joinError) throw joinError;

      // Subscribe to real-time updates
      subscribeToGame(roomCode);

      // Fetch game state
      await fetchGameState(roomCode);

    } catch (err) {
      console.error('Error joining game:', err);
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = async () => {
    if (!appState.currentGame) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('games')
        .update({ game_phase: 'playing' })
        .eq('room_code', appState.currentGame.roomCode);

      if (error) throw error;

    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    } finally {
      setIsLoading(false);
    }
  };

  const addEmoji = async (emoji: string) => {
    if (!appState.currentGame) return;

    setIsLoading(true);
    setError(null);

    try {
      const newStory = [...appState.currentGame.emojiStory, emoji];
      const nextPlayerIndex = (appState.currentGame.currentPlayerIndex + 1) % appState.currentGame.players.length;
      const isGameFinished = newStory.length >= 10;

      const { error } = await supabase
        .from('games')
        .update({
          emoji_story: newStory,
          current_player_index: nextPlayerIndex,
          game_phase: isGameFinished ? 'finished' : 'playing'
        })
        .eq('room_code', appState.currentGame.roomCode);

      if (error) throw error;

    } catch (err) {
      console.error('Error adding emoji:', err);
      setError('Failed to add emoji');
    } finally {
      setIsLoading(false);
    }
  };

  const playAgain = async () => {
    if (!appState.currentGame) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('games')
        .update({
          emoji_story: [],
          current_player_index: 0,
          game_phase: 'playing'
        })
        .eq('room_code', appState.currentGame.roomCode);

      if (error) throw error;

    } catch (err) {
      console.error('Error restarting game:', err);
      setError('Failed to restart game');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateHome = () => {
    // Cleanup subscription
    if (gameChannel) {
      gameChannel.unsubscribe();
      setGameChannel(null);
    }

    setAppState(prev => ({
      ...prev,
      currentGame: null,
      currentPage: 'home'
    }));
    setError(null);
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
      navigateHome,
      isLoading,
      error
    }}>
      {children}
    </GameContext.Provider>
  );
};