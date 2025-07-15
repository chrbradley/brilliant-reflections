// ABOUTME: Pure function to create the interactive cube with Rubik's-style face colors
// ABOUTME: Returns configured cube mesh for manipulation and ray visualization

import { MeshBuilder, Scene, Mesh, Color4, Vector3 } from 'babylonjs';
import { markAsRenderable } from '../utils/applyLayerMask';

/**
 * Rubik's-style face colors
 * Order matches Babylon.js face ordering for CreateBox
 */
export const CUBE_FACE_COLORS = {
  FRONT: new Color4(0.0, 0.8, 0.0, 1), // +Z green
  BACK: new Color4(0.0, 0.2, 1.0, 1), // -Z blue
  RIGHT: new Color4(1.0, 0.0, 0.0, 1), // +X red
  LEFT: new Color4(1.0, 0.55, 0.0, 1), // -X orange
  TOP: new Color4(1.0, 1.0, 1.0, 1), // +Y white
  BOTTOM: new Color4(1.0, 1.0, 0.0, 1), // -Y yellow
} as const;

/**
 * Cube dimensions
 */
const CUBE_SIZE = 2;

/**
 * Creates face color array in Babylon.js order
 */
const createFaceColors = (): Color4[] => {
  // Babylon.js face order: front, back, right, left, top, bottom
  return [
    CUBE_FACE_COLORS.FRONT,
    CUBE_FACE_COLORS.BACK,
    CUBE_FACE_COLORS.RIGHT,
    CUBE_FACE_COLORS.LEFT,
    CUBE_FACE_COLORS.TOP,
    CUBE_FACE_COLORS.BOTTOM,
  ];
};

/**
 * Creates and configures the interactive cube
 *
 * @param scene - The scene to add the cube to
 * @param position - Initial position vector
 * @param rotation - Initial rotation vector
 * @returns Configured cube mesh
 */
export const createCube = (
  scene: Scene,
  position: Vector3,
  rotation: Vector3
): Mesh => {
  const cube = MeshBuilder.CreateBox(
    'colorCube',
    {
      size: CUBE_SIZE,
      faceColors: createFaceColors(),
    },
    scene
  );

  // Set position and rotation
  cube.position.copyFrom(position);
  cube.rotation.copyFrom(rotation);

  // Make cube pickable for interaction
  cube.isPickable = true;

  // Enable edge rendering for better visibility
  cube.enableEdgesRendering();
  cube.edgesWidth = 4.0;
  cube.edgesColor = new Color4(0, 0, 0, 1); // Black edges

  // Mark as renderable so it appears in both views
  markAsRenderable(cube);

  return cube;
};
