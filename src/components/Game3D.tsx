'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface Game3DProps {
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
  onHealthUpdate: (health: number) => void;
  gameState: 'playing' | 'paused' | 'gameOver';
}

interface CarState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  speed: number;
  steering: number;
}

interface Obstacle {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  type: 'static' | 'moving';
  movementPattern?: {
    direction: THREE.Vector3;
    speed: number;
    range: number;
    startPosition: THREE.Vector3;
  };
}

const Game3D: React.FC<Game3DProps> = ({ 
  onScoreUpdate, 
  onGameOver, 
  onHealthUpdate, 
  gameState 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const carRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();
  
  const [carState, setCarState] = useState<CarState>({
    position: new THREE.Vector3(0, 0.5, 0),
    rotation: new THREE.Euler(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0,
    steering: 0
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const gameDataRef = useRef({
    score: 0,
    health: 100,
    distance: 0,
    speed: 0,
    lastObstacleZ: -50
  });

  // Touch controls state
  const touchRef = useRef({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });

  // Initialize 3D scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000033, 50, 200);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000033, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Neon accent lights
    const neonLight1 = new THREE.PointLight(0x00ffff, 0.5, 30);
    neonLight1.position.set(-10, 5, -20);
    scene.add(neonLight1);

    const neonLight2 = new THREE.PointLight(0xff00ff, 0.5, 30);
    neonLight2.position.set(10, 5, -20);
    scene.add(neonLight2);

    // Create road
    createRoad(scene);

    // Create car
    createCar(scene);

    // Generate initial obstacles
    generateObstacles(scene);

  }, []);

  // Create road
  const createRoad = (scene: THREE.Scene) => {
    const roadGeometry = new THREE.PlaneGeometry(20, 1000);
    const roadMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.8
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0;
    road.position.z = -500;
    road.receiveShadow = true;
    scene.add(road);

    // Road markings
    for (let i = 0; i < 100; i++) {
      const markingGeometry = new THREE.PlaneGeometry(0.5, 4);
      const markingMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(0, 0.01, -i * 10 - 10);
      scene.add(marking);
    }

    // Road borders with neon effect
    const borderMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      emissive: 0x002244,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 100; i++) {
      // Left border
      const leftBorderGeometry = new THREE.BoxGeometry(0.2, 0.5, 2);
      const leftBorder = new THREE.Mesh(leftBorderGeometry, borderMaterial);
      leftBorder.position.set(-10, 0.25, -i * 10 - 10);
      scene.add(leftBorder);

      // Right border
      const rightBorder = new THREE.Mesh(leftBorderGeometry, borderMaterial);
      rightBorder.position.set(10, 0.25, -i * 10 - 10);
      scene.add(rightBorder);
    }
  };

  // Create car
  const createCar = (scene: THREE.Scene) => {
    const carGroup = new THREE.Group();

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff4444,
      shininess: 100,
      specular: 0x222222
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    body.castShadow = true;
    carGroup.add(body);

    // Car roof
    const roofGeometry = new THREE.BoxGeometry(1.6, 0.6, 2);
    const roofMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 100
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.1;
    roof.position.z = -0.3;
    roof.castShadow = true;
    carGroup.add(roof);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });

    const wheelPositions = [
      [-1.2, 0.4, 1.3],   // Front left
      [1.2, 0.4, 1.3],    // Front right
      [-1.2, 0.4, -1.3],  // Rear left
      [1.2, 0.4, -1.3]    // Rear right
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffaa,
      emissive: 0xffff88
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.7, 0.6, 2.1);
    carGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.7, 0.6, 2.1);
    carGroup.add(rightHeadlight);

    carGroup.position.copy(carState.position);
    carRef.current = carGroup;
    scene.add(carGroup);
  };

  // Generate obstacles
  const generateObstacles = (scene: THREE.Scene) => {
    const obstacleTypes = [
      { width: 2, height: 2, depth: 2, color: 0xff6600 },
      { width: 1.5, height: 3, depth: 1.5, color: 0x6600ff },
      { width: 3, height: 1, depth: 3, color: 0x00ff66 }
    ];

    for (let i = 0; i < 50; i++) {
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const geometry = new THREE.BoxGeometry(type.width, type.height, type.depth);
      const material = new THREE.MeshPhongMaterial({ 
        color: type.color,
        emissive: new THREE.Color(type.color).multiplyScalar(0.1)
      });
      const obstacle = new THREE.Mesh(geometry, material);

      // Random position within road bounds
      const x = (Math.random() - 0.5) * 16; // Road width is 20, leave some margin
      const z = -50 - i * (10 + Math.random() * 20);
      
      obstacle.position.set(x, type.height / 2, z);
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      scene.add(obstacle);

      const obstacleData: Obstacle = {
        mesh: obstacle,
        position: obstacle.position.clone(),
        type: Math.random() > 0.7 ? 'moving' : 'static'
      };

      // Add movement pattern for moving obstacles
      if (obstacleData.type === 'moving') {
        obstacleData.movementPattern = {
          direction: new THREE.Vector3((Math.random() - 0.5) * 2, 0, 0).normalize(),
          speed: 0.02 + Math.random() * 0.03,
          range: 3 + Math.random() * 4,
          startPosition: obstacle.position.clone()
        };
      }

      obstaclesRef.current.push(obstacleData);
      gameDataRef.current.lastObstacleZ = z;
    }
  };

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysRef.current[event.code] = true;
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysRef.current[event.code] = false;
  }, []);

  // Handle touch input
  const handleTouchStart = useCallback((event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    touchRef.current = {
      isActive: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY
    };
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault();
    if (!touchRef.current.isActive) return;
    
    const touch = event.touches[0];
    touchRef.current.currentX = touch.clientX;
    touchRef.current.currentY = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    event.preventDefault();
    touchRef.current.isActive = false;
  }, []);

  // Update car physics
  const updateCarPhysics = useCallback(() => {
    if (!carRef.current || gameState !== 'playing') return;

    const car = carRef.current;
    let acceleration = 0;
    let steering = 0;

    // Keyboard controls
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
      acceleration = 0.02;
    }
    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
      acceleration = -0.01;
    }
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
      steering = 0.03;
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
      steering = -0.03;
    }

    // Touch controls
    if (touchRef.current.isActive) {
      const deltaX = touchRef.current.currentX - touchRef.current.startX;
      const deltaY = touchRef.current.currentY - touchRef.current.startY;
      
      steering = -deltaX * 0.0001;
      acceleration = -deltaY * 0.00005;
    }

    // Apply physics
    setCarState(prevState => {
      const newState = { ...prevState };
      
      // Update speed
      newState.speed += acceleration;
      newState.speed *= 0.98; // Friction
      newState.speed = Math.max(0, Math.min(newState.speed, 0.5));
      
      // Update steering
      newState.steering = steering * newState.speed;
      
      // Update rotation
      newState.rotation.y += newState.steering;
      
      // Update velocity
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyEuler(newState.rotation);
      newState.velocity = forward.multiplyScalar(newState.speed);
      
      // Update position
      newState.position.add(newState.velocity);
      
      // Keep car on road
      newState.position.x = Math.max(-8, Math.min(8, newState.position.x));
      
      return newState;
    });

    // Update car mesh
    car.position.copy(carState.position);
    car.rotation.copy(carState.rotation);

    // Update game data
    gameDataRef.current.distance += carState.speed;
    gameDataRef.current.speed = carState.speed * 100;
    gameDataRef.current.score = Math.floor(gameDataRef.current.distance * 10);
    
    onScoreUpdate(gameDataRef.current.score);
  }, [carState, gameState, onScoreUpdate]);

  // Update obstacles
  const updateObstacles = useCallback(() => {
    if (!sceneRef.current || gameState !== 'playing') return;

    obstaclesRef.current.forEach(obstacle => {
      // Move static obstacles towards player
      obstacle.position.z += carState.speed;
      
      // Handle moving obstacles
      if (obstacle.type === 'moving' && obstacle.movementPattern) {
        const pattern = obstacle.movementPattern;
        const distance = obstacle.position.distanceTo(pattern.startPosition);
        
        if (distance > pattern.range) {
          pattern.direction.multiplyScalar(-1);
        }
        
        obstacle.position.add(
          pattern.direction.clone().multiplyScalar(pattern.speed)
        );
      }
      
      obstacle.mesh.position.copy(obstacle.position);
      
      // Remove obstacles that are behind the player
      if (obstacle.position.z > carState.position.z + 10) {
        sceneRef.current!.remove(obstacle.mesh);
      }
    });

    // Filter out removed obstacles
    obstaclesRef.current = obstaclesRef.current.filter(
      obstacle => obstacle.position.z <= carState.position.z + 10
    );

    // Generate new obstacles
    if (carState.position.z < gameDataRef.current.lastObstacleZ + 100) {
      generateMoreObstacles();
    }
  }, [carState, gameState]);

  // Generate more obstacles
  const generateMoreObstacles = useCallback(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const obstacleTypes = [
      { width: 2, height: 2, depth: 2, color: 0xff6600 },
      { width: 1.5, height: 3, depth: 1.5, color: 0x6600ff },
      { width: 3, height: 1, depth: 3, color: 0x00ff66 }
    ];

    for (let i = 0; i < 10; i++) {
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const geometry = new THREE.BoxGeometry(type.width, type.height, type.depth);
      const material = new THREE.MeshPhongMaterial({ 
        color: type.color,
        emissive: new THREE.Color(type.color).multiplyScalar(0.1)
      });
      const obstacle = new THREE.Mesh(geometry, material);

      const x = (Math.random() - 0.5) * 16;
      const z = gameDataRef.current.lastObstacleZ - 50 - i * (10 + Math.random() * 20);
      
      obstacle.position.set(x, type.height / 2, z);
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      scene.add(obstacle);

      const obstacleData: Obstacle = {
        mesh: obstacle,
        position: obstacle.position.clone(),
        type: Math.random() > 0.7 ? 'moving' : 'static'
      };

      if (obstacleData.type === 'moving') {
        obstacleData.movementPattern = {
          direction: new THREE.Vector3((Math.random() - 0.5) * 2, 0, 0).normalize(),
          speed: 0.02 + Math.random() * 0.03,
          range: 3 + Math.random() * 4,
          startPosition: obstacle.position.clone()
        };
      }

      obstaclesRef.current.push(obstacleData);
      gameDataRef.current.lastObstacleZ = z;
    }
  }, []);

  // Collision detection
  const checkCollisions = useCallback(() => {
    if (!carRef.current || gameState !== 'playing') return;

    const carBox = new THREE.Box3().setFromObject(carRef.current);

    obstaclesRef.current.forEach(obstacle => {
      const obstacleBox = new THREE.Box3().setFromObject(obstacle.mesh);
      
      if (carBox.intersectsBox(obstacleBox)) {
        // Collision detected
        gameDataRef.current.health -= 20;
        onHealthUpdate(gameDataRef.current.health);
        
        // Remove the obstacle
        if (sceneRef.current) {
          sceneRef.current.remove(obstacle.mesh);
        }
        
        // Check game over
        if (gameDataRef.current.health <= 0) {
          onGameOver();
        }
      }
    });

    // Filter out removed obstacles
    obstaclesRef.current = obstaclesRef.current.filter(obstacle => 
      sceneRef.current?.children.includes(obstacle.mesh)
    );
  }, [gameState, onHealthUpdate, onGameOver]);

  // Update camera
  const updateCamera = useCallback(() => {
    if (!cameraRef.current || !carRef.current) return;

    const camera = cameraRef.current;
    const car = carRef.current;

    // Smooth camera follow
    const idealPosition = new THREE.Vector3(0, 8, 10);
    idealPosition.add(car.position);
    
    camera.position.lerp(idealPosition, 0.1);
    camera.lookAt(car.position);
  }, []);

  // Main game loop
  const gameLoop = useCallback(() => {
    if (gameState === 'playing') {
      updateCarPhysics();
      updateObstacles();
      checkCollisions();
      updateCamera();
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updateCarPhysics, updateObstacles, checkCollisions, updateCamera]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return;

    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, []);

  // Initialize game
  useEffect(() => {
    initScene();

    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
    
    // Touch event listeners
    if (mountRef.current) {
      mountRef.current.addEventListener('touchstart', handleTouchStart, { passive: false });
      mountRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
      mountRef.current.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    // Start game loop
    gameLoop();

    return () => {
      // Cleanup
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current) {
        mountRef.current.removeEventListener('touchstart', handleTouchStart);
        mountRef.current.removeEventListener('touchmove', handleTouchMove);
        mountRef.current.removeEventListener('touchend', handleTouchEnd);
      }

      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [initScene, handleKeyDown, handleKeyUp, handleResize, handleTouchStart, handleTouchMove, handleTouchEnd, gameLoop]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full relative overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  );
};

export default Game3D;