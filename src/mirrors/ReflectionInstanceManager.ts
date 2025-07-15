// ABOUTME: Manages reflection instances for multi-bounce visualization
// ABOUTME: Dynamically generates and updates instances based on bounce count

import { Scene, Mesh, Vector3, InstancedMesh } from 'babylonjs';

/**
 * Represents a reflection path through multiple mirrors
 */
export interface ReflectionPath {
  id: string;
  bounceCount: number;
  walls: string[]; // Sequence of walls hit (e.g., ['north', 'east'])
  position: Vector3;
  scaling: Vector3; // Tracks which axes are flipped
}

/**
 * Configuration for reflection instance manager
 */
export interface ReflectionConfig {
  scene: Scene;
  mirrorWalls: {
    north: { position: number; normal: Vector3 };
    east: { position: number; normal: Vector3 };
    west: { position: number; normal: Vector3 };
  };
}

/**
 * Manages dynamic reflection instance generation
 */
export class ReflectionInstanceManager {
  private scene: Scene;
  private mirrorWalls: ReflectionConfig['mirrorWalls'];
  private instances: Map<string, InstancedMesh> = new Map();
  private paths: Map<string, ReflectionPath> = new Map();
  
  constructor(config: ReflectionConfig) {
    this.scene = config.scene;
    this.mirrorWalls = config.mirrorWalls;
  }
  
  /**
   * Generate all possible reflection paths up to maxBounces
   */
  generateReflectionPaths(sourcePosition: Vector3, maxBounces: number): ReflectionPath[] {
    const paths: ReflectionPath[] = [];
    
    // Start with direct reflections (1 bounce)
    if (maxBounces >= 1) {
      paths.push(...this.generateSingleBounce(sourcePosition));
    }
    
    // Generate higher bounces recursively
    for (let bounce = 2; bounce <= maxBounces; bounce++) {
      const previousPaths = paths.filter(p => p.bounceCount === bounce - 1);
      
      for (const prevPath of previousPaths) {
        paths.push(...this.generateNextBounce(prevPath, sourcePosition));
      }
    }
    
    return paths;
  }
  
  /**
   * Generate single bounce reflections
   */
  private generateSingleBounce(sourcePosition: Vector3): ReflectionPath[] {
    return [
      {
        id: 'north',
        bounceCount: 1,
        walls: ['north'],
        position: this.reflectAcrossWall(sourcePosition, 'north'),
        scaling: new Vector3(1, 1, -1) // Z-flip for north wall
      },
      {
        id: 'east',
        bounceCount: 1,
        walls: ['east'],
        position: this.reflectAcrossWall(sourcePosition, 'east'),
        scaling: new Vector3(-1, 1, 1) // X-flip for east wall
      },
      {
        id: 'west',
        bounceCount: 1,
        walls: ['west'],
        position: this.reflectAcrossWall(sourcePosition, 'west'),
        scaling: new Vector3(-1, 1, 1) // X-flip for west wall
      }
    ];
  }
  
  /**
   * Generate next bounce from a previous path
   */
  private generateNextBounce(prevPath: ReflectionPath, sourcePosition: Vector3): ReflectionPath[] {
    const paths: ReflectionPath[] = [];
    const lastWall = prevPath.walls[prevPath.walls.length - 1];
    
    // Try reflecting off each wall (except the last one to avoid direct back-reflection)
    const walls = ['north', 'east', 'west'].filter(w => w !== lastWall);
    
    for (const wall of walls) {
      const newPath: ReflectionPath = {
        id: `${prevPath.id}_${wall}`,
        bounceCount: prevPath.bounceCount + 1,
        walls: [...prevPath.walls, wall],
        position: this.calculateMultiBouncePosition(sourcePosition, [...prevPath.walls, wall]),
        scaling: this.calculateCumulativeScaling(prevPath.scaling, wall)
      };
      
      paths.push(newPath);
    }
    
    return paths;
  }
  
  /**
   * Reflect position across a single wall
   */
  private reflectAcrossWall(position: Vector3, wall: string): Vector3 {
    switch (wall) {
      case 'north':
        return new Vector3(position.x, position.y, 20 - position.z);
      case 'east':
        return new Vector3(20 - position.x, position.y, position.z);
      case 'west':
        return new Vector3(-20 - position.x, position.y, position.z);
      default:
        return position.clone();
    }
  }
  
  /**
   * Calculate position after multiple bounces
   */
  private calculateMultiBouncePosition(sourcePosition: Vector3, walls: string[]): Vector3 {
    let position = sourcePosition.clone();
    
    // Apply each reflection in sequence
    for (const wall of walls) {
      position = this.reflectAcrossWall(position, wall);
    }
    
    return position;
  }
  
  /**
   * Calculate cumulative scaling after reflecting off a wall
   */
  private calculateCumulativeScaling(currentScaling: Vector3, wall: string): Vector3 {
    const scaling = currentScaling.clone();
    
    switch (wall) {
      case 'north':
        scaling.z *= -1; // Flip Z
        break;
      case 'east':
      case 'west':
        scaling.x *= -1; // Flip X
        break;
    }
    
    return scaling;
  }
  
  /**
   * Create or update instances for a mesh based on bounce count
   */
  public updateInstances(
    sourceMesh: Mesh,
    sourcePosition: Vector3,
    sourceRotation: Vector3,
    maxBounces: number
  ): void {
    // Generate paths for current bounce count
    const paths = this.generateReflectionPaths(sourcePosition, maxBounces);
    
    // Hide all existing instances
    this.instances.forEach(instance => instance.setEnabled(false));
    
    // Create or update instances for each path
    for (const path of paths) {
      let instance = this.instances.get(path.id);
      
      // Create instance if it doesn't exist
      if (!instance) {
        instance = sourceMesh.createInstance(`${sourceMesh.name}_${path.id}`);
        this.instances.set(path.id, instance);
      }
      
      // Update instance properties
      instance.position = path.position;
      instance.rotation = sourceRotation.clone();
      instance.scaling = path.scaling;
      instance.setEnabled(true);
    }
    
    // Store paths for later reference
    this.paths.clear();
    paths.forEach(path => this.paths.set(path.id, path));
  }
  
  /**
   * Hide all instances (e.g., during drag)
   */
  public hideAll(): void {
    this.instances.forEach(instance => instance.setEnabled(false));
  }
  
  /**
   * Show instances based on current bounce count
   */
  public showAll(maxBounces: number): void {
    this.instances.forEach((instance, id) => {
      const path = this.paths.get(id);
      if (path && path.bounceCount <= maxBounces) {
        instance.setEnabled(true);
      } else {
        instance.setEnabled(false);
      }
    });
  }
  
  /**
   * Dispose of all instances
   */
  public dispose(): void {
    this.instances.forEach(instance => instance.dispose());
    this.instances.clear();
    this.paths.clear();
  }
}