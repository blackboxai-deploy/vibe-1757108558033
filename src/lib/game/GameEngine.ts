import * as THREE from 'three';
import { CarController } from './CarController';
import { ObstacleManager } from './ObstacleManager';
import { CollisionDetector } from './CollisionDetector';
import { ScoreManager } from './ScoreManager';
import { AudioManager } from './AudioManager';

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  SETTINGS = 'settings'
}

export interface GameSettings {
  graphics: {
    shadows: boolean;
    postProcessing: boolean;
    particleEffects: boolean;
    renderDistance: number;
  };
  audio: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
  };
  controls: {
    sensitivity: number;
    invertY: boolean;
  };
}

export interface GameStats {
  score: number;
  distance: number;
  speed: number;
  lives: number;
  combo: number;
  obstaclesAvoided: number;
  timeElapsed: number;
  level: number;
}

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  
  private carController: CarController;
  private obstacleManager: ObstacleManager;
  private collisionDetector: CollisionDetector;
  private scoreManager: ScoreManager;
  private audioManager: AudioManager;
  
  private gameState: GameState = GameState.MENU;
  private settings: GameSettings;
  private stats: GameStats;
  
  private animationId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  
  // Lighting
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private hemisphereLight: THREE.HemisphereLight;
  
  // Environment
  private ground: THREE.Mesh;
  private skybox: THREE.Mesh;
  
  // Performance tracking
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private currentFPS = 60;
  
  // Event callbacks
  private onStateChange?: (state: GameState) => void;
  private onStatsUpdate?: (stats: GameStats) => void;
  private onGameOver?: (finalStats: GameStats) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    
    // Initialize default settings
    this.settings = {
      graphics: {
        shadows: true,
        postProcessing: true,
        particleEffects: true,
        renderDistance: 1000
      },
      audio: {
        masterVolume: 0.7,
        sfxVolume: 0.8,
        musicVolume: 0.5
      },
      controls: {
        sensitivity: 1.0,
        invertY: false
      }
    };
    
    // Initialize stats
    this.stats = {
      score: 0,
      distance: 0,
      speed: 0,
      lives: 3,
      combo: 0,
      obstaclesAvoided: 0,
      timeElapsed: 0,
      level: 1
    };
    
    this.initializeRenderer();
    this.initializeScene();
    this.initializeLighting();
    this.initializeEnvironment();
    this.initializeGameSystems();
    this.setupEventListeners();
  }

  private initializeRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas!,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = this.settings.graphics.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  private initializeScene(): void {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87CEEB, 100, this.settings.graphics.renderDistance);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      this.settings.graphics.renderDistance
    );
    
    this.camera.position.set(0, 8, 15);
    this.camera.lookAt(0, 0, 0);
  }

  private initializeLighting(): void {
    // Ambient light for overall illumination
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(this.ambientLight);
    
    // Hemisphere light for natural sky lighting
    this.hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1d, 0.4);
    this.scene.add(this.hemisphereLight);
    
    // Directional light (sun) with shadows
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.directionalLight.position.set(50, 100, 50);
    this.directionalLight.castShadow = this.settings.graphics.shadows;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.scene.add(this.directionalLight);
  }

  private initializeEnvironment(): void {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x2d5a27,
      transparent: true,
      opacity: 0.8
    });
    
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    
    // Create road
    const roadGeometry = new THREE.PlaneGeometry(20, 2000);
    const roadMaterial = new THREE.MeshLambertMaterial({
      color: 0x333333
    });
    
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    road.receiveShadow = true;
    this.scene.add(road);
    
    // Create road markings
    const markingGeometry = new THREE.PlaneGeometry(1, 10);
    const markingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    
    for (let i = -100; i < 100; i += 5) {
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(0, 0.02, i * 10);
      this.scene.add(marking);
    }
    
    // Create skybox
    const skyGeometry = new THREE.SphereGeometry(800, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87CEEB,
      side: THREE.BackSide
    });
    
    this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(this.skybox);
  }

  private initializeGameSystems(): void {
    this.carController = new CarController(this.scene, this.camera);
    this.obstacleManager = new ObstacleManager(this.scene);
    this.collisionDetector = new CollisionDetector();
    this.scoreManager = new ScoreManager();
    this.audioManager = new AudioManager();
    
    // Configure audio volumes
    this.audioManager.setMasterVolume(this.settings.audio.masterVolume);
    this.audioManager.setSFXVolume(this.settings.audio.sfxVolume);
    this.audioManager.setMusicVolume(this.settings.audio.musicVolume);
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    window.addEventListener('focus', this.handleWindowFocus.bind(this));
  }

  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.gameState === GameState.PLAYING) {
      this.carController.handleKeyDown(event);
      
      if (event.code === 'Escape') {
        this.pauseGame();
      }
    } else if (this.gameState === GameState.PAUSED) {
      if (event.code === 'Escape') {
        this.resumeGame();
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (this.gameState === GameState.PLAYING) {
      this.carController.handleKeyUp(event);
    }
  }

  private handleWindowBlur(): void {
    if (this.gameState === GameState.PLAYING) {
      this.pauseGame();
    }
  }

  private handleWindowFocus(): void {
    // Resume game logic can be handled by user interaction
  }

  public startGame(): void {
    this.resetGameStats();
    this.gameState = GameState.PLAYING;
    this.carController.reset();
    this.obstacleManager.reset();
    this.scoreManager.reset();
    this.audioManager.playBackgroundMusic();
    this.clock.start();
    
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }
    
    this.gameLoop();
  }

  public pauseGame(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
      this.clock.stop();
      this.audioManager.pauseBackgroundMusic();
      
      if (this.onStateChange) {
        this.onStateChange(this.gameState);
      }
    }
  }

  public resumeGame(): void {
    if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
      this.clock.start();
      this.audioManager.resumeBackgroundMusic();
      
      if (this.onStateChange) {
        this.onStateChange(this.gameState);
      }
      
      this.gameLoop();
    }
  }

  public endGame(): void {
    this.gameState = GameState.GAME_OVER;
    this.clock.stop();
    this.audioManager.stopBackgroundMusic();
    this.audioManager.playGameOverSound();
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.onGameOver) {
      this.onGameOver({ ...this.stats });
    }
    
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }
  }

  public resetGame(): void {
    this.resetGameStats();
    this.carController.reset();
    this.obstacleManager.reset();
    this.scoreManager.reset();
    this.gameState = GameState.MENU;
    
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }
  }

  private resetGameStats(): void {
    this.stats = {
      score: 0,
      distance: 0,
      speed: 0,
      lives: 3,
      combo: 0,
      obstaclesAvoided: 0,
      timeElapsed: 0,
      level: 1
    };
  }

  private gameLoop(): void {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }
    
    const deltaTime = this.clock.getDelta();
    this.updateGame(deltaTime);
    this.render();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private updateGame(deltaTime: number): void {
    // Update game systems
    this.carController.update(deltaTime);
    this.obstacleManager.update(deltaTime, this.carController.getPosition());
    
    // Update stats
    this.stats.timeElapsed += deltaTime;
    this.stats.distance = this.carController.getDistanceTraveled();
    this.stats.speed = this.carController.getSpeed();
    
    // Check collisions
    const carBoundingBox = this.carController.getBoundingBox();
    const obstacles = this.obstacleManager.getActiveObstacles();
    
    for (const obstacle of obstacles) {
      if (this.collisionDetector.checkCollision(carBoundingBox, obstacle.boundingBox)) {
        this.handleCollision(obstacle);
        break;
      }
    }
    
    // Update score based on distance and speed
    const distanceScore = Math.floor(this.stats.distance / 10);
    const speedBonus = Math.floor(this.stats.speed * 2);
    this.stats.score = this.scoreManager.calculateScore(distanceScore, speedBonus, this.stats.combo);
    
    // Check for level progression
    const newLevel = Math.floor(this.stats.distance / 1000) + 1;
    if (newLevel > this.stats.level) {
      this.stats.level = newLevel;
      this.obstacleManager.increaseDifficulty();
      this.audioManager.playLevelUpSound();
    }
    
    // Update FPS counter
    this.updateFPS();
    
    // Notify stats update
    if (this.onStatsUpdate) {
      this.onStatsUpdate({ ...this.stats });
    }
    
    // Check game over condition
    if (this.stats.lives <= 0) {
      this.endGame();
    }
  }

  private handleCollision(obstacle: any): void {
    this.stats.lives--;
    this.stats.combo = 0;
    this.carController.handleCollision();
    this.audioManager.playCollisionSound();
    this.obstacleManager.removeObstacle(obstacle);
    
    // Add screen shake effect
    this.addScreenShake();
  }

  private addScreenShake(): void {
    const originalPosition = this.camera.position.clone();
    const shakeIntensity = 0.5;
    const shakeDuration = 0.3;
    let shakeTime = 0;
    
    const shake = () => {
      if (shakeTime < shakeDuration) {
        this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * shakeIntensity;
        this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * shakeIntensity;
        shakeTime += 0.016; // ~60fps
        requestAnimationFrame(shake);
      } else {
        this.camera.position.copy(originalPosition);
      }
    };
    
    shake();
  }

  private updateFPS(): void {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastFPSUpdate >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate));
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  // Public API methods
  public getGameState(): GameState {
    return this.gameState;
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }

  private applySettings(): void {
    // Apply graphics settings
    this.renderer.shadowMap.enabled = this.settings.graphics.shadows;
    this.directionalLight.castShadow = this.settings.graphics.shadows;
    this.scene.fog = new THREE.Fog(0x87CEEB, 100, this.settings.graphics.renderDistance);
    this.camera.far = this.settings.graphics.renderDistance;
    this.camera.updateProjectionMatrix();
    
    // Apply audio settings
    this.audioManager.setMasterVolume(this.settings.audio.masterVolume);
    this.audioManager.setSFXVolume(this.settings.audio.sfxVolume);
    this.audioManager.setMusicVolume(this.settings.audio.musicVolume);
    
    // Apply control settings
    this.carController.setSensitivity(this.settings.controls.sensitivity);
  }

  public getFPS(): number {
    return this.currentFPS;
  }

  public setStateChangeCallback(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  public setStatsUpdateCallback(callback: (stats: GameStats) => void): void {
    this.onStatsUpdate = callback;
  }

  public setGameOverCallback(callback: (finalStats: GameStats) => void): void {
    this.onGameOver = callback;
  }

  public dispose(): void {
    // Clean up resources
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.carController.dispose();
    this.obstacleManager.dispose();
    this.audioManager.dispose();
    
    this.scene.clear();
    this.renderer.dispose();
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('blur', this.handleWindowBlur.bind(this));
    window.removeEventListener('focus', this.handleWindowFocus.bind(this));
  }
}