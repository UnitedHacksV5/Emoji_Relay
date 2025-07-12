import React from 'react';
import { Copy, Crown, Users, Play, ArrowLeft } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const WaitingLobby: React.FC = () => {
  const { appState, startGame, navigateHome } = useGame();
  const game = appState.currentGame!;
  const isHost = game.players.find(p => p.id === appState.playerId)?.isHost || false;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(game.roomCode);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={navigateHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Waiting Lobby</h1>
          <div className="w-16"></div>
        </div>

        {/* Room Code Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Room Code</h2>
            <div className="inline-flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-xl">
              <span className="text-3xl font-bold text-gray-800 tracking-wider">
                {game.roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                title="Copy room code"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share this code with friends to join the game
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-700">
              Players ({game.players.length})
            </h2>
          </div>
          
          <div className="space-y-3">
            {game.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {player.name}
                      </span>
                      {player.isHost && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {player.id === appState.playerId ? '(You)' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-2xl ${player.isReady ? '' : 'grayscale'}`}>
                    {player.isReady ? '✅' : '⏳'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button (Host Only) */}
        {isHost && (
          <div className="text-center">
            <button
              onClick={startGame}
              disabled={game.players.length < 2}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mx-auto"
            >
              <Play className="w-6 h-6" />
              Start Game 🚀
            </button>
            {game.players.length < 2 && (
              <p className="text-sm text-gray-500 mt-2">
                Need at least 2 players to start
              </p>
            )}
          </div>
        )}

        {/* Waiting Message (Non-Host) */}
        {!isHost && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Waiting for host to start the game...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};