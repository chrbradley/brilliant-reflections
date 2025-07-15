// ABOUTME: Pure functions for generating rays from a cube position
// ABOUTME: Creates rays in circular pattern with colors based on exit face

import { Vector3, Color3, Matrix } from 'babylonjs';
import { Ray, FACE_COLORS } from './types';

/**
 * Determines which face a local direction vector exits through
 */
const getFaceColor = (localDir: Vector3): Color3 => {
  if (Math.abs(localDir.x) >= Math.abs(localDir.z)) {
    return localDir.x >= 0 ? FACE_COLORS.right : FACE_COLORS.left;
  } else {
    return localDir.z >= 0 ? FACE_COLORS.front : FACE_COLORS.back;
  }
};

/**
 * Generates a single ray direction in local space
 */
const generateLocalDirection = (index: number, count: number): Vector3 => {
  const angle = (index / count) * Math.PI * 2; // 0 to 2π
  return new Vector3(Math.cos(angle), 0, Math.sin(angle));
};

/**
 * Transforms local direction to world space using rotation matrix
 */
const transformToWorldDirection = (
  localDir: Vector3,
  worldMatrix: Matrix
): Vector3 => {
  return Vector3.TransformNormal(localDir, worldMatrix).normalize();
};

/**
 * Generates rays emanating from a position with given rotation
 *
 * @param origin - Starting position for all rays
 * @param worldMatrix - World transformation matrix (includes rotation)
 * @param count - Number of rays to generate (0-8)
 * @returns Array of rays with origin, direction, and color
 */
export const generateRays = (
  origin: Vector3,
  worldMatrix: Matrix,
  count: number
): Ray[] => {
  // Clamp count to valid range
  const rayCount = Math.max(0, Math.min(8, count));

  const rays: Ray[] = [];

  // Offset origin slightly above ground to avoid z-fighting
  const offsetOrigin = origin.add(new Vector3(0, 0.01, 0));

  for (let i = 0; i < rayCount; i++) {
    // Generate direction in local space
    const localDir = generateLocalDirection(i, rayCount);

    // Get color based on exit face
    const color = getFaceColor(localDir);

    // Transform to world space
    const worldDir = transformToWorldDirection(localDir, worldMatrix);

    rays.push({
      origin: offsetOrigin.clone(),
      direction: worldDir,
      color: color.clone(),
    });
  }

  return rays;
};
