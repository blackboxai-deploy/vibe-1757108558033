// Mathematical utility functions for 3D car racing game
import * as THREE from 'three';

export class MathUtils {
  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Smooth step interpolation (ease in/out)
   */
  static smoothStep(edge0: number, edge1: number, x: number): number {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  /**
   * Convert degrees to radians
   */
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Check if two 3D points are within a certain distance
   */
  static isWithinDistance(
    point1: THREE.Vector3,
    point2: THREE.Vector3,
    distance: number
  ): boolean {
    return point1.distanceTo(point2) <= distance;
  }

  /**
   * Generate random number between min and max
   */
  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Calculate 2D distance between two points
   */
  static distance2D(x1: number, z1: number, x2: number, z2: number): number {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Normalize angle to be between -PI and PI
   */
  static normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  /**
   * Calculate angle between two 2D points
   */
  static angleToPoint(fromX: number, fromZ: number, toX: number, toZ: number): number {
    return Math.atan2(toZ - fromZ, toX - fromX);
  }

  /**
   * Apply easing function for smooth animations
   */
  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Check if a point is within a rectangular bounds
   */
  static isPointInBounds(
    x: number,
    z: number,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  ): boolean {
    return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ;
  }

  /**
   * Calculate velocity from current and previous positions
   */
  static calculateVelocity(
    currentPos: THREE.Vector3,
    previousPos: THREE.Vector3,
    deltaTime: number
  ): THREE.Vector3 {
    const velocity = new THREE.Vector3();
    velocity.subVectors(currentPos, previousPos);
    velocity.divideScalar(deltaTime);
    return velocity;
  }

  /**
   * Smooth damp function for smooth camera following
   */
  static smoothDamp(
    current: number,
    target: number,
    velocity: { value: number },
    smoothTime: number,
    maxSpeed: number,
    deltaTime: number
  ): number {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const originalTo = target;
    const maxChange = maxSpeed * smoothTime;
    const clampedChange = this.clamp(change, -maxChange, maxChange);
    target = current - clampedChange;
    const temp = (velocity.value + omega * clampedChange) * deltaTime;
    velocity.value = (velocity.value - omega * temp) * exp;
    let output = target + (clampedChange + temp) * exp;
    if (originalTo - current > 0.0 === output > originalTo) {
      output = originalTo;
      velocity.value = (output - originalTo) / deltaTime;
    }
    return output;
  }
}