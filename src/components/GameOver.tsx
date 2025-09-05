"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, RotateCcw, Home, Star, Zap, Target } from 'lucide-react';

interface GameOverProps {
  score: number;
  distance: number;
  obstaclesAvoided: number;
  maxCombo: number;
  timeAlive: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function GameOver({
  score,
  distance,
  obstaclesAvoided,
  maxCombo,
  timeAlive,
  highScore,
  isNewRecord,
  onRestart,
  onMainMenu
}: GameOverProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = () => {
    if (score >= highScore * 0.9) return { rating: 'LEGENDARY', color: 'bg-gradient-to-r from-yellow-400 to-orange-500', stars: 5 };
    if (score >= highScore * 0.7) return { rating: 'EXCELLENT', color: 'bg-gradient-to-r from-purple-500 to-pink-500', stars: 4 };
    if (score >= highScore * 0.5) return { rating: 'GREAT', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', stars: 3 };
    if (score >= highScore * 0.3) return { rating: 'GOOD', color: 'bg-gradient-to-r from-green-500 to-emerald-500', stars: 2 };
    return { rating: 'KEEP TRYING', color: 'bg-gradient-to-r from-gray-500 to-slate-500', stars: 1 };
  };

  const performance = getPerformanceRating();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {isNewRecord ? (
              <div className="relative">
                <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">!</span>
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                <Target className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-3xl font-bold text-white mb-2">
            {isNewRecord ? 'NEW RECORD!' : 'GAME OVER'}
          </CardTitle>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-bold text-lg ${performance.color}`}>
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < performance.stars ? 'text-yellow-300 fill-current' : 'text-gray-400'}`}
                />
              ))}
            </div>
            {performance.rating}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Score Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              {score.toLocaleString()}
            </div>
            <p className="text-slate-400 text-lg">Final Score</p>
            {isNewRecord && (
              <Badge variant="secondary" className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Previous Best: {highScore.toLocaleString()}
              </Badge>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Distance</span>
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{Math.floor(distance)}m</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Obstacles Avoided</span>
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{obstaclesAvoided}</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Max Combo</span>
                <Star className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{maxCombo}x</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Time Survived</span>
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">{formatTime(timeAlive)}</div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            {obstaclesAvoided >= 50 && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Obstacle Master
              </Badge>
            )}
            {maxCombo >= 10 && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Combo King
              </Badge>
            )}
            {distance >= 1000 && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Long Distance
              </Badge>
            )}
            {timeAlive >= 120 && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Survivor
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={onRestart}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
            
            <Button
              onClick={onMainMenu}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold py-3 transition-all duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Main Menu
            </Button>
          </div>

          {/* Tips for improvement */}
          <div className="text-center text-sm text-slate-500 pt-2">
            <p>💡 Tip: Navigate precisely between obstacles to build combos and maximize your score!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}