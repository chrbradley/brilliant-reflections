// ABOUTME: Shared constants for room dimensions and other global values
// ABOUTME: Ensures consistency across the application

/**
 * Room dimensions
 */
export const ROOM_SIZE = 20;
export const WALL_THICKNESS = 0.2;
export const ROOM_HALF = 10;

/**
 * Wall names for identification
 */
export const WALL_NAMES = {
  NORTH: 'northWall',
  SOUTH: 'southWall',
  EAST: 'eastWall',
  WEST: 'westWall',
  FLOOR: 'floor',
  CEILING: 'ceiling',
} as const;

/**
 * Mirror wall names (subset of walls that have mirrors)
 */
export const MIRROR_WALLS = [
  WALL_NAMES.NORTH,
  WALL_NAMES.EAST,
  WALL_NAMES.WEST,
] as const;