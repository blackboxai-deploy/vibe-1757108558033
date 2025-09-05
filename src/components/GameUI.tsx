'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX,
  Zap,
  Heart,
  Trophy,
  Gauge
} from 'lucide-react';

interface GameStats {
  score: number;
  distance: number;
  speed: number;
  health: number;
  maxHealth: number;
  combo: number;
  level: number;
  obstaclesAvoided: number;
}

interface GameUIProps {
  gameState: 'menu' | 'playing' | 'paused' | 'gameOver';
  stats: GameStats;
  highScore: number;
  isAudioEnabled: boolean;
  onStartGame: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
  onRestartGame: () => void;
  onOpenSettings: () => void;
  onToggleAudio: () => void;
}

export default function GameUI({
  gameState,
  stats,
  highScore,
  isAudioEnabled,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onRestartGame,
  onOpenSettings,
  onToggleAudio
}: GameUIProps) {
  const healthPercentage = (stats.health / stats.maxHealth) * 100;
  const speedPercentage = Math.min((stats.speed / 200) * 100, 100);

  // Main Menu UI
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-black/20" />
        <Card className="relative z-10 w-full max-w-md mx-4 p-8 bg-slate-800/90 border-blue-500/30 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                3D RACING
              </h1>
              <p className="text-slate-300 text-lg">Navigate Through Obstacles</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">High Score</span>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <Trophy className="w-4 h-4 mr-1" />
                  {highScore.toLocaleString()}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={onStartGame}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={onOpenSettings}
                  variant="outline" 
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                
                <Button 
                  onClick={onToggleAudio}
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  size="icon"
                >
                  {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>Controls: Arrow Keys or WASD</p>
              <p>Mobile: Touch to steer</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Game Over UI
  if (gameState === 'gameOver') {
    const isNewHighScore = stats.score > highScore;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4 p-8 bg-slate-800/95 border-red-500/30">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-red-400">Game Over</h2>
              {isNewHighScore && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <Trophy className="w-4 h-4 mr-1" />
                  New High Score!
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{stats.score.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Final Score</div>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{Math.round(stats.distance)}m</div>
                  <div className="text-xs text-slate-400">Distance</div>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{stats.obstaclesAvoided}</div>
                  <div className="text-xs text-slate-400">Obstacles</div>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">L{stats.level}</div>
                  <div className="text-xs text-slate-400">Level</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={onRestartGame}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              
              <Button 
                onClick={onStartGame}
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Pause Menu UI
  if (gameState === 'paused') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="w-full max-w-sm mx-4 p-6 bg-slate-800/95 border-blue-500/30">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-blue-400">Game Paused</h2>
            
            <div className="space-y-3">
              <Button 
                onClick={onResumeGame}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
              
              <Button 
                onClick={onRestartGame}
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
              
              <Button 
                onClick={onStartGame}
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Main Menu
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // In-Game HUD UI
  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Score and Stats */}
        <Card className="p-4 bg-slate-900/80 border-blue-500/30 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-400">{stats.score.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Score</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <div className="text-lg font-semibold text-green-400">{Math.round(stats.distance)}m</div>
                <div className="text-xs text-slate-400">Distance</div>
              </div>
            </div>
            
            {stats.combo > 1 && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                <Zap className="w-3 h-3 mr-1" />
                {stats.combo}x Combo
              </Badge>
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={onPauseGame}
            variant="outline" 
            size="icon"
            className="bg-slate-900/80 border-slate-600 text-slate-300 hover:bg-slate-700 backdrop-blur-sm"
          >
            <Pause className="w-4 h-4" />
          </Button>
          
          <Button 
            onClick={onToggleAudio}
            variant="outline" 
            size="icon"
            className="bg-slate-900/80 border-slate-600 text-slate-300 hover:bg-slate-700 backdrop-blur-sm"
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
        <Card className="p-4 bg-slate-900/80 border-blue-500/30 backdrop-blur-sm">
          <div className="space-y-3">
            {/* Health Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Heart className="w-4 h-4 text-red-400" />
                  Health
                </div>
                <span className="text-slate-400">{stats.health}/{stats.maxHealth}</span>
              </div>
              <Progress 
                value={healthPercentage} 
                className="h-2 bg-slate-700"
                style={{
                  '--progress-background': healthPercentage > 50 ? '#10b981' : healthPercentage > 25 ? '#f59e0b' : '#ef4444'
                } as React.CSSProperties}
              />
            </div>

            {/* Speed and Level */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Speed: {Math.round(stats.speed)} km/h</span>
                </div>
                <Progress value={speedPercentage} className="w-20 h-1 bg-slate-700" />
              </div>
              
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Level {stats.level}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile Touch Controls Hint */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 md:hidden">
        <div className="text-xs text-slate-400 text-center bg-slate-900/60 px-3 py-1 rounded-full backdrop-blur-sm">
          Touch screen to steer
        </div>
      </div>
    </div>
  );
}