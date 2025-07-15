// ABOUTME: Centralized configuration for initial object positions and rotations
// ABOUTME: Single source of truth for both initialization and reset functionality

import { Vector3 } from 'babylonjs';

/**
 * Initial state configuration for scene objects
 */
export interface InitialStateConfig {
  cube: {
    position: Vector3;
    rotation: Vector3;
  };
  cameraIndicator: {
    position: Vector3;
    rotation: Vector3;
  };
}

/**
 * Create the initial state configuration
 * This is the single source of truth for object positions/rotations
 */
export const createInitialStateConfig = (): InitialStateConfig => {
  return {
    cube: {
      position: new Vector3(0, 5, 5), // Centered horizontally, Y=5, forward 5 units
      rotation: new Vector3(0, 0, 0),
    },
    cameraIndicator: {
      position: new Vector3(0, 5, -5), // Behind origin, same height as cube
      rotation: new Vector3(0, 0, 0), // Will be calculated to look at cube
    },
  };
};

/**
 * Calculate camera indicator rotation to look at target
 * @param indicatorPosition - Position of the camera indicator
 * @param targetPosition - Position to look at (cube position)
 * @returns Rotation vector for the indicator
 */
export const calculateCameraLookAtRotation = (
  indicatorPosition: Vector3,
  targetPosition: Vector3
): Vector3 => {
  // Calculate direction from indicator to target
  const direction = targetPosition.subtract(indicatorPosition);

  // Calculate Y rotation (yaw)
  const yaw = Math.atan2(direction.x, direction.z);

  // Calculate X rotation (pitch)
  const horizontalDistance = Math.sqrt(
    direction.x * direction.x + direction.z * direction.z
  );
  const pitch = Math.atan2(-direction.y, horizontalDistance);

  return new Vector3(pitch, yaw, 0);
};
