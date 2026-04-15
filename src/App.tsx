import React, { useState, useEffect, Suspense, lazy } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Dashboard } from './screens/Dashboard';
import type { GameSession } from './types';

// Lazy-loaded screens for code splitting
const GameSetup = lazy(() => import('./screens/GameSetup').then(m => ({ default: m.GameSetup })));
const ActiveGame = lazy(() => import('./screens/ActiveGame').then(m => ({ default: m.ActiveGame })));
const Podium = lazy(() => import('./screens/Podium').then(m => ({ default: m.Podium })));
const History = lazy(() => import('./screens/History').then(m => ({ default: m.History })));
const Tournaments = lazy(() => import('./screens/Tournaments').then(m => ({ default: m.Tournaments })));
const PlayerManager = lazy(() => import('./screens/PlayerManager').then(m => ({ default: m.PlayerManager })));
const GameEditor = lazy(() => import('./screens/GameEditor').then(m => ({ default: m.GameEditor })));
const GameLibrary = lazy(() => import('./screens/GameLibrary').then(m => ({ default: m.GameLibrary })));

const LoadingFallback = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#0f172a',
  }}>
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6',
      animation: 'spin 0.6s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

type Screen =
  | { type: 'dashboard' }
  | { type: 'setup'; gameId: string }
  | { type: 'active' }
  | { type: 'podium'; session: GameSession }
  | { type: 'history' }
  | { type: 'tournaments' }
  | { type: 'players' }
  | { type: 'new-game' }   // → GameLibrary
  | { type: 'game-editor' }; // → GameEditor (criar do zero)

const AppContent: React.FC = () => {
  const { currentSession, darkMode, clearCurrentSession } = useGame();
  const [screen, setScreen] = useState<Screen>({ type: 'dashboard' });
  const [lastGameId, setLastGameId] = useState<string>('');

  useEffect(() => {
    if (currentSession && screen.type !== 'active') {
      setScreen({ type: 'active' });
    }
  }, [currentSession]);

  const handleSelectGame = (gameId: string) => {
    setLastGameId(gameId);
    setScreen({ type: 'setup', gameId });
  };
  const handleStartGame = () => setScreen({ type: 'active' });
  const handleFinishGame = () => { if (currentSession) setScreen({ type: 'podium', session: currentSession }); };
  const handleBackToHome = () => setScreen({ type: 'dashboard' });
  // Voltar do jogo ativo → volta para o setup do mesmo jogo (não para o menu)
  const handleQuitGame = () => {
    clearCurrentSession();
    if (lastGameId) {
      setScreen({ type: 'setup', gameId: lastGameId });
    } else {
      setScreen({ type: 'dashboard' });
    }
  };
  const handleOpenHistory = () => setScreen({ type: 'history' });
  const handleOpenTournaments = () => setScreen({ type: 'tournaments' });
  const handleOpenPlayers = () => setScreen({ type: 'players' });
  const handleOpenNewGame = () => setScreen({ type: 'new-game' });
  const handleOpenCustomEditor = () => setScreen({ type: 'game-editor' });
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
        return <ActiveGame onFinish={handleFinishGame} onQuit={handleQuitGame} />;
      case 'podium':
        return <Podium session={screen.session} onBackToHome={handleBackToHome} />;
      case 'history':
        return <History onBack={handleBackToHome} onViewSession={handleViewSession} />;
      case 'tournaments':
        return <Tournaments onBack={handleBackToHome} onSelectGame={handleSelectGame} />;
      case 'players':
        return <PlayerManager onBack={handleBackToHome} />;
      case 'new-game':
        return <GameLibrary onBack={handleBackToHome} onCreateCustom={handleOpenCustomEditor} />;
      case 'game-editor':
        return <GameEditor onBack={() => setScreen({ type: 'new-game' })} />;
      default:
        return null;
    }
  })();

  return (
    <div
      className={darkMode ? '' : 'light-mode-invert'}
      style={{
        filter: darkMode ? 'none' : 'invert(1) hue-rotate(180deg)',
        minHeight: '100vh',
        transition: 'filter 0.3s ease',
      }}
    >
      {/* Global style to counter-invert images and videos inside light mode */}
      {!darkMode && (
        <style>{`
          .light-mode-invert img,
          .light-mode-invert video,
          .light-mode-invert [data-no-invert] {
            filter: invert(1) hue-rotate(180deg) !important;
          }
        `}</style>
      )}
      <Suspense fallback={<LoadingFallback />}>
        {screenContent}
      </Suspense>
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
