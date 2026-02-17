import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Dashboard } from './screens/Dashboard';
import { GameSetup } from './screens/GameSetup';
import { ActiveGame } from './screens/ActiveGame';
import { Podium } from './screens/Podium';
import { History } from './screens/History';
import { Tournaments } from './screens/Tournaments';
import type { GameSession } from './types';

type Screen =
  | { type: 'dashboard' }
  | { type: 'setup'; gameId: string }
  | { type: 'active' }
  | { type: 'podium'; session: GameSession }
  | { type: 'history' }
  | { type: 'tournaments' };

const AppContent: React.FC = () => {
  const { currentSession } = useGame();
  const [screen, setScreen] = useState<Screen>({ type: 'dashboard' });

  useEffect(() => {
    if (currentSession && screen.type !== 'active') {
      setScreen({ type: 'active' });
    }
  }, [currentSession]);

  const handleSelectGame = (gameId: string) => {
    setScreen({ type: 'setup', gameId });
  };

  const handleStartGame = () => {
    setScreen({ type: 'active' });
  };

  const handleFinishGame = () => {
    if (currentSession) {
      setScreen({ type: 'podium', session: currentSession });
    }
  };

  const handleBackToHome = () => {
    setScreen({ type: 'dashboard' });
  };

  const handleOpenHistory = () => {
    setScreen({ type: 'history' });
  };

  const handleOpenTournaments = () => {
    setScreen({ type: 'tournaments' });
  };

  const handleViewSession = (session: GameSession) => {
    setScreen({ type: 'podium', session });
  };

  switch (screen.type) {
    case 'dashboard':
      return (
        <Dashboard
          onSelectGame={handleSelectGame}
          onOpenHistory={handleOpenHistory}
          onOpenTournaments={handleOpenTournaments}
        />
      );

    case 'setup':
      return (
        <GameSetup
          gameId={screen.gameId}
          onBack={handleBackToHome}
          onStartGame={handleStartGame}
        />
      );

    case 'active':
      return (
        <ActiveGame
          onFinish={handleFinishGame}
          onQuit={handleBackToHome}
        />
      );

    case 'podium':
      return (
        <Podium
          session={screen.session}
          onBackToHome={handleBackToHome}
        />
      );

    case 'history':
      return (
        <History
          onBack={handleBackToHome}
          onViewSession={handleViewSession}
        />
      );

    case 'tournaments':
      return (
        <Tournaments
          onBack={handleBackToHome}
        />
      );

    default:
      return null;
  }
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
