// ABOUTME: Pure function to calculate camera transform from rig position
// ABOUTME: Returns new position and rotation for perspective camera

import { Vector3 } from 'babylonjs';

/**
 * Camera transform data
 */
export interface CameraTransform {
  position: Vector3;
  rotation: Vector3;
}

/**
 * Calculates camera position from rig position
 * Camera should be at the base of the cone (wide end)
 * The cone is 2 units tall, so base is 1 unit up from rig when pointing up
 * When rotated forward (rig.rotation.x = PI/2), base is 1 unit behind rig
 */
const calculateCameraPosition = (rigPosition: Vector3, pivotRotation: Vector3): Vector3 => {
  // Camera is positioned 1 unit up and 4 units back from the rig
  // This puts it at the base of the cone looking forward
  const cameraDistance = 4; // Distance from rig center
  const cameraHeight = 1; // Height above rig
  
  // Apply pivot Y rotation to determine camera offset
  const yRotation = pivotRotation.y;
  const offsetX = -Math.sin(yRotation) * cameraDistance;
  const offsetZ = -Math.cos(yRotation) * cameraDistance;
  
  return new Vector3(
    rigPosition.x + offsetX,
    rigPosition.y + cameraHeight,
    rigPosition.z + offsetZ
  );
};

/**
 * Calculates camera rotation to look forward
 * Camera should look in the same direction as the cone points
 * The pivotNode starts with rotation.y = PI/4, but the camera needs adjustment
 */
const calculateCameraRotation = (pivotRotation: Vector3): Vector3 => {
  // The pivotNode has an initial rotation of PI/4 (45 degrees)
  // But the render camera is 90 degrees off, so we need to adjust by -PI/2
  const rotationAdjustment = -Math.PI / 2;
  
  return new Vector3(
    0, // Look straight forward
    pivotRotation.y + rotationAdjustment, // Adjusted yaw
    0 // No roll
  );
};

/**
 * Syncs camera transform with camera rig
 *
 * @param rigPosition - Current rig position
 * @param pivotRotation - Current pivot rotation (for Y-axis orientation)
 * @returns New camera transform
 */
export const syncCameraWithRig = (
  rigPosition: Vector3,
  pivotRotation: Vector3
): CameraTransform => {
  // Calculate new position and rotation
  const position = calculateCameraPosition(rigPosition, pivotRotation);
  const rotation = calculateCameraRotation(pivotRotation);

  return {
    position,
    rotation,
  };
};
