// ABOUTME: Pure functions for position transformations with grid snapping and clamping
// ABOUTME: Provides constraints for object movement in the scene

import { Vector3 } from 'babylonjs';

/**
 * Snaps a value to the nearest grid point
 * 
 * @param value - The value to snap
 * @param gridSize - The grid interval size
 * @returns Snapped value
 */
export const snapToGrid = (value: number, gridSize: number): number => {
  if (gridSize === 0) {
    return value;
  }
  
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Clamps a position vector within specified limits
 * Only clamps X and Z axes, Y is unchanged
 * 
 * @param position - The position to clamp
 * @param limit - Maximum absolute value for X and Z
 * @returns New clamped position vector
 */
export const clampPosition = (position: Vector3, limit: number): Vector3 => {
  return new Vector3(
    Math.max(-limit, Math.min(limit, position.x)),
    position.y, // Y axis not clamped
    Math.max(-limit, Math.min(limit, position.z))
  );
};

/**
 * Applies position constraints by composing snap and clamp operations
 * 
 * @param position - The position to constrain
 * @param gridSize - Grid snap interval (default 1 unit)
 * @param limit - Position limit for X/Z axes (default ±8 units)
 * @returns New constrained position
 */
export const applyPositionConstraints = (
  position: Vector3,
  gridSize: number = 1,
  limit: number = 8
): Vector3 => {
  // First snap to grid
  const snapped = new Vector3(
    snapToGrid(position.x, gridSize),
    position.y, // Y not snapped
    snapToGrid(position.z, gridSize)
  );
  
  // Then clamp to limits
  return clampPosition(snapped, limit);
};