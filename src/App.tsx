import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Dashboard } from './screens/Dashboard';
import { GameSetup } from './screens/GameSetup';
import { ActiveGame } from './screens/ActiveGame';
import { Podium } from './screens/Podium';
import { History } from './screens/History';
import { Tournaments } from './screens/Tournaments';
import { PlayerManager } from './screens/PlayerManager';
import { GameEditor } from './screens/GameEditor';
import type { GameSession } from './types';

type Screen =
  | { type: 'dashboard' }
  | { type: 'setup'; gameId: string }
  | { type: 'active' }
  | { type: 'podium'; session: GameSession }
  | { type: 'history' }
  | { type: 'tournaments' }
  | { type: 'players' }
  | { type: 'new-game' };

const AppContent: React.FC = () => {
  const { currentSession, darkMode } = useGame();
  const [screen, setScreen] = useState<Screen>({ type: 'dashboard' });

  useEffect(() => {
    if (currentSession && screen.type !== 'active') {
      setScreen({ type: 'active' });
    }
  }, [currentSession]);

  const handleSelectGame = (gameId: string) => setScreen({ type: 'setup', gameId });
  const handleStartGame = () => setScreen({ type: 'active' });
  const handleFinishGame = () => { if (currentSession) setScreen({ type: 'podium', session: currentSession }); };
  const handleBackToHome = () => setScreen({ type: 'dashboard' });
  const handleOpenHistory = () => setScreen({ type: 'history' });
  const handleOpenTournaments = () => setScreen({ type: 'tournaments' });
  const handleOpenPlayers = () => setScreen({ type: 'players' });
  const handleOpenNewGame = () => setScreen({ type: 'new-game' });
  const handleViewSession = (session: GameSession) => setScreen({ type: 'podium', session });

  const screenContent = (() => {
    switch (screen.type) {
      case 'dashboard':
        return (
          <Dashboard
            onSelectGame={handleSelectGame}
            onOpenHistory={handleOpenHistory}
            onOpenTournaments={handleOpenTournaments}
            onOpenPlayers={handleOpenPlayers}
            onOpenNewGame={handleOpenNewGame}
          />
        );
      case 'setup':
        return <GameSetup gameId={screen.gameId} onBack={handleBackToHome} onStartGame={handleStartGame} />;
      case 'active':
        return <ActiveGame onFinish={handleFinishGame} onQuit={handleBackToHome} />;
      case 'podium':
        return <Podium session={screen.session} onBackToHome={handleBackToHome} />;
      case 'history':
        return <History onBack={handleBackToHome} onViewSession={handleViewSession} />;
      case 'tournaments':
        return <Tournaments onBack={handleBackToHome} />;
      case 'players':
        return <PlayerManager onBack={handleBackToHome} />;
      case 'new-game':
        return <GameEditor onBack={handleBackToHome} />;
      default:
        return null;
    }
  })();

  return (
    <div style={{
      filter: darkMode ? 'none' : 'invert(1) hue-rotate(180deg)',
      minHeight: '100vh',
      transition: 'filter 0.3s ease',
    }}>
      {screenContent}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
