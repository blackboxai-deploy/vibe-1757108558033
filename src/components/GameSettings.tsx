"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Volume2, VolumeX, Settings, Monitor, Gamepad2, Palette } from 'lucide-react';

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

export interface GameSettings {
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    shadows: boolean;
    particles: boolean;
    postProcessing: boolean;
    antiAliasing: boolean;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    engineVolume: number;
    muted: boolean;
  };
  controls: {
    sensitivity: number;
    invertY: boolean;
    keyboardLayout: 'wasd' | 'arrows';
    touchControls: boolean;
  };
  gameplay: {
    difficulty: 'easy' | 'normal' | 'hard' | 'expert';
    cameraShake: boolean;
    speedometer: 'kmh' | 'mph';
    showFPS: boolean;
  };
  display: {
    fullscreen: boolean;
    vsync: boolean;
    fov: number;
  };
}

const defaultSettings: GameSettings = {
  graphics: {
    quality: 'high',
    shadows: true,
    particles: true,
    postProcessing: true,
    antiAliasing: true,
  },
  audio: {
    masterVolume: 80,
    musicVolume: 60,
    sfxVolume: 80,
    engineVolume: 70,
    muted: false,
  },
  controls: {
    sensitivity: 50,
    invertY: false,
    keyboardLayout: 'wasd',
    touchControls: true,
  },
  gameplay: {
    difficulty: 'normal',
    cameraShake: true,
    speedometer: 'kmh',
    showFPS: false,
  },
  display: {
    fullscreen: false,
    vsync: true,
    fov: 75,
  },
};

export default function GameSettings({ isOpen, onClose, settings, onSettingsChange }: GameSettingsProps) {
  const [activeTab, setActiveTab] = useState<'graphics' | 'audio' | 'controls' | 'gameplay' | 'display'>('graphics');
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);

  if (!isOpen) return null;

  const updateSettings = (category: keyof GameSettings, key: string, value: any) => {
    const newSettings = {
      ...localSettings,
      [category]: {
        ...localSettings[category],
        [key]: value,
      },
    };
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
  };

  const tabs = [
    { id: 'graphics', label: 'Graphics', icon: Monitor },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'controls', label: 'Controls', icon: Gamepad2 },
    { id: 'gameplay', label: 'Gameplay', icon: Settings },
    { id: 'display', label: 'Display', icon: Palette },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Game Settings
          </CardTitle>
        </CardHeader>
        
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-48 bg-slate-800 border-r border-slate-700">
            <div className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <CardContent className="p-6 text-white">
              {activeTab === 'graphics' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Graphics Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Graphics Quality</Label>
                      <Select
                        value={localSettings.graphics.quality}
                        onValueChange={(value) => updateSettings('graphics', 'quality', value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="ultra">Ultra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Shadows</Label>
                      <Switch
                        checked={localSettings.graphics.shadows}
                        onCheckedChange={(checked) => updateSettings('graphics', 'shadows', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Particle Effects</Label>
                      <Switch
                        checked={localSettings.graphics.particles}
                        onCheckedChange={(checked) => updateSettings('graphics', 'particles', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Post Processing</Label>
                      <Switch
                        checked={localSettings.graphics.postProcessing}
                        onCheckedChange={(checked) => updateSettings('graphics', 'postProcessing', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Anti-Aliasing</Label>
                      <Switch
                        checked={localSettings.graphics.antiAliasing}
                        onCheckedChange={(checked) => updateSettings('graphics', 'antiAliasing', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Audio Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Mute All Audio</Label>
                      <Switch
                        checked={localSettings.audio.muted}
                        onCheckedChange={(checked) => updateSettings('audio', 'muted', checked)}
                      />
                    </div>

                    <Separator className="bg-slate-600" />

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Master Volume: {localSettings.audio.masterVolume}%
                      </Label>
                      <Slider
                        value={[localSettings.audio.masterVolume]}
                        onValueChange={([value]) => updateSettings('audio', 'masterVolume', value)}
                        max={100}
                        step={1}
                        className="w-full"
                        disabled={localSettings.audio.muted}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Music Volume: {localSettings.audio.musicVolume}%
                      </Label>
                      <Slider
                        value={[localSettings.audio.musicVolume]}
                        onValueChange={([value]) => updateSettings('audio', 'musicVolume', value)}
                        max={100}
                        step={1}
                        className="w-full"
                        disabled={localSettings.audio.muted}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Sound Effects: {localSettings.audio.sfxVolume}%
                      </Label>
                      <Slider
                        value={[localSettings.audio.sfxVolume]}
                        onValueChange={([value]) => updateSettings('audio', 'sfxVolume', value)}
                        max={100}
                        step={1}
                        className="w-full"
                        disabled={localSettings.audio.muted}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Engine Sound: {localSettings.audio.engineVolume}%
                      </Label>
                      <Slider
                        value={[localSettings.audio.engineVolume]}
                        onValueChange={([value]) => updateSettings('audio', 'engineVolume', value)}
                        max={100}
                        step={1}
                        className="w-full"
                        disabled={localSettings.audio.muted}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'controls' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Control Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Mouse Sensitivity: {localSettings.controls.sensitivity}%
                      </Label>
                      <Slider
                        value={[localSettings.controls.sensitivity]}
                        onValueChange={([value]) => updateSettings('controls', 'sensitivity', value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Invert Y-Axis</Label>
                      <Switch
                        checked={localSettings.controls.invertY}
                        onCheckedChange={(checked) => updateSettings('controls', 'invertY', checked)}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Keyboard Layout</Label>
                      <Select
                        value={localSettings.controls.keyboardLayout}
                        onValueChange={(value) => updateSettings('controls', 'keyboardLayout', value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wasd">WASD</SelectItem>
                          <SelectItem value="arrows">Arrow Keys</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Touch Controls (Mobile)</Label>
                      <Switch
                        checked={localSettings.controls.touchControls}
                        onCheckedChange={(checked) => updateSettings('controls', 'touchControls', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gameplay' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Gameplay Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Difficulty</Label>
                      <Select
                        value={localSettings.gameplay.difficulty}
                        onValueChange={(value) => updateSettings('gameplay', 'difficulty', value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Camera Shake</Label>
                      <Switch
                        checked={localSettings.gameplay.cameraShake}
                        onCheckedChange={(checked) => updateSettings('gameplay', 'cameraShake', checked)}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Speedometer Unit</Label>
                      <Select
                        value={localSettings.gameplay.speedometer}
                        onValueChange={(value) => updateSettings('gameplay', 'speedometer', value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kmh">KM/H</SelectItem>
                          <SelectItem value="mph">MPH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Show FPS Counter</Label>
                      <Switch
                        checked={localSettings.gameplay.showFPS}
                        onCheckedChange={(checked) => updateSettings('gameplay', 'showFPS', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'display' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Display Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Fullscreen</Label>
                      <Switch
                        checked={localSettings.display.fullscreen}
                        onCheckedChange={(checked) => updateSettings('display', 'fullscreen', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">V-Sync</Label>
                      <Switch
                        checked={localSettings.display.vsync}
                        onCheckedChange={(checked) => updateSettings('display', 'vsync', checked)}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Field of View: {localSettings.display.fov}°
                      </Label>
                      <Slider
                        value={[localSettings.display.fov]}
                        onValueChange={([value]) => updateSettings('display', 'fov', value)}
                        min={60}
                        max={120}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 bg-slate-800">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Reset to Defaults
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}