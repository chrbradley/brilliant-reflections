// ABOUTME: Creates a simple box indicator to show camera position and orientation
// ABOUTME: The elongated dimension points in the camera's viewing direction

import { MeshBuilder, Scene, Mesh, StandardMaterial, Color3, Vector3 } from 'babylonjs';

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
      width: 1,      // X dimension
      height: 1,     // Y dimension  
      depth: 2,      // Z dimension (viewing direction)
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
 * @param initialPosition - Initial position (default: (0, 5, -10))
 * @returns Camera indicator configuration
 */
export const createCameraIndicator = (
  scene: Scene,
  initialPosition = { x: 0, y: 5, z: -10 }
): CameraIndicatorConfig => {
  const indicator = createIndicatorBox(scene);
  
  // Set initial position (this is where the camera will be)
  indicator.position.set(
    initialPosition.x,
    initialPosition.y,
    initialPosition.z
  );
  
  // The box needs to look at the origin (where the cube is)
  // We'll use lookAt to orient it correctly
  indicator.lookAt(new Vector3(0, 0, 0));
  
  // lookAt makes -Z face the target, but we want +Z to be the viewing direction
  // So we need to rotate 180 degrees around Y
  indicator.rotation.y += Math.PI;
  
  return {
    indicator
  };
};