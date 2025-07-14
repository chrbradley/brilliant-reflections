// ABOUTME: Pure function to create position gizmo with movement constraints
// ABOUTME: Returns gizmo configuration for X/Z axis movement with grid snapping

import { Scene, PositionGizmo, Mesh, GizmoManager } from 'babylonjs';
import { applyPositionConstraints } from '../transforms/positionTransforms';

/**
 * Position gizmo constraints
 */
export interface PositionConstraints {
  xEnabled: boolean;
  yEnabled: boolean;
  zEnabled: boolean;
  updateCallback: () => void;
}

/**
 * Position gizmo configuration
 */
export interface PositionGizmoConfig {
  gizmo: PositionGizmo;
  attachedMesh: Mesh;
  constraints: PositionConstraints;
}

/**
 * Creates a position gizmo with constraints
 * 
 * @param scene - The scene to create gizmo in
 * @param mesh - The mesh to attach gizmo to
 * @param gridSize - Grid snap size (default 1)
 * @param limit - Position limit (default 8)
 * @returns Position gizmo configuration
 */
export const createPositionGizmo = (
  scene: Scene,
  mesh: Mesh,
  gridSize: number = 1,
  limit: number = 8
): PositionGizmoConfig => {
  // Create gizmo manager if not exists
  if (!scene.gizmoManager) {
    scene.gizmoManager = new GizmoManager(scene);
  }
  
  // Create position gizmo
  const gizmo = new PositionGizmo();
  gizmo.attachedMesh = mesh;
  gizmo.updateScale = false; // Don't scale with distance
  
  // Disable Y axis movement
  gizmo.yGizmo.isEnabled = false;
  
  // Create constraint callback
  const updateCallback = (): void => {
    if (mesh.position) {
      const constrained = applyPositionConstraints(
        mesh.position,
        gridSize,
        limit
      );
      mesh.position.copyFrom(constrained);
    }
  };
  
  // Apply constraints on drag (check for drag behavior in test environment)
  if (gizmo.xGizmo.dragBehavior?.onPositionChangedObservable) {
    gizmo.xGizmo.dragBehavior.onPositionChangedObservable.add(updateCallback);
  }
  if (gizmo.zGizmo.dragBehavior?.onPositionChangedObservable) {
    gizmo.zGizmo.dragBehavior.onPositionChangedObservable.add(updateCallback);
  }
  
  // Return configuration
  return {
    gizmo,
    attachedMesh: mesh,
    constraints: {
      xEnabled: true,
      yEnabled: false,
      zEnabled: true,
      updateCallback,
    },
  };
};