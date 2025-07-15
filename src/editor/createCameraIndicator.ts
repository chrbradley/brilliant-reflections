// ABOUTME: Creates a simple box indicator to show camera position and orientation
// ABOUTME: The elongated dimension points in the camera's viewing direction

import {
  MeshBuilder,
  Scene,
  Mesh,
  StandardMaterial,
  Color3,
  Vector3,
} from 'babylonjs';

/**
 * Camera indicator configuration
 */
export interface CameraIndicatorConfig {
  indicator: Mesh;
}

/**
 * Creates a box indicator for the camera
 * The Z-axis (depth) is twice as long to show viewing direction
 */
const createIndicatorBox = (scene: Scene): Mesh => {
  const box = MeshBuilder.CreateBox(
    'cameraIndicator',
    {
      width: 1, // X dimension
      height: 1, // Y dimension
      depth: 2, // Z dimension (viewing direction)
    },
    scene
  );

  // Position the box so its back is at the origin (camera position)
  // This way the elongated part points forward from the camera location
  box.position.z = 1; // Move forward by half the depth

  // Create a semi-transparent blue material
  const material = new StandardMaterial('cameraIndicatorMat', scene);
  material.diffuseColor = new Color3(0, 0.7, 1);
  material.alpha = 0.7;
  box.material = material;

  // Enable edge rendering for better visibility
  box.enableEdgesRendering();
  box.edgesWidth = 4.0;
  box.edgesColor = new Color3(0, 0.5, 1).toColor4();

  // Make it pickable for gizmo interaction
  box.isPickable = true;

  return box;
};

/**
 * Creates a camera indicator that directly represents camera position and orientation
 *
 * @param scene - The scene to add the indicator to
 * @param position - Initial position vector
 * @param rotation - Initial rotation vector
 * @param lookAtTarget - Target position to look at
 * @returns Camera indicator configuration
 */
export const createCameraIndicator = (
  scene: Scene,
  position: Vector3,
  rotation: Vector3,
  lookAtTarget: Vector3
): CameraIndicatorConfig => {
  const indicator = createIndicatorBox(scene);

  // Set initial position
  indicator.position.copyFrom(position);

  // Orient to look at target
  indicator.lookAt(lookAtTarget);

  // Apply any additional rotation if needed
  indicator.rotation.addInPlace(rotation);

  return {
    indicator,
  };
};
