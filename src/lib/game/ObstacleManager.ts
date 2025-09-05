// Obstacle generation and management system
import * as THREE from 'three';
import { ThreeUtils } from '../utils/three-utils';
import { MathUtils } from '../utils/math-utils';

export interface ObstacleData {
  mesh: THREE.Mesh;
  type: 'barrier' | 'wall' | 'cone';
  position: THREE.Vector3;
  boundingBox: THREE.Box3;
  isActive: boolean;
  speed?: number; // For moving obstacles
  direction?: THREE.Vector3; // For moving obstacles
}

export class ObstacleManager {
  private scene: THREE.Scene | null = null;
  private obstacles: ObstacleData[] = [];
  private obstaclePool: Map<string, THREE.Mesh[]> = new Map();
  private spawnDistance: number = 100;
  private despawnDistance: number = -50;
  private lastSpawnZ: number = 50;
  private difficulty: number = 1;
  private timeSinceStart: number = 0;

  // Obstacle patterns
  private patterns = [
    'single_barrier',
    'double_barrier',
    'wall_gap',
    'cone_slalom',
    'narrow_passage',
    'moving_barriers'
  ];

  /**
   * Initialize obstacle manager
   */
  async initialize(scene: THREE.Scene): Promise<void> {
    this.scene = scene;
    this.createObstaclePool();
    this.spawnInitialObstacles();
    console.log('Obstacle manager initialized');
  }

  /**
   * Create object pool for efficient obstacle reuse
   */
  private createObstaclePool(): void {
    const poolSize = 20;
    const types: ('barrier' | 'wall' | 'cone')[] = ['barrier', 'wall', 'cone'];
    
    types.forEach(type => {
      const pool: THREE.Mesh[] = [];
      for (let i = 0; i < poolSize; i++) {
        const obstacle = ThreeUtils.createObstacleGeometry(type);
        obstacle.visible = false;
        pool.push(obstacle);
      }
      this.obstaclePool.set(type, pool);
    });
  }

  /**
   * Get obstacle from pool
   */
  private getObstacleFromPool(type: 'barrier' | 'wall' | 'cone'): THREE.Mesh | null {
    const pool = this.obstaclePool.get(type);
    if (!pool) return null;
    
    const obstacle = pool.find(obj => !obj.visible);
    return obstacle || null;
  }

  /**
   * Return obstacle to pool
   */
  private returnObstacleToPool(obstacle: THREE.Mesh): void {
    obstacle.visible = false;
    obstacle.position.set(0, -100, 0); // Move out of view
  }

  /**
   * Spawn initial obstacles
   */
  private spawnInitialObstacles(): void {
    for (let z = 20; z < 100; z += 15) {
      this.spawnObstaclePattern(z);
    }
  }

  /**
   * Update obstacle system
   */
  update(deltaTime: number, carPosition: THREE.Vector3): void {
    this.timeSinceStart += deltaTime;
    this.updateDifficulty();
    
    // Remove obstacles that are too far behind
    this.cleanupObstacles(carPosition);
    
    // Spawn new obstacles ahead
    this.spawnObstacles(carPosition);
    
    // Update moving obstacles
    this.updateMovingObstacles(deltaTime);
  }

  /**
   * Update difficulty based on time/distance
   */
  private updateDifficulty(): void {
    // Difficulty increases over time
    this.difficulty = 1 + (this.timeSinceStart / 30); // Increases every 30 seconds
    this.difficulty = Math.min(this.difficulty, 5); // Cap at 5x difficulty
  }

  /**
   * Clean up obstacles that are behind the car
   */
  private cleanupObstacles(carPosition: THREE.Vector3): void {
    this.obstacles = this.obstacles.filter(obstacle => {
      if (obstacle.position.z < carPosition.z + this.despawnDistance) {
        // Remove from scene
        if (this.scene) {
          this.scene.remove(obstacle.mesh);
        }
        // Return to pool
        this.returnObstacleToPool(obstacle.mesh);
        return false;
      }
      return true;
    });
  }

  /**
   * Spawn obstacles ahead of the car
   */
  private spawnObstacles(carPosition: THREE.Vector3): void {
    const spawnZ = carPosition.z + this.spawnDistance;
    
    // Spawn new obstacles if needed
    while (this.lastSpawnZ < spawnZ) {
      this.lastSpawnZ += MathUtils.random(10, 20 / this.difficulty);
      this.spawnObstaclePattern(this.lastSpawnZ);
    }
  }

  /**
   * Spawn obstacle pattern at given Z position
   */
  private spawnObstaclePattern(z: number): void {
    if (!this.scene) return;

    const patternIndex = Math.floor(Math.random() * this.patterns.length);
    const pattern = this.patterns[patternIndex];
    
    switch (pattern) {
      case 'single_barrier':
        this.spawnSingleBarrier(z);
        break;
      case 'double_barrier':
        this.spawnDoubleBarrier(z);
        break;
      case 'wall_gap':
        this.spawnWallGap(z);
        break;
      case 'cone_slalom':
        this.spawnConeSlalom(z);
        break;
      case 'narrow_passage':
        this.spawnNarrowPassage(z);
        break;
      case 'moving_barriers':
        this.spawnMovingBarriers(z);
        break;
    }
  }

  /**
   * Spawn single barrier pattern
   */
  private spawnSingleBarrier(z: number): void {
    const x = MathUtils.random(-6, 6);
    this.createObstacle('barrier', x, z);
  }

  /**
   * Spawn double barrier pattern
   */
  private spawnDoubleBarrier(z: number): void {
    const gap = MathUtils.random(4, 6);
    const centerX = MathUtils.random(-3, 3);
    
    this.createObstacle('barrier', centerX - gap / 2, z);
    this.createObstacle('barrier', centerX + gap / 2, z);
  }

  /**
   * Spawn wall with gap pattern
   */
  private spawnWallGap(z: number): void {
    const gapCenter = MathUtils.random(-4, 4);
    const gapWidth = MathUtils.random(3, 5);
    
    // Left wall
    if (gapCenter - gapWidth / 2 > -8) {
      const leftWall = this.createObstacle('wall', (gapCenter - gapWidth / 2 - 4), z);
      if (leftWall) {
        leftWall.mesh.scale.x = 0.5; // Make it shorter
      }
    }
    
    // Right wall
    if (gapCenter + gapWidth / 2 < 8) {
      const rightWall = this.createObstacle('wall', (gapCenter + gapWidth / 2 + 4), z);
      if (rightWall) {
        rightWall.mesh.scale.x = 0.5; // Make it shorter
      }
    }
  }

  /**
   * Spawn cone slalom pattern
   */
  private spawnConeSlalom(z: number): void {
    const numCones = 3 + Math.floor(this.difficulty);
    const spacing = 8;
    
    for (let i = 0; i < numCones; i++) {
      const x = (i % 2 === 0 ? -3 : 3) + MathUtils.random(-1, 1);
      this.createObstacle('cone', x, z + i * spacing);
    }
  }

  /**
   * Spawn narrow passage pattern
   */
  private spawnNarrowPassage(z: number): void {
    const passageWidth = Math.max(3, 5 - this.difficulty);
    
    this.createObstacle('barrier', -passageWidth / 2 - 1, z);
    this.createObstacle('barrier', passageWidth / 2 + 1, z);
    this.createObstacle('barrier', -passageWidth / 2 - 1, z + 5);
    this.createObstacle('barrier', passageWidth / 2 + 1, z + 5);
  }

  /**
   * Spawn moving barriers pattern
   */
  private spawnMovingBarriers(z: number): void {
    // Create barriers that move side to side
    const leftBarrier = this.createObstacle('barrier', -4, z);
    const rightBarrier = this.createObstacle('barrier', 4, z);
    
    if (leftBarrier) {
      leftBarrier.speed = MathUtils.random(2, 4);
      leftBarrier.direction = new THREE.Vector3(1, 0, 0);
    }
    
    if (rightBarrier) {
      rightBarrier.speed = MathUtils.random(2, 4);
      rightBarrier.direction = new THREE.Vector3(-1, 0, 0);
    }
  }

  /**
   * Create obstacle at position
   */
  private createObstacle(
    type: 'barrier' | 'wall' | 'cone', 
    x: number, 
    z: number
  ): ObstacleData | null {
    if (!this.scene) return null;

    const obstacle = this.getObstacleFromPool(type);
    if (!obstacle) return null;

    obstacle.position.set(x, type === 'cone' ? 0.75 : 1, z);
    obstacle.visible = true;
    
    this.scene.add(obstacle);

    const obstacleData: ObstacleData = {
      mesh: obstacle,
      type,
      position: obstacle.position.clone(),
      boundingBox: new THREE.Box3().setFromObject(obstacle),
      isActive: true
    };

    this.obstacles.push(obstacleData);
    return obstacleData;
  }

  /**
   * Update moving obstacles
   */
  private updateMovingObstacles(deltaTime: number): void {
    this.obstacles.forEach(obstacle => {
      if (obstacle.speed && obstacle.direction) {
        // Move obstacle
        const movement = obstacle.direction.clone().multiplyScalar(obstacle.speed * deltaTime);
        obstacle.mesh.position.add(movement);
        obstacle.position.copy(obstacle.mesh.position);
        
        // Reverse direction if hitting road boundaries
        if (obstacle.position.x > 7 || obstacle.position.x < -7) {
          obstacle.direction.x *= -1;
        }
        
        // Update bounding box
        obstacle.boundingBox.setFromObject(obstacle.mesh);
      }
    });
  }

  /**
   * Get all active obstacles
   */
  getObstacles(): ObstacleData[] {
    return this.obstacles.filter(obstacle => obstacle.isActive);
  }

  /**
   * Get obstacles within range of position
   */
  getObstaclesInRange(position: THREE.Vector3, range: number): ObstacleData[] {
    return this.obstacles.filter(obstacle => {
      const distance = obstacle.position.distanceTo(position);
      return distance <= range && obstacle.isActive;
    });
  }

  /**
   * Reset obstacle manager
   */
  reset(): void {
    // Clean up all obstacles
    this.obstacles.forEach(obstacle => {
      if (this.scene) {
        this.scene.remove(obstacle.mesh);
      }
      this.returnObstacleToPool(obstacle.mesh);
    });
    
    this.obstacles = [];
    this.lastSpawnZ = 50;
    this.difficulty = 1;
    this.timeSinceStart = 0;
    
    // Spawn initial obstacles again
    this.spawnInitialObstacles();
    
    console.log('Obstacle manager reset');
  }

  /**
   * Get current difficulty level
   */
  getDifficulty(): number {
    return this.difficulty;
  }

  /**
   * Get number of active obstacles
   */
  getActiveObstacleCount(): number {
    return this.obstacles.length;
  }

  /**
   * Dispose of obstacle manager
   */
  dispose(): void {
    // Clean up all obstacles
    this.obstacles.forEach(obstacle => {
      if (this.scene) {
        this.scene.remove(obstacle.mesh);
      }
      ThreeUtils.dispose(obstacle.mesh);
    });
    
    // Clean up pools
    this.obstaclePool.forEach(pool => {
      pool.forEach(obstacle => {
        ThreeUtils.dispose(obstacle);
      });
    });
    
    this.obstacles = [];
    this.obstaclePool.clear();
    
    console.log('Obstacle manager disposed');
  }
}