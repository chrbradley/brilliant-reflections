// ABOUTME: Pure function to create rotation gizmo with Y-axis rotation constraints
// ABOUTME: Returns gizmo configuration for Y-axis rotation with angle snapping

import { Scene, Mesh, GizmoManager } from 'babylonjs';
import {
  applyRotationConstraints,
  degreesToRadians,
} from '../transforms/rotationTransforms';

/**
 * Rotation gizmo constraints
 */
export interface RotationConstraints {
  xEnabled: boolean;
  yEnabled: boolean;
  zEnabled: boolean;
  updateCallback: () => void;
}

/**
 * Rotation gizmo configuration
 */
export interface RotationGizmoConfig {
  gizmoManager: GizmoManager;
  attachedMesh: Mesh;
  constraints: RotationConstraints;
}

/**
 * Creates a rotation gizmo with constraints using GizmoManager
 *
 * @param scene - The scene to create gizmo in
 * @param mesh - The mesh to attach gizmo to
 * @param snapDegrees - Rotation snap size in degrees (default 15)
 * @returns Rotation gizmo configuration
 */
export const createRotationGizmo = (
  scene: Scene,
  mesh: Mesh,
  snapDegrees: number = 15
): RotationGizmoConfig => {
  // Get existing gizmo manager (should exist from position gizmo)
  const gizmoManager = scene.gizmoManager;
  if (!gizmoManager) {
    throw new Error(
      'GizmoManager not found. Position gizmo should be created first.'
    );
  }

  // Enable rotation gizmo
  gizmoManager.rotationGizmoEnabled = true;

  // Configure gizmo settings (delayed to ensure gizmo is ready)
  setTimeout(() => {
    if (gizmoManager.gizmos.rotationGizmo) {
      const rotGizmo = gizmoManager.gizmos.rotationGizmo;
      rotGizmo.snapDistance = degreesToRadians(snapDegrees); // Convert to radians
      rotGizmo.updateGizmoRotationToMatchAttachedMesh = false; // World-aligned

      // Disable X and Z axis rotation (Y-axis only)
      if (rotGizmo.xGizmo) {
        rotGizmo.xGizmo.isEnabled = false;
      }
      if (rotGizmo.zGizmo) {
        rotGizmo.zGizmo.isEnabled = false;
      }
    }
  }, 0);

  // Create constraint callback
  const updateCallback = (): void => {
    if (mesh.rotation) {
      const constrained = applyRotationConstraints(mesh.rotation, snapDegrees);
      mesh.rotation.copyFrom(constrained);
    }
  };

  // Apply constraints on drag (after gizmo is ready)
  setTimeout(() => {
    if (
      gizmoManager.gizmos.rotationGizmo?.yGizmo?.dragBehavior?.onDragObservable
    ) {
      gizmoManager.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragObservable.add(
        updateCallback
      );
    }
  }, 50);

  // Return configuration
  return {
    gizmoManager,
    attachedMesh: mesh,
    constraints: {
      xEnabled: false,
      yEnabled: true,
      zEnabled: false,
      updateCallback,
    },
  };
};
