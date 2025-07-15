// ABOUTME: Pure functions for creating wall plane definitions
// ABOUTME: Generates plane data for ray-wall intersection calculations

import { Vector3 } from 'babylonjs';
import { WallPlane } from './types';
import { ROOM_HALF } from '../constants';

/**
 * Creates wall planes for the room
 * North and East walls are mirrors
 *
 * @returns Array of wall planes with position, normal, and mirror flag
 */
export const createWallPlanes = (): WallPlane[] => {
  return [
    // North wall (+Z) - Mirror
    {
      position: new Vector3(0, 0, ROOM_HALF),
      normal: new Vector3(0, 0, -1),
      isMirror: true,
    },
    // South wall (-Z) - Not mirror
    {
      position: new Vector3(0, 0, -ROOM_HALF),
      normal: new Vector3(0, 0, 1),
      isMirror: false,
    },
    // East wall (+X) - Mirror
    {
      position: new Vector3(ROOM_HALF, 0, 0),
      normal: new Vector3(-1, 0, 0),
      isMirror: true,
    },
    // West wall (-X) - Mirror
    {
      position: new Vector3(-ROOM_HALF, 0, 0),
      normal: new Vector3(1, 0, 0),
      isMirror: true,
    },
  ];
};
