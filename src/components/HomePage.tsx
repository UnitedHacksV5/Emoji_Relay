import React, { useState } from 'react';
import { Gamepad2, Users, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const HomePage: React.FC = () => {
  const { appState, setPlayerName, createGame, joinGame } = useGame();
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateGame = () => {
    if (appState.playerName.trim()) {
      createGame();
    }
  };

  const handleJoinGame = () => {
    if (appState.playerName.trim() && roomCode.trim()) {
      joinGame(roomCode.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Emoji Relay</h1>
          <p className="text-lg text-gray-600">Tell a story, one emoji at a time</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={appState.playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={20}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCreateGame}
              disabled={!appState.playerName.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Gamepad2 className="w-5 h-5" />
              Create Game 🎉
            </button>

            <button
              onClick={() => setShowJoinInput(!showJoinInput)}
              disabled={!appState.playerName.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Users className="w-5 h-5" />
              Join Game 🔑
            </button>
          </div>

          {/* Join Game Input */}
          {showJoinInput && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-in slide-in-from-top duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABCD12"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all uppercase"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinGame}
                  disabled={!roomCode.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Join
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Gather friends and create emoji stories together!
        </div>
      </div>
    </div>
  );
};