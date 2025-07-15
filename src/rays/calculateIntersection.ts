// ABOUTME: Pure functions for calculating ray-plane intersections
// ABOUTME: Handles intersection detection and reflection calculations

import { Vector3, Ray as BabylonRay, Plane } from 'babylonjs';
import { WallPlane } from './types';

/**
 * Result of a ray-plane intersection test
 */
export interface IntersectionResult {
  hit: boolean;
  distance: number;
  point: Vector3 | null;
  normal: Vector3 | null;
  isMirror: boolean;
}

/**
 * Calculates the intersection of a ray with a wall plane
 *
 * @param origin - Ray origin point
 * @param direction - Ray direction (normalized)
 * @param wallPlane - Wall plane to test against
 * @returns Intersection result with hit info
 */
export const calculateIntersection = (
  origin: Vector3,
  direction: Vector3,
  wallPlane: WallPlane
): IntersectionResult => {
  // Create Babylon.js ray and plane objects
  const ray = new BabylonRay(origin, direction, 1000);
  const plane = Plane.FromPositionAndNormal(
    wallPlane.position,
    wallPlane.normal
  );

  // Calculate intersection distance
  const distance = ray.intersectsPlane(plane);

  if (distance === null || distance < 0.001) {
    // No intersection or too close (avoid self-intersection)
    return {
      hit: false,
      distance: Infinity,
      point: null,
      normal: null,
      isMirror: false,
    };
  }

  // Calculate intersection point
  const point = ray.origin.add(ray.direction.scale(distance));

  return {
    hit: true,
    distance,
    point,
    normal: wallPlane.normal.clone(),
    isMirror: wallPlane.isMirror,
  };
};

/**
 * Finds the nearest wall intersection from a set of wall planes
 *
 * @param origin - Ray origin point
 * @param direction - Ray direction (normalized)
 * @param wallPlanes - Array of wall planes to test
 * @returns Nearest intersection result
 */
export const findNearestIntersection = (
  origin: Vector3,
  direction: Vector3,
  wallPlanes: WallPlane[]
): IntersectionResult => {
  let nearest: IntersectionResult = {
    hit: false,
    distance: Infinity,
    point: null,
    normal: null,
    isMirror: false,
  };

  for (const wallPlane of wallPlanes) {
    const result = calculateIntersection(origin, direction, wallPlane);

    if (result.hit && result.distance < nearest.distance) {
      nearest = result;
    }
  }

  return nearest;
};

/**
 * Calculates reflection direction using the law of reflection
 *
 * @param incomingDirection - Incoming ray direction (normalized)
 * @param surfaceNormal - Surface normal at hit point (normalized)
 * @returns Reflected direction vector (normalized)
 */
export const calculateReflection = (
  incomingDirection: Vector3,
  surfaceNormal: Vector3
): Vector3 => {
  // Use Babylon's built-in reflection calculation
  return Vector3.Reflect(incomingDirection, surfaceNormal).normalize();
};
