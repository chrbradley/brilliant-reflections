// ABOUTME: Functions for applying mirror materials to walls
// ABOUTME: Handles mirror texture creation and mesh assignment

import { StandardMaterial, MirrorTexture, Mesh, Color3 } from 'babylonjs';
import type { MirrorConfig } from './createMirrorTexture';

/**
 * Result of applying a mirror to a wall
 */
export interface AppliedMirror {
  wall: Mesh;
  material: StandardMaterial;
}

/**
 * Gets the list of walls that should have mirrors
 * Based on spec: north, east, and west walls only
 *
 * @returns Array of wall names
 */
export const getMirrorWalls = (): string[] => {
  return ['northWall', 'eastWall', 'westWall'];
};

/**
 * Creates a mirror material from configuration
 *
 * @param config - Mirror configuration
 * @returns Standard material with mirror texture
 */
export const createMirrorMaterial = (
  config: MirrorConfig
): StandardMaterial => {
  const material = new StandardMaterial(
    `${config.name}_material`,
    config.scene
  );

  try {
    // Create mirror texture
    const mirrorTexture = new MirrorTexture(
      config.name,
      config.textureSize,
      config.scene,
      true // Generate mipmaps
    );

    // Set reflection plane
    mirrorTexture.mirrorPlane = config.reflectionPlane;

    // Initially empty render list - will be populated later
    mirrorTexture.renderList = [];

    // Apply to material (like in working example)
    material.reflectionTexture = mirrorTexture;
    material.reflectionTexture.level = 1; // Full reflection
    
    // Make reflections more vivid
    material.diffuseColor = new Color3(0.1, 0.1, 0.1); // Very dark diffuse so reflection dominates
    material.specularColor = new Color3(1, 1, 1); // Bright specular for shininess
    material.specularPower = 64; // Higher value = more focused reflections
  } catch (e) {
    // In test environment, WebGL context may not be available
    // Return material without mirror texture
    console.warn('Failed to create mirror texture:', e);
  }

  return material;
};

/**
 * Applies mirror material to a wall mesh
 *
 * @param wall - Wall mesh to apply mirror to
 * @param mirrorConfig - Mirror configuration
 * @returns Applied mirror result
 */
export const applyMirrorToWall = (
  wall: Mesh,
  mirrorConfig: MirrorConfig
): AppliedMirror => {
  const material = createMirrorMaterial(mirrorConfig);

  // Apply material to wall
  wall.material = material;

  // Configure render list: all meshes except the wall itself
  if (
    material.reflectionTexture &&
    material.reflectionTexture instanceof MirrorTexture
  ) {
    const mirrorTexture = material.reflectionTexture as MirrorTexture;
    mirrorTexture.renderList = mirrorConfig.scene.meshes.filter(
      (mesh) => mesh !== wall && mesh.isVisible && mesh.isEnabled()
    );
  }

  return {
    wall,
    material,
  };
};
