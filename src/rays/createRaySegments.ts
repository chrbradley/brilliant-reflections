// ABOUTME: Pure functions for creating visual ray segments
// ABOUTME: Converts ray path points into line mesh segments with fading

import { Vector3, Color3 } from 'babylonjs';
import { RaySegment } from './types';

/**
 * Calculates alpha value for a segment based on its position in the ray
 * 
 * @param segmentIndex - Index of the segment (0-based)
 * @param totalSegments - Total number of segments in the ray
 * @returns Alpha value between 0 and 1
 */
const calculateSegmentAlpha = (
  segmentIndex: number,
  totalSegments: number
): number => {
  // Avoid division by zero
  const denominator = Math.max(1, totalSegments - 1);
  const t = segmentIndex / denominator; // 0 to 1
  
  // Fade from 1.0 to ~0.667 (matches reference)
  return 1 - 0.333 * t;
};

/**
 * Creates ray segments from a path of points
 * 
 * @param points - Array of points along the ray path
 * @param color - Color for all segments
 * @returns Array of ray segments with alpha values
 */
export const createRaySegments = (
  points: Vector3[],
  color: Color3
): RaySegment[] => {
  if (points.length < 2) {
    return [];
  }
  
  const segments: RaySegment[] = [];
  const segmentCount = points.length - 1;
  
  for (let i = 0; i < segmentCount; i++) {
    segments.push({
      startPoint: points[i].clone(),
      endPoint: points[i + 1].clone(),
      alpha: calculateSegmentAlpha(i, segmentCount),
    });
  }
  
  return segments;
};