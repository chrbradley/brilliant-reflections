// ABOUTME: Manages multi-pass rendering for nested reflections
// ABOUTME: Executes multiple render passes to achieve multi-bounce reflections

import { Scene, MirrorTexture, StandardMaterial, Mesh } from 'babylonjs';

/**
 * Configuration for render pass manager
 */
export interface RenderPassConfig {
  scene: Scene;
  maxBounces: number;
  mirrorWalls: string[];
}

/**
 * Render pass information
 */
export interface RenderPass {
  passNumber: number;
  mirrorTextures: MirrorTexture[];
}

/**
 * Manager for multi-pass rendering system
 */
export class RenderPassManager {
  private scene: Scene;
  private maxBounces: number;
  private mirrorWalls: string[];
  private mirrorTextures: Map<string, MirrorTexture>;
  private originalRenderLists: Map<MirrorTexture, Mesh[]>;

  constructor(config: RenderPassConfig) {
    this.scene = config.scene;
    this.maxBounces = config.maxBounces;
    this.mirrorWalls = config.mirrorWalls;
    this.mirrorTextures = new Map();
    this.originalRenderLists = new Map();
    
    this.collectMirrorTextures();
  }

  /**
   * Collect all mirror textures from the scene
   */
  private collectMirrorTextures(): void {
    this.mirrorWalls.forEach(wallName => {
      const wall = this.scene.getMeshByName(wallName);
      if (wall && wall.material && wall.material.constructor.name === 'StandardMaterial') {
        const material = wall.material as StandardMaterial;
        if (material.reflectionTexture && material.reflectionTexture.constructor.name === 'MirrorTexture') {
          this.mirrorTextures.set(wallName, material.reflectionTexture);
          // Store original render list
          this.originalRenderLists.set(
            material.reflectionTexture,
            [...material.reflectionTexture.renderList || []]
          );
        }
      }
    });
  }

  /**
   * Execute all render passes based on bounce count
   */
  public executeRenderPasses(): void {
    if (this.maxBounces < 1) return;

    // First pass: Direct reflections only
    this.executePass(1);

    // Additional passes for nested reflections
    for (let pass = 2; pass <= this.maxBounces; pass++) {
      this.executePass(pass);
    }
  }

  /**
   * Execute a single render pass
   */
  private executePass(passNumber: number): RenderPass {
    const passInfo: RenderPass = {
      passNumber,
      mirrorTextures: Array.from(this.mirrorTextures.values())
    };

    if (passNumber === 1) {
      // First pass: Each mirror sees everything except all mirror walls
      this.mirrorTextures.forEach((texture, wallName) => {
        texture.renderList = this.getFilteredRenderList(this.mirrorWalls);
      });
    } else {
      // Subsequent passes: Mirrors can see each other but not themselves
      this.mirrorTextures.forEach((texture, wallName) => {
        // Exclude only the wall itself
        texture.renderList = this.getFilteredRenderList([wallName]);
      });
    }

    // Force render update for all mirrors
    this.mirrorTextures.forEach(texture => {
      texture.render();
    });

    return passInfo;
  }

  /**
   * Get filtered render list excluding specific walls
   */
  private getFilteredRenderList(excludeWalls: string[]): Mesh[] {
    return this.scene.meshes.filter(mesh => {
      // Exclude specified walls
      if (excludeWalls.includes(mesh.name)) return false;
      
      // Include only visible and enabled meshes
      return mesh.isVisible && mesh.isEnabled();
    });
  }

  /**
   * Update bounce count and re-execute passes
   */
  public setBounceCount(bounces: number): void {
    this.maxBounces = Math.max(1, Math.min(bounces, 5)); // Clamp between 1-5
    this.executeRenderPasses();
  }

  /**
   * Get current bounce count
   */
  public getBounceCount(): number {
    return this.maxBounces;
  }

  /**
   * Reset mirrors to original state
   */
  public reset(): void {
    this.originalRenderLists.forEach((originalList, texture) => {
      texture.renderList = [...originalList];
    });
  }

  /**
   * Refresh mirror texture references after quality change
   */
  public refreshMirrorTextures(): void {
    this.mirrorTextures.clear();
    this.originalRenderLists.clear();
    this.collectMirrorTextures();
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.mirrorTextures.clear();
    this.originalRenderLists.clear();
  }
}