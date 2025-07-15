// ABOUTME: Simple function to sync render camera with camera indicator
// ABOUTME: Directly copies position and rotation from indicator to camera

import { Vector3, UniversalCamera, Mesh } from 'babylonjs';

/**
 * Syncs render camera with camera indicator
 * 
 * @param camera - The render camera to update
 * @param indicator - The camera indicator mesh
 */
export const syncCameraWithIndicator = (
  camera: UniversalCamera,
  indicator: Mesh
): void => {
  // Copy position directly
  camera.position.copyFrom(indicator.position);
  
  // Copy rotation directly
  camera.rotation.copyFrom(indicator.rotation);
  
  // Update camera target based on rotation
  // Camera looks forward along its local Z axis
  const forward = new Vector3(0, 0, 1);
  const rotationMatrix = indicator.getWorldMatrix();
  const lookDirection = Vector3.TransformNormal(forward, rotationMatrix);
  const target = camera.position.add(lookDirection);
  
  camera.setTarget(target);
};