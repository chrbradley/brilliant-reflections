// ABOUTME: Pure functions for rotation transformations with angle constraints
// ABOUTME: Handles Y-axis rotation snapping and angle normalization

import { Vector3 } from 'babylonjs';

/**
 * Converts degrees to radians
 */
export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Converts radians to degrees
 */
export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

/**
 * Snaps angle to specified degree increments
 *
 * @param angleRadians - Angle in radians to snap
 * @param snapDegrees - Snap increment in degrees (default 15)
 * @returns Snapped angle in radians
 */
export const snapToAngle = (
  angleRadians: number,
  snapDegrees: number = 15
): number => {
  if (snapDegrees === 0) return angleRadians;

  const degrees = radiansToDegrees(angleRadians);
  const snappedDegrees = Math.round(degrees / snapDegrees) * snapDegrees;
  return degreesToRadians(snappedDegrees);
};

/**
 * Normalizes angle to [-π, π) range
 *
 * @param angleRadians - Angle in radians to normalize
 * @returns Normalized angle in [-π, π) range
 */
export const normalizeAngle = (angleRadians: number): number => {
  let normalized = angleRadians;

  // Handle the case where input is exactly π (should stay π, not become -π)
  if (Math.abs(normalized - Math.PI) < 1e-15) {
    return Math.PI;
  }

  // Normalize to [-π, π) range
  while (normalized > Math.PI) {
    normalized -= 2 * Math.PI;
  }
  while (normalized <= -Math.PI) {
    normalized += 2 * Math.PI;
  }

  return normalized;
};

/**
 * Clamps rotation to Y-axis only (preserves Y rotation, zeros X and Z)
 *
 * @param rotation - Vector3 rotation to clamp
 * @returns New Vector3 with only Y rotation preserved
 */
export const clampToYAxis = (rotation: Vector3): Vector3 => {
  return new Vector3(0, rotation.y, 0);
};

/**
 * Applies rotation constraints: Y-axis only, snapped, and normalized
 *
 * @param rotation - Current rotation Vector3
 * @param snapDegrees - Snap increment in degrees (default 15)
 * @returns New Vector3 with constraints applied
 */
export const applyRotationConstraints = (
  rotation: Vector3,
  snapDegrees: number = 15
): Vector3 => {
  // Clamp to Y-axis only
  const yOnlyRotation = clampToYAxis(rotation);

  // Snap Y rotation to grid
  const snappedY = snapToAngle(yOnlyRotation.y, snapDegrees);

  // Normalize Y rotation to [-π, π)
  const normalizedY = normalizeAngle(snappedY);

  return new Vector3(0, normalizedY, 0);
};
