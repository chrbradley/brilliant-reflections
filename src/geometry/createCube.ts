// ABOUTME: Pure function to create an interactive cube (legacy file for tests)
// ABOUTME: This functionality has been replaced by createSphere.ts

import { MeshBuilder, Scene, Mesh, Vector3 } from 'babylonjs';

/**
 * Legacy function - creates a basic cube for testing purposes
 * @deprecated Use createSphere instead
 */
export const createCube = (
  scene: Scene,
  position?: Vector3,
  rotation?: Vector3
): Mesh => {
  const cube = MeshBuilder.CreateBox('colorCube', { size: 2 }, scene);
  
  if (position) {
    cube.position.copyFrom(position);
  } else {
    cube.position = new Vector3(0, 1, 3);
  }
  
  if (rotation) {
    cube.rotation.copyFrom(rotation);
  }
  
  return cube;
};