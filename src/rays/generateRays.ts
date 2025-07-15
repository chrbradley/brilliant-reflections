// ABOUTME: Pure functions for generating rays from a cube position
// ABOUTME: Creates rays in circular pattern with colors based on exit face

import { Vector3, Color3, Matrix } from 'babylonjs';
import { Ray, FACE_COLORS } from './types';

/**
 * Gets color for a ray based on its index
 * Maps directly from ray position to gradient color
 */
const getRayGradientColor = (rayIndex: number, totalRays: number): Color3 => {
  // Calculate position in gradient (0 to 1)
  let t = rayIndex / totalRays;
  
  // Interpolate through CMY colors matching the sphere gradient
  let r, g, b;
  
  if (t < 0.33) {
    // Cyan to Magenta
    const localT = t * 3;
    r = localT;
    g = 1 - localT;
    b = 1;
  } else if (t < 0.67) {
    // Magenta to Yellow
    const localT = (t - 0.33) * 3;
    r = 1;
    g = localT;
    b = 1 - localT;
  } else {
    // Yellow to Cyan
    const localT = (t - 0.67) * 3;
    r = 1 - localT;
    g = 1;
    b = localT;
  }
  
  return new Color3(r, g, b);
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
 * Generates fan rays around a primary direction
 * @param primaryDir - The primary ray direction
 * @param fanCount - Number of fan rays to generate
 * @param fanAngle - Total angle of the fan in radians (default: 90 degrees)
 * @returns Array of fan ray directions
 */
const generateFanDirections = (
  primaryDir: Vector3,
  fanCount: number,
  fanAngle: number = Math.PI / 2
): Vector3[] => {
  if (fanCount === 1) {
    return [primaryDir];
  }

  const directions: Vector3[] = [];
  
  // Calculate the rotation axis (perpendicular to primary direction in XZ plane)
  // Since rays are in XZ plane (Y=0), we rotate around Y axis
  const rotationAxis = Vector3.Up();
  
  // Calculate angle between each fan ray
  const angleStep = fanAngle / (fanCount - 1);
  const startAngle = -fanAngle / 2;
  
  for (let i = 0; i < fanCount; i++) {
    const angle = startAngle + (i * angleStep);
    
    // Create rotation matrix around Y axis
    const rotationMatrix = Matrix.RotationAxis(rotationAxis, angle);
    
    // Apply rotation to primary direction
    const fanDir = Vector3.TransformNormal(primaryDir, rotationMatrix);
    directions.push(fanDir.normalize());
  }
  
  return directions;
};

/**
 * Generates rays emanating from a position with given rotation
 *
 * @param origin - Center position of the sphere
 * @param worldMatrix - World transformation matrix (includes rotation)
 * @param count - Number of ray origins to generate (0-8)
 * @param fanRays - Number of fan rays per origin (1-6)
 * @param sphereRadius - Radius of the sphere (default: 1 for diameter 2)
 * @returns Array of rays with origin, direction, and color
 */
export const generateRays = (
  origin: Vector3,
  worldMatrix: Matrix,
  count: number,
  fanRays: number = 1,
  sphereRadius: number = 1
): Ray[] => {
  // Clamp count to valid range
  const rayCount = Math.max(0, Math.min(8, count));
  const fanCount = Math.max(1, Math.min(6, fanRays));

  const rays: Ray[] = [];

  for (let i = 0; i < rayCount; i++) {
    // Generate primary direction in local space
    const localDir = generateLocalDirection(i, rayCount);

    // Transform to world space
    const worldDir = transformToWorldDirection(localDir, worldMatrix);

    // Calculate the actual surface point on the sphere
    // The ray should start from where the direction vector intersects the sphere surface
    const surfacePoint = origin.add(worldDir.scale(sphereRadius));
    
    // Get color based on the ray index
    const color = getRayGradientColor(i, rayCount);
    
    // Offset slightly outward to avoid z-fighting with sphere surface
    const rayOrigin = surfacePoint.add(worldDir.scale(0.01));

    // Generate fan rays around this primary direction
    const fanDirections = generateFanDirections(worldDir, fanCount);
    
    // Add all fan rays with the same surface origin and color
    for (const fanDir of fanDirections) {
      rays.push({
        origin: rayOrigin.clone(),
        direction: fanDir,
        color: color.clone(),
      });
    }
  }

  return rays;
};
