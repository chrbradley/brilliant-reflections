// ABOUTME: Pure function to create an orthographic camera for the editor view
// ABOUTME: Returns configured camera looking down with proper orientation

import { UniversalCamera, Vector3, Scene } from 'babylonjs';

/**
 * Creates camera position for top-down view
 */
const createCameraPosition = (): Vector3 => {
  return new Vector3(0, 20, 0);
};

/**
 * Creates camera target (look-at point)
 */
const createCameraTarget = (): Vector3 => {
  return new Vector3(0, 0, 0);
};

/**
 * Configures orthographic projection bounds
 */
const configureOrthographicBounds = (camera: UniversalCamera): void => {
  // Set orthographic mode
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  
  // Configure to show 20x20 unit area
  camera.orthoLeft = -10;
  camera.orthoRight = 10;
  camera.orthoTop = 10;
  camera.orthoBottom = -10;
};

/**
 * Sets up camera orientation for correct axis display
 */
const configureCameraOrientation = (camera: UniversalCamera): void => {
  // Set up vector to +Z so that +X points right when looking down -Y
  camera.upVector = new Vector3(0, 0, 1);
  
  // Flip X-axis so +X is right, -X is left (matches reference implementation)
  camera.rotation.z = -Math.PI;
};

/**
 * Creates and configures an orthographic camera for the editor view
 * 
 * @param name - The name for the camera
 * @param scene - The scene to add the camera to
 * @returns Configured orthographic camera
 */
export const createOrthographicCamera = (
  name: string,
  scene: Scene
): UniversalCamera => {
  const position = createCameraPosition();
  const target = createCameraTarget();
  
  // Create camera
  const camera = new UniversalCamera(name, position, scene);
  
  // Set target
  camera.setTarget(target);
  
  // Configure orthographic projection
  configureOrthographicBounds(camera);
  
  // Configure orientation
  configureCameraOrientation(camera);
  
  return camera;
};