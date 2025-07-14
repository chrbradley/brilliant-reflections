// ABOUTME: Pure function to create camera rig system with visual cone indicator
// ABOUTME: Returns TransformNode for movement and cone mesh for visualization

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
 * Camera rig configuration
 */
export interface CameraRigConfig {
  rigNode: TransformNode;
  coneIndicator: Mesh;
}

/**
 * Default rig position
 */
const DEFAULT_POSITION: Position = {
  x: 0,
  y: 0,
  z: -5,
};

/**
 * Creates the cone indicator mesh
 */
const createConeIndicator = (scene: Scene): Mesh => {
  const cone = MeshBuilder.CreateCylinder(
    'cameraIndicator',
    {
      diameterTop: 0.5,
      diameterBottom: 2,
      height: 2,
      tessellation: 4, // Low poly for pyramid-like shape
    },
    scene
  );
  
  // Create material for the cone
  const coneMaterial = new StandardMaterial('coneMaterial', scene);
  coneMaterial.diffuseColor = new Color3(0, 0.71, 1); // Light blue
  coneMaterial.alpha = 0.5; // Semi-transparent
  cone.material = coneMaterial;
  
  // Enable edge rendering
  cone.enableEdgesRendering();
  cone.edgesWidth = 4.0;
  cone.edgesColor = new Color4(0, 0.72, 1, 1); // Slightly brighter blue edges
  
  // Make cone pickable for interaction
  cone.isPickable = true;
  
  // Rotate cone to point forward (like camera frustum)
  cone.rotation.x = Math.PI / 2; // Tip forward
  cone.rotation.z = Math.PI; // Align edges properly
  
  return cone;
};

/**
 * Creates the transform node for the rig
 */
const createRigNode = (scene: Scene, position: Position): TransformNode => {
  const rigNode = new TransformNode('cameraRig', scene);
  
  rigNode.position.x = position.x;
  rigNode.position.y = position.y;
  rigNode.position.z = position.z;
  
  return rigNode;
};

/**
 * Creates a camera rig with visual indicator
 * 
 * @param scene - The scene to add the rig to
 * @param position - Optional initial position
 * @returns Camera rig configuration
 */
export const createCameraRig = (
  scene: Scene,
  position: Position = DEFAULT_POSITION
): CameraRigConfig => {
  // Create the rig node
  const rigNode = createRigNode(scene, position);
  
  // Create the cone indicator
  const coneIndicator = createConeIndicator(scene);
  
  // Parent cone to rig
  coneIndicator.parent = rigNode;
  
  return {
    rigNode,
    coneIndicator,
  };
};