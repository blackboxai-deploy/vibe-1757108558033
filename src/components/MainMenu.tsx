'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, Trophy, Info, Volume2, VolumeX } from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
  onShowSettings: () => void;
  onShowLeaderboard: () => void;
  onShowInstructions: () => void;
  highScore: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function MainMenu({
  onStartGame,
  onShowSettings,
  onShowLeaderboard,
  onShowInstructions,
  highScore,
  soundEnabled,
  onToggleSound
}: MainMenuProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <Card className="relative w-full max-w-md mx-4 bg-black/40 backdrop-blur-xl border-blue-500/30 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            3D Car Racing
          </CardTitle>
          
          <CardDescription className="text-slate-300 text-lg">
            Navigate through obstacles at high speed
          </CardDescription>

          {highScore > 0 && (
            <Badge variant="secondary" className="mx-auto bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Trophy className="w-4 h-4 mr-1" />
              Best: {highScore.toLocaleString()}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Button 
            onClick={onStartGame}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Racing
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={onShowSettings}
              className="h-12 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-200"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>

            <Button 
              variant="outline" 
              onClick={onShowLeaderboard}
              className="h-12 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-200"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Records
            </Button>
          </div>

          <Button 
            variant="outline" 
            onClick={onShowInstructions}
            className="w-full h-12 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-200"
          >
            <Info className="w-5 h-5 mr-2" />
            How to Play
          </Button>

          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSound}
              className="text-slate-400 hover:text-slate-200"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game controls hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4 text-slate-400 text-sm">
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">←→</kbd>
            <span>Steer</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">↑↓</kbd>
            <span>Speed</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">Space</kbd>
            <span>Brake</span>
          </div>
        </div>
      </div>

      {/* Version info */}
      <div className="absolute bottom-4 right-4 text-slate-500 text-xs">
        v1.0.0
      </div>
    </div>
  );
}