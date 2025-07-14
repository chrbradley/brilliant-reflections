// ABOUTME: Pure functions for creating room geometry with walls, floor, and ceiling
// ABOUTME: Returns immutable mesh configurations for the room structure

import { MeshBuilder, Scene, Mesh } from 'babylonjs';
import { ROOM_SIZE, WALL_THICKNESS, ROOM_HALF, WALL_NAMES } from '../constants';
import { createMatteMaterial } from '../materials/createMatteMaterial';

/**
 * Position configuration
 */
interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * Rotation configuration
 */
interface Rotation {
  x: number;
  y: number;
  z: number;
}

/**
 * Room configuration with all meshes
 */
export interface RoomConfig {
  floor: Mesh;
  ceiling: Mesh;
  walls: {
    north: Mesh;
    south: Mesh;
    east: Mesh;
    west: Mesh;
  };
}

/**
 * Wall height (same as room size for cubic room)
 */
const WALL_HEIGHT = ROOM_SIZE;

/**
 * Creates the floor mesh
 */
export const createFloor = (scene: Scene): Mesh => {
  const floor = MeshBuilder.CreateGround(
    WALL_NAMES.FLOOR,
    { width: ROOM_SIZE, height: ROOM_SIZE },
    scene
  );
  
  floor.position.y = 0;
  floor.material = createMatteMaterial('floorMaterial', scene, { r: 0.3, g: 0.3, b: 0.3 });
  
  return floor;
};

/**
 * Creates the ceiling mesh
 */
export const createCeiling = (scene: Scene): Mesh => {
  const ceiling = MeshBuilder.CreateGround(
    WALL_NAMES.CEILING,
    { width: ROOM_SIZE, height: ROOM_SIZE },
    scene
  );
  
  ceiling.position.y = WALL_HEIGHT;
  ceiling.material = createMatteMaterial('ceilingMaterial', scene, { r: 0.7, g: 0.7, b: 0.7 });
  
  // Flip ceiling to face downward
  ceiling.rotation.x = Math.PI;
  
  return ceiling;
};

/**
 * Creates a wall mesh with specified position and rotation
 */
export const createWall = (
  position: Position,
  rotation: Rotation,
  name: string,
  scene: Scene
): Mesh => {
  const wall = MeshBuilder.CreateBox(
    name,
    {
      width: ROOM_SIZE,
      height: WALL_HEIGHT,
      depth: WALL_THICKNESS,
    },
    scene
  );
  
  // Apply position
  wall.position.x = position.x;
  wall.position.y = position.y;
  wall.position.z = position.z;
  
  // Apply rotation
  wall.rotation.x = rotation.x;
  wall.rotation.y = rotation.y;
  wall.rotation.z = rotation.z;
  
  // Apply material
  wall.material = createMatteMaterial(`${name}Material`, scene, { r: 0.6, g: 0.6, b: 0.6 });
  
  return wall;
};

/**
 * Creates wall position for center of wall at room edge
 */
const createWallPosition = (x: number, z: number): Position => ({
  x,
  y: WALL_HEIGHT / 2,
  z,
});

/**
 * Creates all walls for the room
 */
const createWalls = (scene: Scene): RoomConfig['walls'] => {
  const walls = {
    north: createWall(
      createWallPosition(0, ROOM_HALF),
      { x: 0, y: 0, z: 0 },
      WALL_NAMES.NORTH,
      scene
    ),
    south: createWall(
      createWallPosition(0, -ROOM_HALF),
      { x: 0, y: Math.PI, z: 0 },
      WALL_NAMES.SOUTH,
      scene
    ),
    east: createWall(
      createWallPosition(ROOM_HALF, 0),
      { x: 0, y: Math.PI / 2, z: 0 },
      WALL_NAMES.EAST,
      scene
    ),
    west: createWall(
      createWallPosition(-ROOM_HALF, 0),
      { x: 0, y: -Math.PI / 2, z: 0 },
      WALL_NAMES.WEST,
      scene
    ),
  };
  
  return walls;
};

/**
 * Creates a complete room with floor, ceiling, and walls
 * 
 * @param scene - The scene to add the room to
 * @returns Room configuration with all meshes
 */
export const createRoom = (scene: Scene): RoomConfig => {
  const floor = createFloor(scene);
  const ceiling = createCeiling(scene);
  const walls = createWalls(scene);
  
  return {
    floor,
    ceiling,
    walls,
  };
};