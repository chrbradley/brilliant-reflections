// ABOUTME: Pure function for tracing a ray through multiple reflections
// ABOUTME: Generates array of points showing ray path with bounces

import { Vector3 } from 'babylonjs';
import { Ray, WallPlane } from './types';
import { findNearestIntersection, calculateReflection } from './calculateIntersection';

/**
 * Traces a ray through the room, handling reflections
 * 
 * @param ray - Initial ray with origin and direction
 * @param wallPlanes - Array of wall planes to intersect
 * @param maxBounces - Maximum number of reflections (1-5)
 * @returns Array of points along the ray path
 */
export const traceRay = (
  ray: Ray,
  wallPlanes: WallPlane[],
  maxBounces: number
): Vector3[] => {
  const points: Vector3[] = [ray.origin.clone()];
  
  let currentOrigin = ray.origin.clone();
  let currentDirection = ray.direction.clone();
  
  // Clamp bounces to valid range
  const bounces = Math.max(1, Math.min(5, maxBounces));
  
  let bounceCount = 0;
  
  // Continue tracing until we hit a non-mirror wall or reach max bounces
  while (bounceCount <= bounces) {
    // Find nearest wall intersection
    const intersection = findNearestIntersection(
      currentOrigin,
      currentDirection,
      wallPlanes
    );
    
    if (!intersection.hit || !intersection.point || !intersection.normal) {
      // No intersection found (shouldn't happen in closed room)
      break;
    }
    
    // Add intersection point (slightly offset to avoid z-fighting)
    const offsetPoint = intersection.point.add(new Vector3(0, 0.01, 0));
    points.push(offsetPoint);
    
    // Stop if we hit a non-mirror wall or reached max bounces
    if (!intersection.isMirror || bounceCount >= bounces) {
      break;
    }
    
    // Calculate reflection for next bounce
    currentDirection = calculateReflection(currentDirection, intersection.normal);
    
    // Move origin slightly away from wall to avoid self-intersection
    currentOrigin = intersection.point.add(currentDirection.scale(0.001));
    
    bounceCount++;
  }
  
  return points;
};