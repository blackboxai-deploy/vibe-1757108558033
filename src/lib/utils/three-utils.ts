// Three.js utility functions for the 3D car racing game
import * as THREE from 'three';

export class ThreeUtils {
  /**
   * Create a car geometry with proper proportions
   */
  static createCarGeometry(): THREE.Group {
    const carGroup = new THREE.Group();

    // Car body - main chassis
    const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2196f3,
      transparent: true,
      opacity: 0.9
    });
    const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    carBody.position.y = 0.5;
    carGroup.add(carBody);

    // Car roof
    const roofGeometry = new THREE.BoxGeometry(1.6, 0.4, 2);
    const roofMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1976d2,
      transparent: true,
      opacity: 0.8
    });
    const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
    carRoof.position.y = 1.0;
    carRoof.position.z = 0.2;
    carGroup.add(carRoof);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

    // Front wheels
    const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontLeftWheel.position.set(-1.2, 0.2, 1.3);
    frontLeftWheel.rotation.z = Math.PI / 2;
    carGroup.add(frontLeftWheel);

    const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontRightWheel.position.set(1.2, 0.2, 1.3);
    frontRightWheel.rotation.z = Math.PI / 2;
    carGroup.add(frontRightWheel);

    // Rear wheels
    const rearLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearLeftWheel.position.set(-1.2, 0.2, -1.3);
    rearLeftWheel.rotation.z = Math.PI / 2;
    carGroup.add(rearLeftWheel);

    const rearRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearRightWheel.position.set(1.2, 0.2, -1.3);
    rearRightWheel.rotation.z = Math.PI / 2;
    carGroup.add(rearRightWheel);

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      emissive: 0xffffcc,
      emissiveIntensity: 0.3
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.6, 0.6, 2.1);
    carGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.6, 0.6, 2.1);
    carGroup.add(rightHeadlight);

    // Store wheel references for animation
    (carGroup as any).wheels = {
      frontLeft: frontLeftWheel,
      frontRight: frontRightWheel,
      rearLeft: rearLeftWheel,
      rearRight: rearRightWheel
    };

    return carGroup;
  }

  /**
   * Create an obstacle geometry
   */
  static createObstacleGeometry(type: 'barrier' | 'wall' | 'cone'): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (type) {
      case 'barrier':
        geometry = new THREE.BoxGeometry(0.5, 1, 3);
        material = new THREE.MeshLambertMaterial({ 
          color: 0xff5722,
          transparent: true,
          opacity: 0.8
        });
        break;
      case 'wall':
        geometry = new THREE.BoxGeometry(8, 2, 1);
        material = new THREE.MeshLambertMaterial({ 
          color: 0x795548,
          transparent: true,
          opacity: 0.9
        });
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        material = new THREE.MeshLambertMaterial({ 
          color: 0xff9800,
          transparent: true,
          opacity: 0.8
        });
        break;
    }

    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.y = type === 'cone' ? 0.75 : 1;
    obstacle.userData.type = type;
    
    return obstacle;
  }

  /**
   * Create road geometry
   */
  static createRoadGeometry(width: number = 20, length: number = 1000): THREE.Mesh {
    const roadGeometry = new THREE.PlaneGeometry(width, length);
    const roadMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x424242,
      transparent: true,
      opacity: 0.9
    });

    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = -0.1;
    
    return road;
  }

  /**
   * Create road markings
   */
  static createRoadMarkings(width: number = 20, length: number = 1000): THREE.Group {
    const markingsGroup = new THREE.Group();
    
    const lineGeometry = new THREE.PlaneGeometry(0.2, 4);
    const lineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    // Center line
    for (let z = -length / 2; z < length / 2; z += 8) {
      const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
      centerLine.rotation.x = -Math.PI / 2;
      centerLine.position.set(0, 0, z);
      markingsGroup.add(centerLine);
    }

    // Side lines
    const sideLineGeometry = new THREE.PlaneGeometry(0.3, length);
    const leftSideLine = new THREE.Mesh(sideLineGeometry, lineMaterial);
    leftSideLine.rotation.x = -Math.PI / 2;
    leftSideLine.position.set(-width / 2, 0, 0);
    markingsGroup.add(leftSideLine);

    const rightSideLine = new THREE.Mesh(sideLineGeometry, lineMaterial);
    rightSideLine.rotation.x = -Math.PI / 2;
    rightSideLine.position.set(width / 2, 0, 0);
    markingsGroup.add(rightSideLine);

    return markingsGroup;
  }

  /**
   * Create particle system for collision effects
   */
  static createParticleSystem(): THREE.Points {
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = Math.random() * 5;
      positions[i + 2] = (Math.random() - 0.5) * 10;
      
      colors[i] = 1;
      colors[i + 1] = Math.random();
      colors[i + 2] = 0;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.visible = false;
    
    return particles;
  }

  /**
   * Setup scene lighting
   */
  static setupLighting(scene: THREE.Scene): void {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
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

    // Point lights for dynamic lighting
    const pointLight1 = new THREE.PointLight(0x4fc3f7, 0.5, 30);
    pointLight1.position.set(-10, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4fc3f7, 0.5, 30);
    pointLight2.position.set(10, 5, 0);
    scene.add(pointLight2);
  }

  /**
   * Create skybox/background
   */
  static createSkybox(scene: THREE.Scene): void {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x87ceeb,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8
    });
    const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skybox);
  }

  /**
   * Enable shadows for object
   */
  static enableShadows(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  /**
   * Dispose of geometry and material to prevent memory leaks
   */
  static dispose(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }
}