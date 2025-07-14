// ABOUTME: Functions for creating mirror texture configurations
// ABOUTME: Calculates reflection planes and prepares mirror settings

import { Vector3, Plane, Scene } from 'babylonjs';

/**
 * Mirror configuration for a wall
 */
export interface MirrorConfig {
  name: string;
  textureSize: number;
  reflectionPlane: Plane;
  scene: Scene;
}

/**
 * Calculates the reflection plane for a wall
 * 
 * @param position - Wall position
 * @param normal - Wall normal vector (pointing inward)
 * @returns Reflection plane
 */
export const calculateReflectionPlane = (
  position: Vector3,
  normal: Vector3
): Plane => {
  // Create plane from position and normal
  // Plane equation: ax + by + cz + d = 0
  // where (a,b,c) is the normal and d = -dot(normal, position)
  return Plane.FromPositionAndNormal(position, normal);
};

/**
 * Creates mirror configuration for a wall
 * 
 * @param wallName - Name of the wall mesh
 * @param position - Wall position
 * @param normal - Wall normal vector
 * @param scene - Scene to create mirror in
 * @returns Mirror configuration
 */
export const createMirrorConfig = (
  wallName: string,
  position: Vector3,
  normal: Vector3,
  scene: Scene
): MirrorConfig => {
  const reflectionPlane = calculateReflectionPlane(position, normal);
  
  return {
    name: `${wallName}_mirror`,
    textureSize: 512, // Balance quality vs performance
    reflectionPlane,
    scene,
  };
};