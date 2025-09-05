// Score and progression management system
export interface ScoreData {
  currentScore: number;
  highScore: number;
  distance: number;
  lives: number;
  combo: number;
  timeBonus: number;
  speedBonus: number;
}

export class ScoreManager {
  private score: number = 0;
  private highScore: number = 0;
  private distance: number = 0;
  private lives: number = 3;
  private maxLives: number = 3;
  private combo: number = 0;
  private maxCombo: number = 0;
  
  private lastTime: number = 0;
  private gameStartTime: number = 0;
  private timeSurvived: number = 0;
  
  // Scoring parameters
  private readonly DISTANCE_MULTIPLIER = 10;
  private readonly SPEED_MULTIPLIER = 5;
  private readonly COMBO_MULTIPLIER = 50;
  private readonly TIME_MULTIPLIER = 2;
  private readonly OBSTACLE_AVOIDANCE_POINTS = 100;
  
  // Combo system
  private comboTimer: number = 0;
  private readonly COMBO_TIMEOUT = 3; // seconds
  private lastObstacleAvoidanceTime: number = 0;

  /**
   * Initialize score manager
   */
  async initialize(): Promise<void> {
    this.loadHighScore();
    this.reset();
    console.log('Score manager initialized');
  }

  /**
   * Update score based on gameplay
   */
  update(deltaTime: number, carSpeed: number): void {
    this.timeSurvived += deltaTime;
    this.comboTimer -= deltaTime;
    
    // Distance-based scoring
    const distanceDelta = Math.abs(carSpeed) * deltaTime;
    this.distance += distanceDelta;
    this.score += Math.floor(distanceDelta * this.DISTANCE_MULTIPLIER);
    
    // Speed bonus (higher speed = more points)
    if (carSpeed > 15) { // Bonus for high speed
      const speedBonus = (carSpeed - 15) * this.SPEED_MULTIPLIER * deltaTime;
      this.score += Math.floor(speedBonus);
    }
    
    // Time survival bonus
    const timeBonus = this.TIME_MULTIPLIER * deltaTime;
    this.score += Math.floor(timeBonus);
    
    // Reset combo if timeout
    if (this.comboTimer <= 0 && this.combo > 0) {
      this.resetCombo();
    }
  }

  /**
   * Award points for avoiding an obstacle
   */
  awardObstacleAvoidance(obstacleType: string, difficulty: number = 1): void {
    const currentTime = Date.now() / 1000;
    
    // Base points for obstacle avoidance
    let points = this.OBSTACLE_AVOIDANCE_POINTS;
    
    // Bonus based on obstacle type
    switch (obstacleType) {
      case 'wall':
        points *= 1.5;
        break;
      case 'moving_barrier':
        points *= 2.0;
        break;
      case 'narrow_passage':
        points *= 2.5;
        break;
      default:
        points *= 1.0;
    }
    
    // Apply difficulty multiplier
    points *= difficulty;
    
    // Check for combo
    if (currentTime - this.lastObstacleAvoidanceTime <= 2.0) {
      this.combo++;
      this.comboTimer = this.COMBO_TIMEOUT;
      points += this.combo * this.COMBO_MULTIPLIER;
    } else {
      this.combo = 1;
      this.comboTimer = this.COMBO_TIMEOUT;
    }
    
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.score += Math.floor(points);
    this.lastObstacleAvoidanceTime = currentTime;
    
    console.log(`Obstacle avoided! +${Math.floor(points)} points (Combo: ${this.combo}x)`);
  }

  /**
   * Lose a life due to collision
   */
  loseLife(): number {
    this.lives = Math.max(0, this.lives - 1);
    this.resetCombo();
    
    console.log(`Life lost! Lives remaining: ${this.lives}`);
    return this.lives;
  }

  /**
   * Gain a life (power-up or milestone)
   */
  gainLife(): void {
    if (this.lives < this.maxLives) {
      this.lives++;
      console.log(`Life gained! Lives: ${this.lives}`);
    }
  }

  /**
   * Reset combo
   */
  private resetCombo(): void {
    if (this.combo > 0) {
      console.log(`Combo broken at ${this.combo}x`);
      this.combo = 0;
      this.comboTimer = 0;
    }
  }

  /**
   * Calculate final score with bonuses
   */
  calculateFinalScore(): number {
    let finalScore = this.score;
    
    // Time survival bonus
    const survivalBonus = Math.floor(this.timeSurvived * 50);
    finalScore += survivalBonus;
    
    // Distance milestone bonus
    const distanceMilestones = Math.floor(this.distance / 1000);
    const distanceBonus = distanceMilestones * 1000;
    finalScore += distanceBonus;
    
    // Max combo bonus
    const comboBonus = this.maxCombo * 200;
    finalScore += comboBonus;
    
    return finalScore;
  }

  /**
   * Check if new high score
   */
  checkHighScore(): boolean {
    const finalScore = this.calculateFinalScore();
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      this.saveHighScore();
      console.log(`New high score! ${this.highScore}`);
      return true;
    }
    return false;
  }

  /**
   * Get score ranking
   */
  getScoreRanking(score: number): string {
    if (score >= 50000) return 'S+';
    if (score >= 30000) return 'S';
    if (score >= 20000) return 'A+';
    if (score >= 15000) return 'A';
    if (score >= 10000) return 'B+';
    if (score >= 7000) return 'B';
    if (score >= 5000) return 'C+';
    if (score >= 3000) return 'C';
    if (score >= 1000) return 'D';
    return 'F';
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageSpeed: number;
    obstaclesAvoided: number;
    accuracyRate: number;
    survivalTime: number;
  } {
    const averageSpeed = this.distance / Math.max(this.timeSurvived, 1);
    const obstaclesAvoided = Math.floor(this.distance / 100); // Estimate
    const accuracyRate = Math.min(100, (this.combo / Math.max(obstaclesAvoided, 1)) * 100);
    
    return {
      averageSpeed,
      obstaclesAvoided,
      accuracyRate,
      survivalTime: this.timeSurvived
    };
  }

  /**
   * Reset score manager for new game
   */
  reset(): void {
    this.score = 0;
    this.distance = 0;
    this.lives = this.maxLives;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeSurvived = 0;
    this.comboTimer = 0;
    this.lastObstacleAvoidanceTime = 0;
    this.gameStartTime = Date.now() / 1000;
    
    console.log('Score manager reset');
  }

  /**
   * Load high score from localStorage
   */
  private loadHighScore(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('car-racing-high-score');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 0;
      }
    }
  }

  /**
   * Save high score to localStorage
   */
  private saveHighScore(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('car-racing-high-score', this.highScore.toString());
    }
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Get high score
   */
  getHighScore(): number {
    return this.highScore;
  }

  /**
   * Get distance traveled
   */
  getDistance(): number {
    return this.distance;
  }

  /**
   * Get remaining lives
   */
  getLives(): number {
    return this.lives;
  }

  /**
   * Get current combo
   */
  getCombo(): number {
    return this.combo;
  }

  /**
   * Get max combo achieved
   */
  getMaxCombo(): number {
    return this.maxCombo;
  }

  /**
   * Get time survived
   */
  getTimeSurvived(): number {
    return this.timeSurvived;
  }

  /**
   * Get all score data
   */
  getScoreData(): ScoreData {
    return {
      currentScore: this.score,
      highScore: this.highScore,
      distance: this.distance,
      lives: this.lives,
      combo: this.combo,
      timeBonus: Math.floor(this.timeSurvived * this.TIME_MULTIPLIER),
      speedBonus: Math.floor(this.distance * this.DISTANCE_MULTIPLIER)
    };
  }

  /**
   * Check for milestones and achievements
   */
  checkMilestones(): string[] {
    const milestones: string[] = [];
    
    // Distance milestones
    if (this.distance >= 1000 && this.distance < 1100) {
      milestones.push('1KM_TRAVELED');
    } else if (this.distance >= 5000 && this.distance < 5100) {
      milestones.push('5KM_TRAVELED');
    }
    
    // Combo milestones
    if (this.combo === 10) {
      milestones.push('10X_COMBO');
    } else if (this.combo === 25) {
      milestones.push('25X_COMBO');
    }
    
    // Survival time milestones
    if (this.timeSurvived >= 60 && this.timeSurvived < 61) {
      milestones.push('1MIN_SURVIVAL');
    } else if (this.timeSurvived >= 300 && this.timeSurvived < 301) {
      milestones.push('5MIN_SURVIVAL');
    }
    
    return milestones;
  }

  /**
   * Format score for display
   */
  formatScore(score: number): string {
    return score.toLocaleString();
  }

  /**
   * Format distance for display
   */
  formatDistance(distance: number): string {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${Math.floor(distance)}m`;
  }

  /**
   * Format time for display
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}