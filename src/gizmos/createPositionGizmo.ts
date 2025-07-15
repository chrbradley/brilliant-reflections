// ABOUTME: Pure function to create position gizmo with movement constraints
// ABOUTME: Returns gizmo configuration for X/Z axis movement with grid snapping

import { Scene, Mesh, GizmoManager } from 'babylonjs';
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
  gizmoManager: GizmoManager;
  attachedMesh: Mesh;
  constraints: PositionConstraints;
}

/**
 * Creates a position gizmo with constraints using GizmoManager
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
  let gizmoManager = scene.gizmoManager;
  if (!gizmoManager) {
    gizmoManager = new GizmoManager(scene);
    scene.gizmoManager = gizmoManager;
  }

  // Enable position gizmo
  gizmoManager.positionGizmoEnabled = true;

  // Configure gizmo settings
  if (gizmoManager.gizmos.positionGizmo) {
    const posGizmo = gizmoManager.gizmos.positionGizmo;
    posGizmo.snapDistance = gridSize; // Grid snapping
    posGizmo.updateGizmoRotationToMatchAttachedMesh = false; // World-aligned

    // Disable Y axis movement
    if (posGizmo.yGizmo) {
      posGizmo.yGizmo.isEnabled = false;
    }
  }

  // Attach to mesh
  gizmoManager.attachToMesh(mesh);

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

  // Apply constraints on drag (after gizmo is ready)
  setTimeout(() => {
    if (gizmoManager.gizmos.positionGizmo) {
      const posGizmo = gizmoManager.gizmos.positionGizmo;

      // Add constraints to X and Z gizmos
      if (posGizmo.xGizmo?.dragBehavior?.onDragObservable) {
        posGizmo.xGizmo.dragBehavior.onDragObservable.add(updateCallback);
      }
      if (posGizmo.zGizmo?.dragBehavior?.onDragObservable) {
        posGizmo.zGizmo.dragBehavior.onDragObservable.add(updateCallback);
      }
    }
  }, 0);

  // Return configuration
  return {
    gizmoManager,
    attachedMesh: mesh,
    constraints: {
      xEnabled: true,
      yEnabled: false,
      zEnabled: true,
      updateCallback,
    },
  };
};
