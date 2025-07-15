// ABOUTME: Pure function to create a perspective camera for the render view
// ABOUTME: Returns configured camera with appropriate FOV and position

import { UniversalCamera, Vector3, Scene } from 'babylonjs';
import { applyLayerMaskToCamera } from '../utils/applyLayerMask';
import { RENDER_CAMERA_MASK } from '../constants/layerMasks';

/**
 * Creates camera position for perspective view
 */
const createCameraPosition = (): Vector3 => {
  return new Vector3(0, 5, -10);
};

/**
 * Creates camera target (look-at point)
 */
const createCameraTarget = (): Vector3 => {
  return new Vector3(0, 0, 0);
};

/**
 * Converts degrees to radians
 */
const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Configures camera field of view and clipping planes
 */
const configurePerspectiveSettings = (camera: UniversalCamera): void => {
  // Set FOV to approximately 60 degrees
  camera.fov = degreesToRadians(60);

  // Set reasonable clipping planes for our room scene
  // Extended far plane to see distant mirror instances (5+ bounces)
  camera.minZ = 0.1;
  camera.maxZ = 1000;
};

/**
 * Creates and configures a perspective camera for the render view
 *
 * @param name - The name for the camera
 * @param scene - The scene to add the camera to
 * @returns Configured perspective camera
 */
export const createPerspectiveCamera = (
  name: string,
  scene: Scene
): UniversalCamera => {
  const position = createCameraPosition();
  const target = createCameraTarget();

  // Create camera
  const camera = new UniversalCamera(name, position, scene);

  // Set target
  camera.setTarget(target);

  // Configure perspective settings
  configurePerspectiveSettings(camera);

  // Apply render layer mask so camera only sees render objects
  applyLayerMaskToCamera(camera, RENDER_CAMERA_MASK);

  return camera;
};
