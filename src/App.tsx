import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { HomePage } from './components/HomePage';
import { WaitingLobby } from './components/WaitingLobby';
import { GameplayPage } from './components/GameplayPage';
import { FinalStoryPage } from './components/FinalStoryPage';

const AppContent: React.FC = () => {
  const { appState } = useGame();

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'home':
        return <HomePage />;
      case 'lobby':
        return <WaitingLobby />;
      case 'game':
        return <GameplayPage />;
      case 'story':
        return <FinalStoryPage />;
      default:
        return <HomePage />;
    }
  };

  return <>{renderCurrentPage()}</>;
};

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;