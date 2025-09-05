// Car physics and control system for the 3D car racing game
import * as THREE from 'three';
import { MathUtils } from '../utils/math-utils';

export interface ControlSettings {
  sensitivity: number;
  invertSteering: boolean;
}

export class CarController {
  private car: THREE.Group | null = null;
  private position: THREE.Vector3 = new THREE.Vector3();
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private rotation: number = 0;
  private speed: number = 0;
  private maxSpeed: number = 25;
  private acceleration: number = 15;
  private deceleration: number = 10;
  private turnSpeed: number = 2.5;
  
  private keys: { [key: string]: boolean } = {};
  private settings: ControlSettings = {
    sensitivity: 1.0,
    invertSteering: false
  };
  
  private wheelRotation: number = 0;
  private engineSound: number = 0;
  private boundingBox: THREE.Box3 = new THREE.Box3();

  /**
   * Initialize the car controller
   */
  async initialize(carMesh: THREE.Group, controlSettings: ControlSettings): Promise<void> {
    this.car = carMesh;
    this.settings = controlSettings;
    
    // Set initial position
    this.position.set(0, 0.5, 0);
    this.car.position.copy(this.position);
    
    // Initialize bounding box
    this.updateBoundingBox();
    
    console.log('Car controller initialized');
  }

  /**
   * Update car physics and animation
   */
  update(deltaTime: number): void {
    if (!this.car) return;

    // Handle input
    this.handleInput(deltaTime);
    
    // Update physics
    this.updatePhysics(deltaTime);
    
    // Update visual elements
    this.updateVisuals(deltaTime);
    
    // Update bounding box
    this.updateBoundingBox();
  }

  /**
   * Handle keyboard input
   */
  private handleInput(deltaTime: number): void {
    const inputAcceleration = this.keys['ArrowUp'] || this.keys['KeyW'] ? 1 : 0;
    const inputBraking = this.keys['ArrowDown'] || this.keys['KeyS'] ? 1 : 0;
    const inputSteering = 
      (this.keys['ArrowLeft'] || this.keys['KeyA'] ? -1 : 0) +
      (this.keys['ArrowRight'] || this.keys['KeyD'] ? 1 : 0);

    // Apply sensitivity
    const adjustedSteering = inputSteering * this.settings.sensitivity;
    const finalSteering = this.settings.invertSteering ? -adjustedSteering : adjustedSteering;

    // Acceleration
    if (inputAcceleration > 0) {
      this.speed = Math.min(this.speed + this.acceleration * deltaTime, this.maxSpeed);
    } else if (inputBraking > 0) {
      this.speed = Math.max(this.speed - this.deceleration * deltaTime, -this.maxSpeed * 0.5);
    } else {
      // Natural deceleration
      if (this.speed > 0) {
        this.speed = Math.max(this.speed - this.deceleration * 0.5 * deltaTime, 0);
      } else if (this.speed < 0) {
        this.speed = Math.min(this.speed + this.deceleration * 0.5 * deltaTime, 0);
      }
    }

    // Steering (only effective when moving)
    if (Math.abs(this.speed) > 0.1 && Math.abs(finalSteering) > 0.1) {
      const steeringEffect = finalSteering * this.turnSpeed * deltaTime;
      const speedFactor = Math.abs(this.speed) / this.maxSpeed;
      this.rotation += steeringEffect * speedFactor;
    }
  }

  /**
   * Update car physics
   */
  private updatePhysics(deltaTime: number): void {
    if (!this.car) return;

    // Calculate movement direction
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
    
    // Update velocity
    this.velocity.copy(direction).multiplyScalar(this.speed);
    
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Keep car on road (simple boundary check)
    this.position.x = MathUtils.clamp(this.position.x, -8, 8);
    this.position.y = 0.5; // Keep at road level
    
    // Update car mesh position and rotation
    this.car.position.copy(this.position);
    this.car.rotation.y = this.rotation;
    
    // Add slight banking when turning
    const bankingAngle = MathUtils.clamp(this.velocity.x * -0.1, -0.3, 0.3);
    this.car.rotation.z = MathUtils.lerp(this.car.rotation.z, bankingAngle, 0.1);
  }

  /**
   * Update visual elements (wheels, etc.)
   */
  private updateVisuals(deltaTime: number): void {
    if (!this.car) return;

    // Rotate wheels based on speed
    this.wheelRotation += this.speed * deltaTime * 2;
    
    // Get wheel references from car group
    const wheels = (this.car as any).wheels;
    if (wheels) {
      // Rotate all wheels
      wheels.frontLeft.rotation.x = this.wheelRotation;
      wheels.frontRight.rotation.x = this.wheelRotation;
      wheels.rearLeft.rotation.x = this.wheelRotation;
      wheels.rearRight.rotation.x = this.wheelRotation;
      
      // Front wheel steering
      const steeringAngle = 
        (this.keys['ArrowLeft'] || this.keys['KeyA'] ? -0.3 : 0) +
        (this.keys['ArrowRight'] || this.keys['KeyD'] ? 0.3 : 0);
      
      wheels.frontLeft.rotation.y = steeringAngle;
      wheels.frontRight.rotation.y = steeringAngle;
    }
    
    // Update engine sound intensity
    this.engineSound = Math.abs(this.speed) / this.maxSpeed;
  }

  /**
   * Update bounding box for collision detection
   */
  private updateBoundingBox(): void {
    if (!this.car) return;
    
    this.boundingBox.setFromObject(this.car);
    
    // Slightly reduce bounding box for better gameplay
    const center = this.boundingBox.getCenter(new THREE.Vector3());
    const size = this.boundingBox.getSize(new THREE.Vector3());
    
    size.multiplyScalar(0.8); // Make it 80% of actual size
    
    this.boundingBox.setFromCenterAndSize(center, size);
  }

  /**
   * Handle keyboard down events
   */
  handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.code] = true;
  }

  /**
   * Handle keyboard up events
   */
  handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false;
  }

  /**
   * Handle collision
   */
  handleCollision(): void {
    // Reduce speed significantly
    this.speed *= 0.3;
    
    // Add slight backwards push
    const pushBack = new THREE.Vector3(0, 0, 1);
    pushBack.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
    this.position.add(pushBack.multiplyScalar(2));
    
    // Keep car on road
    this.position.x = MathUtils.clamp(this.position.x, -8, 8);
    
    // Update car position
    if (this.car) {
      this.car.position.copy(this.position);
    }
  }

  /**
   * Reset car to initial state
   */
  reset(): void {
    this.position.set(0, 0.5, 0);
    this.velocity.set(0, 0, 0);
    this.rotation = 0;
    this.speed = 0;
    this.wheelRotation = 0;
    this.engineSound = 0;
    
    // Clear key states
    this.keys = {};
    
    if (this.car) {
      this.car.position.copy(this.position);
      this.car.rotation.set(0, 0, 0);
    }
    
    console.log('Car controller reset');
  }

  /**
   * Update control settings
   */
  updateSettings(settings: ControlSettings): void {
    this.settings = settings;
  }

  /**
   * Get current position
   */
  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get current speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Get current rotation
   */
  getRotation(): number {
    return this.rotation;
  }

  /**
   * Get velocity vector
   */
  getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  /**
   * Get bounding box for collision detection
   */
  getBoundingBox(): THREE.Box3 {
    return this.boundingBox.clone();
  }

  /**
   * Get engine sound intensity (0-1)
   */
  getEngineSound(): number {
    return this.engineSound;
  }

  /**
   * Get normalized speed (0-1)
   */
  getNormalizedSpeed(): number {
    return Math.abs(this.speed) / this.maxSpeed;
  }

  /**
   * Check if car is moving
   */
  isMoving(): boolean {
    return Math.abs(this.speed) > 0.1;
  }

  /**
   * Check if car is accelerating
   */
  isAccelerating(): boolean {
    return this.keys['ArrowUp'] || this.keys['KeyW'] || false;
  }

  /**
   * Check if car is braking
   */
  isBraking(): boolean {
    return this.keys['ArrowDown'] || this.keys['KeyS'] || false;
  }

  /**
   * Check if car is turning
   */
  isTurning(): boolean {
    return this.keys['ArrowLeft'] || this.keys['KeyA'] || 
           this.keys['ArrowRight'] || this.keys['KeyD'] || false;
  }

  /**
   * Get current steering input (-1 to 1)
   */
  getSteeringInput(): number {
    const left = this.keys['ArrowLeft'] || this.keys['KeyA'] ? -1 : 0;
    const right = this.keys['ArrowRight'] || this.keys['KeyD'] ? 1 : 0;
    return left + right;
  }
}