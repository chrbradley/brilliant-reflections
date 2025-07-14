// ABOUTME: Type definitions for ray visualization system
// ABOUTME: Defines interfaces for rays, segments, and wall planes

import { Vector3, Color3 } from 'babylonjs';

/**
 * Represents a single ray with origin and direction
 */
export interface Ray {
  origin: Vector3;
  direction: Vector3;
  color: Color3;
}

/**
 * Represents a segment of a ray between two points
 */
export interface RaySegment {
  startPoint: Vector3;
  endPoint: Vector3;
  alpha: number; // Transparency value 0-1
}

/**
 * Represents a wall plane in the room
 */
export interface WallPlane {
  position: Vector3;
  normal: Vector3;
  isMirror: boolean;
}

/**
 * Configuration for ray generation
 */
export interface RayConfig {
  count: number;      // Number of rays (0-8)
  maxBounces: number; // Maximum reflections (1-5)
}

/**
 * Face colors for the cube (Rubik's style)
 */
export const FACE_COLORS = {
  front: new Color3(0.48, 1, 0),     // +Z green
  back: new Color3(0, 0.72, 1),      // -Z blue  
  right: new Color3(1, 0, 0.92),     // +X red
  left: new Color3(1, 0.85, 0),      // -X orange
} as const;