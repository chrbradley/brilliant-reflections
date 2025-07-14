// ABOUTME: Pure function to create camera rig system with nested pivot structure  
// ABOUTME: Returns rig (movement), pivot (rotation), and cone (visualization) following reference

import { TransformNode, MeshBuilder, Scene, Mesh, Color4, StandardMaterial, Color3 } from 'babylonjs';

/**
 * Position configuration
 */
interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * Camera rig configuration with nested hierarchy
 */
export interface CameraRigConfig {
  rigNode: TransformNode;    // Handles position (no rotation)
  pivotNode: TransformNode;  // Handles Y-axis rotation, child of rig
  coneIndicator: Mesh;       // Visual cone, child of pivot
}

/**
 * Default rig position (matches reference)
 */
const DEFAULT_POSITION: Position = {
  x: 0,
  y: 0,
  z: -3,
};

/**
 * Creates the cone indicator mesh (matches reference exactly)
 */
const createConeIndicator = (scene: Scene): Mesh => {
  const helper = MeshBuilder.CreateCylinder(
    'camera',
    {
      diameterTop: 0.5,
      diameterBottom: 2,
      height: 2,
      tessellation: 4,
    },
    scene
  );
  
  // Create material matching reference
  const cMat = new StandardMaterial('cMat', scene);
  cMat.diffuseColor.set(0, 0.71, 1);
  cMat.alpha = 0.5;
  helper.material = cMat;
  
  // Enable edge rendering
  helper.enableEdgesRendering();
  helper.edgesWidth = 4.0;
  helper.edgesColor = new Color4(0, 0.72, 1, 1);
  
  // Make cone pickable for interaction
  helper.isPickable = true;
  
  return helper;
};

/**
 * Creates the camera rig transform node (handles position, no rotation)
 */
const createRigNode = (scene: Scene, position: Position): TransformNode => {
  const camRig = new TransformNode('camRig', scene);
  
  // Set position
  camRig.position.set(position.x, position.y, position.z);
  
  // Aim the cone toward the box by rotating the rig (matches reference)
  camRig.rotation.x = Math.PI / 2; // tip forward (+Z)
  camRig.rotation.z = Math.PI; // make edges parallel to scene
  
  return camRig;
};

/**
 * Creates the camera pivot transform node (handles Y-axis rotation)
 */
const createPivotNode = (scene: Scene, rigNode: TransformNode): TransformNode => {
  const camPivot = new TransformNode('camPivot', scene);
  camPivot.parent = rigNode;
  
  // Initial rotation to make edges parallel to scene (matches reference)
  camPivot.rotation.y = Math.PI / 4;
  
  return camPivot;
};

/**
 * Creates a camera rig with nested pivot structure (matches reference exactly)
 * 
 * @param scene - The scene to add the rig to
 * @param position - Optional initial position
 * @returns Camera rig configuration with nested hierarchy
 */
export const createCameraRig = (
  scene: Scene,
  position: Position = DEFAULT_POSITION
): CameraRigConfig => {
  // Create the rig node (handles position movement)
  const rigNode = createRigNode(scene, position);
  
  // Create the pivot node (handles Y-axis rotation, child of rig)
  const pivotNode = createPivotNode(scene, rigNode);
  
  // Create the cone indicator (visual representation, child of pivot)
  const coneIndicator = createConeIndicator(scene);
  coneIndicator.parent = pivotNode;
  
  return {
    rigNode,
    pivotNode,
    coneIndicator,
  };
};