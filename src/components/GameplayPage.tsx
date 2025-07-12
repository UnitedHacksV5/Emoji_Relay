import React, { useState, useEffect } from 'react';
import { Clock, Send, ArrowLeft, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { EmojiPicker } from './EmojiPicker';

export const GameplayPage: React.FC = () => {
  const { appState, addEmoji, navigateHome, isLoading, error } = useGame();
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const game = appState.currentGame!;
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === appState.playerId;

  useEffect(() => {
    if (isMyTurn && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (!isMyTurn) {
      setTimeLeft(30); // Reset timer for next turn
    }
  }, [isMyTurn, timeLeft]);

  const handleSubmitEmoji = async () => {
    if (selectedEmoji && isMyTurn) {
      await addEmoji(selectedEmoji);
      setSelectedEmoji('');
      setTimeLeft(30);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={navigateHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Leave Game
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Emoji Story</h1>
          <div className="w-20"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Story Display */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4 text-center">
            Our Story So Far
          </h2>
          <div className="min-h-24 flex flex-wrap items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl">
            {game.emojiStory.length === 0 ? (
              <span className="text-gray-400 text-lg">Story starts here... ✨</span>
            ) : (
              game.emojiStory.map((emoji, index) => (
                <span
                  key={index}
                  className="text-4xl animate-in zoom-in duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {emoji}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Turn Indicator */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
          <div className="text-center">
            {isMyTurn ? (
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  Your Turn! 🎯
                </h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                    {timeLeft}s
                  </span>
                </div>
                <p className="text-gray-600">
                  Choose an emoji to continue the story
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-blue-600 mb-2">
                  Waiting for {currentPlayer?.name} 🤔
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Their turn to add an emoji</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emoji Selection */}
        {isMyTurn && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Selected Emoji
              </h3>
              <div className="w-16 h-16 bg-gray-50 rounded-xl mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
                {selectedEmoji ? (
                  <span className="text-3xl">{selectedEmoji}</span>
                ) : (
                  <span className="text-gray-400">?</span>
                )}
              </div>
            </div>
            
            <EmojiPicker onSelect={handleEmojiSelect} />
            
            <div className="text-center mt-6">
              <button
                onClick={handleSubmitEmoji}
                disabled={!selectedEmoji || isLoading}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-8 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mx-auto"
              >
                <Send className="w-5 h-5" />
                {isLoading ? 'Adding...' : 'Add to Story'}
              </button>
            </div>
          </div>
        )}

        {/* Players List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Players</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {game.players.map((player, index) => (
              <div
                key={player.id}
                className={`p-3 rounded-xl flex items-center gap-3 ${
                  index === game.currentPlayerIndex
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {player.name}
                    {player.id === appState.playerId && ' (You)'}
                  </div>
                  {index === game.currentPlayerIndex && (
                    <div className="text-sm text-green-600 font-medium">
                      Current turn
                    </div>
                  )}
                </div>
                {index === game.currentPlayerIndex && (
                  <span className="text-2xl">👈</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};