// 3D collision detection system for the car racing game
import * as THREE from 'three';
import type { ObstacleData } from './ObstacleManager';

export interface CollisionResult {
  hasCollision: boolean;
  obstacle?: ObstacleData;
  impactPoint?: THREE.Vector3;
  impactNormal?: THREE.Vector3;
}

export class CollisionDetector {
  private raycaster: THREE.Raycaster;
  private tempVector: THREE.Vector3;
  private tempBox: THREE.Box3;

  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.tempVector = new THREE.Vector3();
    this.tempBox = new THREE.Box3();
  }

  /**
   * Initialize collision detector
   */
  async initialize(): Promise<void> {
    console.log('Collision detector initialized');
  }

  /**
   * Check collisions between car and obstacles
   */
  checkCollisions(carBoundingBox: THREE.Box3, obstacles: ObstacleData[]): CollisionResult {
    // Check bounding box intersections first (broad phase)
    for (const obstacle of obstacles) {
      if (!obstacle.isActive) continue;
      
      // Update obstacle bounding box
      obstacle.boundingBox.setFromObject(obstacle.mesh);
      
      // Check if bounding boxes intersect
      if (carBoundingBox.intersectsBox(obstacle.boundingBox)) {
        // Perform detailed collision check (narrow phase)
        const detailedResult = this.detailedCollisionCheck(carBoundingBox, obstacle);
        if (detailedResult.hasCollision) {
          return detailedResult;
        }
      }
    }

    return { hasCollision: false };
  }

  /**
   * Perform detailed collision check using raycasting
   */
  private detailedCollisionCheck(carBoundingBox: THREE.Box3, obstacle: ObstacleData): CollisionResult {
    // Get car center and size
    const carCenter = carBoundingBox.getCenter(new THREE.Vector3());
    const carSize = carBoundingBox.getSize(new THREE.Vector3());
    
    // Create rays from car center to obstacle
    const directions = [
      new THREE.Vector3(1, 0, 0),   // Right
      new THREE.Vector3(-1, 0, 0),  // Left
      new THREE.Vector3(0, 0, 1),   // Forward
      new THREE.Vector3(0, 0, -1),  // Backward
      new THREE.Vector3(0, 1, 0),   // Up
      new THREE.Vector3(0, -1, 0)   // Down
    ];
    
    const maxDistance = Math.max(carSize.x, carSize.y, carSize.z) * 0.6;
    
    for (const direction of directions) {
      this.raycaster.set(carCenter, direction);
      const intersections = this.raycaster.intersectObject(obstacle.mesh, true);
      
      if (intersections.length > 0) {
        const intersection = intersections[0];
        if (intersection.distance <= maxDistance) {
          return {
            hasCollision: true,
            obstacle,
            impactPoint: intersection.point,
            impactNormal: intersection.face?.normal || new THREE.Vector3(0, 1, 0)
          };
        }
      }
    }
    
    return { hasCollision: false };
  }

  /**
   * Check if car is within road boundaries
   */
  checkRoadBoundaries(carPosition: THREE.Vector3, roadWidth: number = 20): boolean {
    const halfWidth = roadWidth / 2;
    return carPosition.x >= -halfWidth && carPosition.x <= halfWidth;
  }

  /**
   * Predict future collision based on car velocity
   */
  predictCollision(
    carBoundingBox: THREE.Box3,
    carVelocity: THREE.Vector3,
    obstacles: ObstacleData[],
    lookAheadTime: number = 1.0
  ): CollisionResult {
    // Create future car position
    const carCenter = carBoundingBox.getCenter(new THREE.Vector3());
    const futurePosition = carCenter.clone().add(
      carVelocity.clone().multiplyScalar(lookAheadTime)
    );
    
    // Create future bounding box
    const carSize = carBoundingBox.getSize(new THREE.Vector3());
    const futureBoundingBox = new THREE.Box3().setFromCenterAndSize(futurePosition, carSize);
    
    // Check collisions with future position
    return this.checkCollisions(futureBoundingBox, obstacles);
  }

  /**
   * Check collision between two bounding boxes with tolerance
   */
  checkBoxCollision(box1: THREE.Box3, box2: THREE.Box3, tolerance: number = 0): boolean {
    if (tolerance === 0) {
      return box1.intersectsBox(box2);
    }
    
    // Expand boxes by tolerance
    const expandedBox1 = box1.clone();
    const expandedBox2 = box2.clone();
    
    expandedBox1.expandByScalar(tolerance);
    expandedBox2.expandByScalar(tolerance);
    
    return expandedBox1.intersectsBox(expandedBox2);
  }

  /**
   * Get distance between car and nearest obstacle
   */
  getNearestObstacleDistance(carPosition: THREE.Vector3, obstacles: ObstacleData[]): number {
    let minDistance = Infinity;
    
    for (const obstacle of obstacles) {
      if (!obstacle.isActive) continue;
      
      const distance = carPosition.distanceTo(obstacle.position);
      minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance === Infinity ? -1 : minDistance;
  }

  /**
   * Get obstacles within specified radius of car
   */
  getObstaclesInRadius(
    carPosition: THREE.Vector3,
    obstacles: ObstacleData[],
    radius: number
  ): ObstacleData[] {
    return obstacles.filter(obstacle => {
      if (!obstacle.isActive) return false;
      return carPosition.distanceTo(obstacle.position) <= radius;
    });
  }

  /**
   * Check if path between two points is clear
   */
  isPathClear(
    startPoint: THREE.Vector3,
    endPoint: THREE.Vector3,
    obstacles: ObstacleData[],
    carSize: THREE.Vector3
  ): boolean {
    const direction = endPoint.clone().sub(startPoint).normalize();
    const distance = startPoint.distanceTo(endPoint);
    
    this.raycaster.set(startPoint, direction);
    this.raycaster.far = distance;
    
    for (const obstacle of obstacles) {
      if (!obstacle.isActive) continue;
      
      const intersections = this.raycaster.intersectObject(obstacle.mesh, true);
      if (intersections.length > 0) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Calculate collision response (bounce direction and force)
   */
  calculateCollisionResponse(
    carVelocity: THREE.Vector3,
    impactNormal: THREE.Vector3,
    restitution: number = 0.3
  ): THREE.Vector3 {
    // Calculate reflection vector
    const reflection = carVelocity.clone().reflect(impactNormal);
    
    // Apply restitution (energy loss)
    reflection.multiplyScalar(restitution);
    
    return reflection;
  }

  /**
   * Check collision with multiple objects efficiently
   */
  checkMultipleCollisions(
    carBoundingBox: THREE.Box3,
    objectBoundingBoxes: THREE.Box3[]
  ): number[] {
    const collisionIndices: number[] = [];
    
    objectBoundingBoxes.forEach((box, index) => {
      if (carBoundingBox.intersectsBox(box)) {
        collisionIndices.push(index);
      }
    });
    
    return collisionIndices;
  }

  /**
   * Update bounding box with object transformation
   */
  updateBoundingBox(object: THREE.Object3D, boundingBox: THREE.Box3): void {
    boundingBox.setFromObject(object);
  }

  /**
   * Get collision penetration depth
   */
  getCollisionPenetration(box1: THREE.Box3, box2: THREE.Box3): number {
    if (!box1.intersectsBox(box2)) return 0;
    
    const intersection = box1.clone().intersect(box2);
    const size = intersection.getSize(new THREE.Vector3());
    
    // Return minimum penetration dimension
    return Math.min(size.x, size.y, size.z);
  }

  /**
   * Check if point is inside bounding box
   */
  isPointInBox(point: THREE.Vector3, box: THREE.Box3): boolean {
    return box.containsPoint(point);
  }

  /**
   * Get closest point on bounding box to given point
   */
  getClosestPointOnBox(point: THREE.Vector3, box: THREE.Box3): THREE.Vector3 {
    const closestPoint = point.clone();
    
    closestPoint.x = Math.max(box.min.x, Math.min(point.x, box.max.x));
    closestPoint.y = Math.max(box.min.y, Math.min(point.y, box.max.y));
    closestPoint.z = Math.max(box.min.z, Math.min(point.z, box.max.z));
    
    return closestPoint;
  }

  /**
   * Reset collision detector
   */
  reset(): void {
    // Reset any internal state if needed
    console.log('Collision detector reset');
  }

  /**
   * Dispose of collision detector
   */
  dispose(): void {
    // Clean up resources
    console.log('Collision detector disposed');
  }
}