// ABOUTME: Manager for ray visualization state and updates
// ABOUTME: Handles showing/hiding rays and rebuilding on changes

import { Scene, TransformNode, Vector3, Matrix } from 'babylonjs';
import { createAllRayMeshes, RayVisualizationConfig } from './createRayMeshes';
import { RayConfig } from './types';

/**
 * Ray manager state
 */
export interface RayManager {
  parentNode: TransformNode;
  scene: Scene;
  isVisible: boolean;
  currentConfig: RayConfig | null;
}

/**
 * Creates a new ray manager
 *
 * @param scene - Scene to manage rays in
 * @returns Ray manager instance
 */
export const createRayManager = (scene: Scene): RayManager => {
  const parentNode = new TransformNode('raysParent', scene);
  parentNode.setEnabled(false); // Start hidden

  return {
    parentNode,
    scene,
    isVisible: false,
    currentConfig: null,
  };
};

/**
 * Shows the ray visualization
 *
 * @param manager - Ray manager instance
 * @returns Updated manager
 */
export const showRays = (manager: RayManager): RayManager => {
  manager.parentNode.setEnabled(true);
  return {
    ...manager,
    isVisible: true,
  };
};

/**
 * Hides the ray visualization
 *
 * @param manager - Ray manager instance
 * @returns Updated manager
 */
export const hideRays = (manager: RayManager): RayManager => {
  manager.parentNode.setEnabled(false);
  return {
    ...manager,
    isVisible: false,
  };
};

/**
 * Updates ray visualization with new configuration
 *
 * @param manager - Ray manager instance
 * @param origin - Ray origin position
 * @param worldMatrix - World transformation matrix
 * @param config - Ray configuration
 * @returns Updated manager
 */
export const updateRays = (
  manager: RayManager,
  origin: Vector3,
  worldMatrix: Matrix,
  config: RayConfig
): RayManager => {
  const vizConfig: RayVisualizationConfig = {
    origin,
    worldMatrix,
    rayCount: config.count,
    fanRays: config.fanRays,
    maxBounces: config.maxBounces,
    scene: manager.scene,
    parentNode: manager.parentNode,
  };

  createAllRayMeshes(vizConfig);

  return {
    ...manager,
    currentConfig: config,
  };
};

/**
 * Disposes of all ray resources
 *
 * @param manager - Ray manager instance
 */
export const disposeRayManager = (manager: RayManager): void => {
  manager.parentNode.dispose(false, true); // Dispose node and all children
};
