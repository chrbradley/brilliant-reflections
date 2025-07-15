// ABOUTME: Pure functions for creating room geometry with walls, floor, and ceiling
// ABOUTME: Returns immutable mesh configurations for the room structure

import {
  MeshBuilder,
  Scene,
  Mesh,
  Color3,
  StandardMaterial,
  Texture,
  DynamicTexture,
} from 'babylonjs';
import { ROOM_SIZE, WALL_THICKNESS, ROOM_HALF, WALL_NAMES } from '../constants';
import { createMatteMaterial } from '../materials/createMatteMaterial';
import { createEmissiveMaterial } from '../materials/createEmissiveMaterial';
import { markAsRenderable } from '../utils/applyLayerMask';

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
 * Creates a grid texture for the floor
 */
const createGridTexture = (scene: Scene): Texture | null => {
  try {
    const textureSize = 512;
    const gridTexture = new DynamicTexture(
      'gridTexture',
      textureSize,
      scene,
      false
    );
    const context = gridTexture.getContext();

    // Background color
    context.fillStyle = '#333333'; // Dark grey background
    context.fillRect(0, 0, textureSize, textureSize);

    // Grid lines
    const cellSize = textureSize / 20; // 20 units across

    // Minor grid lines
    context.strokeStyle = '#B3B3B3'; // Light grey
    context.lineWidth = 0.5;
    context.globalAlpha = 0.25; // 25% opacity for minor lines

    for (let i = 0; i <= 20; i++) {
      const pos = i * cellSize;
      // Vertical lines
      context.beginPath();
      context.moveTo(pos, 0);
      context.lineTo(pos, textureSize);
      context.stroke();
      // Horizontal lines
      context.beginPath();
      context.moveTo(0, pos);
      context.lineTo(textureSize, pos);
      context.stroke();
    }

    // Major grid lines (every 5 units)
    context.strokeStyle = '#B3B3B3';
    context.lineWidth = 2;
    context.globalAlpha = 1.0;

    for (let i = 0; i <= 20; i += 5) {
      const pos = i * cellSize;
      // Vertical lines
      context.beginPath();
      context.moveTo(pos, 0);
      context.lineTo(pos, textureSize);
      context.stroke();
      // Horizontal lines
      context.beginPath();
      context.moveTo(0, pos);
      context.lineTo(textureSize, pos);
      context.stroke();
    }

    gridTexture.update();
    return gridTexture;
  } catch (e) {
    // In test environment, dynamic texture creation may fail
    return null;
  }
};

/**
 * Creates the floor mesh with grid pattern
 */
export const createFloor = (scene: Scene): Mesh => {
  const floor = MeshBuilder.CreateGround(
    WALL_NAMES.FLOOR,
    { width: ROOM_SIZE, height: ROOM_SIZE },
    scene
  );

  floor.position.y = 0;

  // Create material with grid texture
  const floorMat = new StandardMaterial('floorMaterial', scene);

  // Try to create grid texture, fall back to solid color if it fails
  const gridTexture = createGridTexture(scene);
  if (gridTexture) {
    floorMat.diffuseTexture = gridTexture;
    floorMat.diffuseTexture.uScale = 1;
    floorMat.diffuseTexture.vScale = 1;
    floorMat.specularColor = new Color3(0, 0, 0); // No specular
    floorMat.emissiveColor = new Color3(0.1, 0.1, 0.1); // Slight emissive for visibility
  } else {
    // Fallback for test environment
    floorMat.diffuseColor = new Color3(0.2, 0.2, 0.2); // Dark grey
    floorMat.specularColor = new Color3(0, 0, 0);
  }

  floorMat.backFaceCulling = false;

  floor.material = floorMat;
  floor.material.backFaceCulling = false; // Ensure visible from both sides
  floor.isPickable = false; // Room geometry should not be selectable

  // Mark as renderable so it appears in both views
  markAsRenderable(floor);

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
  ceiling.material = createEmissiveMaterial(
    'ceilingMaterial',
    scene,
    new Color3(0.9, 0.9, 0.9) // Slightly dimmed white for comfortable viewing
  );
  ceiling.material.backFaceCulling = false; // Ensure visible from both sides
  ceiling.isPickable = false; // Room geometry should not be selectable

  // Flip ceiling to face downward
  ceiling.rotation.x = Math.PI;

  // Mark as renderable so it appears in both views
  markAsRenderable(ceiling);

  return ceiling;
};

/**
 * Creates a wall mesh with specified position and rotation
 */
export const createWall = (
  position: Position,
  rotation: Rotation,
  name: string,
  scene: Scene,
  isReflective: boolean = false
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

  // Apply material - different color for reflective walls
  if (isReflective) {
    // Light blue-grey for reflective walls (will be replaced with mirror material in render scene)
    wall.material = createMatteMaterial(`${name}Material`, scene, {
      r: 0.55,
      g: 0.55,
      b: 0.75,
    }, 0.01); // 99% transparent (1% opacity)
  } else {
    // Standard grey for non-reflective walls
    wall.material = createMatteMaterial(`${name}Material`, scene, {
      r: 0.65,
      g: 0.65,
      b: 0.65,
    }, 0.01); // 99% transparent (1% opacity)
  }
  wall.isPickable = false; // Room geometry should not be selectable
  
  // Ensure walls are visible from inside (disable backface culling)
  wall.material.backFaceCulling = false;

  // Mark as renderable so it appears in both views
  markAsRenderable(wall);

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
      scene,
      true // reflective
    ),
    south: createWall(
      createWallPosition(0, -ROOM_HALF),
      { x: 0, y: Math.PI, z: 0 },
      WALL_NAMES.SOUTH,
      scene,
      false // non-reflective
    ),
    east: createWall(
      createWallPosition(ROOM_HALF, 0),
      { x: 0, y: Math.PI / 2, z: 0 },
      WALL_NAMES.EAST,
      scene,
      true // reflective
    ),
    west: createWall(
      createWallPosition(-ROOM_HALF, 0),
      { x: 0, y: -Math.PI / 2, z: 0 },
      WALL_NAMES.WEST,
      scene,
      true // reflective
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
