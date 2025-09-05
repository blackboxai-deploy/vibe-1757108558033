'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Settings, Trophy, Zap, Heart, Target } from 'lucide-react';

// Dynamically import the 3D game component to avoid SSR issues
const Game3D = dynamic(() => import('@/components/Game3D'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading 3D Engine...</p>
      </div>
    </div>
  )
});

type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'settings';

interface GameStats {
  score: number;
  distance: number;
  speed: number;
  health: number;
  level: number;
  obstaclesAvoided: number;
  combo: number;
  highScore: number;
}

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    speed: 0,
    health: 100,
    level: 1,
    obstaclesAvoided: 0,
    combo: 0,
    highScore: 0
  });
  const [settings, setSettings] = useState({
    graphics: 'high',
    sound: true,
    controls: 'keyboard'
  });

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('carRacing3D_highScore');
    if (savedHighScore) {
      setGameStats(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
    }
  }, []);

  const startGame = () => {
    setGameState('playing');
    setGameStats(prev => ({
      ...prev,
      score: 0,
      distance: 0,
      speed: 0,
      health: 100,
      level: 1,
      obstaclesAvoided: 0,
      combo: 0
    }));
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const endGame = (finalStats: Partial<GameStats>) => {
    const newStats = { ...gameStats, ...finalStats };
    if (newStats.score > newStats.highScore) {
      newStats.highScore = newStats.score;
      localStorage.setItem('carRacing3D_highScore', newStats.score.toString());
    }
    setGameStats(newStats);
    setGameState('gameOver');
  };

  const resetGame = () => {
    setGameState('menu');
  };

  const openSettings = () => {
    setGameState('settings');
  };

  const MainMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            3D RACER
          </h1>
          <p className="text-blue-200 text-lg">Navigate Through Obstacles</p>
        </div>

        <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              High Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">
              {gameStats.highScore.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button 
            onClick={startGame}
            className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Game
          </Button>
          
          <Button 
            onClick={openSettings}
            variant="outline"
            className="w-full h-12 border-blue-500/50 text-blue-200 hover:bg-blue-500/20"
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Button>
        </div>

        <div className="text-center text-sm text-blue-300 space-y-1">
          <p>Controls: Arrow Keys or WASD</p>
          <p>Mobile: Touch to steer</p>
        </div>
      </div>
    </div>
  );

  const GameHUD = () => (
    <div className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Card className="bg-black/50 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Score:</span>
                  <span className="font-bold text-blue-400">{gameStats.score.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Speed:</span>
                  <span className="font-bold text-yellow-400">{Math.round(gameStats.speed)} km/h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm">Health:</span>
                <Progress value={gameStats.health} className="w-20 h-2" />
                <span className="text-sm font-bold text-red-400">{gameStats.health}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={pauseGame}
            variant="outline"
            size="sm"
            className="bg-black/50 border-blue-500/30 text-white hover:bg-blue-500/20"
          >
            <Pause className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-4 text-white">
          <Badge variant="secondary" className="bg-blue-600/80 text-white">
            Level {gameStats.level}
          </Badge>
          <Badge variant="secondary" className="bg-green-600/80 text-white">
            Distance: {Math.round(gameStats.distance)}m
          </Badge>
          {gameStats.combo > 0 && (
            <Badge variant="secondary" className="bg-purple-600/80 text-white animate-pulse">
              Combo x{gameStats.combo}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const PauseMenu = () => (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
      <Card className="bg-slate-800/90 border-blue-500/30 max-w-sm w-full mx-4">
        <CardHeader>
          <CardTitle className="text-white text-center">Game Paused</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={pauseGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
          <Button 
            onClick={resetGame}
            variant="outline"
            className="w-full border-blue-500/50 text-blue-200 hover:bg-blue-500/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Main Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const GameOverScreen = () => (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
      <Card className="bg-slate-800/90 border-blue-500/30 max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl">Game Over</CardTitle>
          <CardDescription className="text-center text-blue-200">
            {gameStats.score > gameStats.highScore ? "New High Score!" : "Great Run!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-900/30 p-3 rounded">
              <div className="text-2xl font-bold text-blue-400">{gameStats.score.toLocaleString()}</div>
              <div className="text-sm text-blue-200">Final Score</div>
            </div>
            <div className="bg-green-900/30 p-3 rounded">
              <div className="text-2xl font-bold text-green-400">{Math.round(gameStats.distance)}</div>
              <div className="text-sm text-green-200">Distance (m)</div>
            </div>
            <div className="bg-purple-900/30 p-3 rounded">
              <div className="text-2xl font-bold text-purple-400">{gameStats.obstaclesAvoided}</div>
              <div className="text-sm text-purple-200">Obstacles</div>
            </div>
            <div className="bg-yellow-900/30 p-3 rounded">
              <div className="text-2xl font-bold text-yellow-400">{gameStats.level}</div>
              <div className="text-sm text-yellow-200">Level</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={resetGame}
              variant="outline"
              className="w-full border-blue-500/50 text-blue-200 hover:bg-blue-500/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Main Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-sm max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-white">Settings</CardTitle>
          <CardDescription className="text-blue-200">Customize your gaming experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium">Graphics Quality</label>
            <select 
              value={settings.graphics}
              onChange={(e) => setSettings(prev => ({ ...prev, graphics: e.target.value }))}
              className="w-full mt-1 p-2 bg-slate-700 border border-blue-500/30 rounded text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="text-white text-sm font-medium">Controls</label>
            <select 
              value={settings.controls}
              onChange={(e) => setSettings(prev => ({ ...prev, controls: e.target.value }))}
              className="w-full mt-1 p-2 bg-slate-700 border border-blue-500/30 rounded text-white"
            >
              <option value="keyboard">Keyboard</option>
              <option value="touch">Touch</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white text-sm font-medium">Sound Effects</label>
            <Button
              variant={settings.sound ? "default" : "outline"}
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
              className={settings.sound ? "bg-blue-600" : "border-blue-500/50 text-blue-200"}
            >
              {settings.sound ? "On" : "Off"}
            </Button>
          </div>

          <Button 
            onClick={() => setGameState('menu')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Back to Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (gameState === 'menu') {
    return <MainMenu />;
  }

  if (gameState === 'settings') {
    return <SettingsScreen />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Game3D 
        gameState={gameState}
        onGameStateChange={setGameState}
        onStatsUpdate={setGameStats}
        onGameEnd={endGame}
        settings={settings}
      />
      
      {gameState === 'playing' && <GameHUD />}
      {gameState === 'paused' && <PauseMenu />}
      {gameState === 'gameOver' && <GameOverScreen />}
    </div>
  );
}