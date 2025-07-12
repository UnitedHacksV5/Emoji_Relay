import React from 'react';
import { Share, RotateCcw, Home, Copy } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const FinalStoryPage: React.FC = () => {
  const { appState, playAgain, navigateHome } = useGame();
  const game = appState.currentGame!;

  const shareStory = async () => {
    const storyText = `Check out our Emoji Relay story: ${game.emojiStory.join(' ')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emoji Relay Story',
          text: storyText,
          url: window.location.origin
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(storyText);
        // Could add a toast notification here
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  const copyStory = async () => {
    try {
      await navigator.clipboard.writeText(game.emojiStory.join(' '));
      // Could add a toast notification here
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Story Complete!</h1>
          <p className="text-lg text-gray-600">Here's the amazing story you created together</p>
        </div>

        {/* Final Story Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-700 mb-6">Your Emoji Story</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {game.emojiStory.map((emoji, index) => (
                  <span
                    key={index}
                    className="text-5xl sm:text-6xl animate-in zoom-in duration-300 hover:scale-110 transition-transform cursor-default"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
            
            <button
              onClick={copyStory}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">Copy story</span>
            </button>
          </div>

          {/* Story Caption Placeholder */}
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-600 italic">
              "A tale of adventure, friendship, and unexpected twists told through the universal language of emojis."
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ✨ AI-generated caption coming soon
            </p>
          </div>
        </div>

        {/* Contributors */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">Story Contributors</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {game.players.map((player) => (
              <div key={player.id} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{player.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={shareStory}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Share className="w-5 h-5" />
            Share Story 📤
          </button>

          <button
            onClick={playAgain}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again 🔁
          </button>

          <button
            onClick={navigateHome}
            className="bg-gray-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            New Game
          </button>
        </div>

        {/* Fun Stats */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-gray-500">
            <span>📊 {game.emojiStory.length} emojis</span>
            <span>👥 {game.players.length} players</span>
            <span>🎮 Epic story!</span>
          </div>
        </div>
      </div>
    </div>
  );
};