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
 * Camera height above rig
 */
const CAMERA_HEIGHT = 5;

/**
 * Calculates camera position from rig position
 */
const calculateCameraPosition = (rigPosition: Vector3): Vector3 => {
  return new Vector3(
    rigPosition.x,
    rigPosition.y + CAMERA_HEIGHT,
    rigPosition.z
  );
};

/**
 * Calculates camera rotation from rig rotation (yaw only)
 */
const calculateCameraRotation = (rigRotation: Vector3): Vector3 => {
  return new Vector3(
    0, // No pitch
    rigRotation.y, // Same yaw as rig
    0  // No roll
  );
};

/**
 * Syncs camera transform with camera rig
 * 
 * @param rigPosition - Current rig position
 * @param rigRotation - Current rig rotation
 * @returns New camera transform
 */
export const syncCameraWithRig = (
  rigPosition: Vector3,
  rigRotation: Vector3
): CameraTransform => {
  // Calculate new position and rotation
  const position = calculateCameraPosition(rigPosition);
  const rotation = calculateCameraRotation(rigRotation);
  
  return {
    position,
    rotation,
  };
};