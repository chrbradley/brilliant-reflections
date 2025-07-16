// ABOUTME: Creates a simple box indicator to show camera position and orientation
// ABOUTME: The elongated dimension points in the camera's viewing direction

import {
  Scene,
  Mesh,
  StandardMaterial,
  Color3,
  Vector3,
  VertexData,
} from 'babylonjs';
import { markAsEditorOnly } from '../utils/applyLayerMask';

/**
 * Camera indicator configuration
 */
export interface CameraIndicatorConfig {
  indicator: Mesh;
}

/**
 * Creates a camera-shaped frustum indicator
 * Front face (lens) is wider, back face (eyepiece) is narrower
 */
const createIndicatorBox = (scene: Scene): Mesh => {
  // Create custom camera frustum geometry
  const frontScale = 1.25; // Front face (lens) scale
  const backScale = 0.75;  // Back face (eyepiece) scale
  const depth = 2; // Total depth
  
  // Define the 8 vertices of the frustum centered at origin
  const halfDepth = depth / 2;
  const positions = [
    // Back face (eyepiece) - smaller
    -backScale/2, -backScale/2, -halfDepth,    // 0: back bottom left
     backScale/2, -backScale/2, -halfDepth,    // 1: back bottom right
     backScale/2,  backScale/2, -halfDepth,    // 2: back top right
    -backScale/2,  backScale/2, -halfDepth,    // 3: back top left
    
    // Front face (lens) - larger
    -frontScale/2, -frontScale/2, halfDepth,  // 4: front bottom left
     frontScale/2, -frontScale/2, halfDepth,  // 5: front bottom right
     frontScale/2,  frontScale/2, halfDepth,  // 6: front top right
    -frontScale/2,  frontScale/2, halfDepth,  // 7: front top left
  ];
  
  // Define the 12 triangular faces (2 triangles per face, 6 faces)
  const indices = [
    // Back face
    0, 1, 2,   0, 2, 3,
    // Front face 
    4, 7, 6,   4, 6, 5,
    // Bottom face
    0, 4, 5,   0, 5, 1,
    // Top face
    2, 6, 7,   2, 7, 3,
    // Left face
    0, 3, 7,   0, 7, 4,
    // Right face
    1, 5, 6,   1, 6, 2,
  ];
  
  // Create normals for proper lighting
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  
  // Create the mesh
  const camera = new Mesh('cameraIndicator', scene);
  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.applyToMesh(camera);

  // Create a semi-transparent blue material
  const material = new StandardMaterial('cameraIndicatorMat', scene);
  material.diffuseColor = new Color3(0, 0.7, 1);
  material.alpha = 0.7;
  camera.material = material;

  // Enable edge rendering for better visibility
  camera.enableEdgesRendering();
  camera.edgesWidth = 4.0;
  camera.edgesColor = new Color3(0, 0.5, 1).toColor4();

  // Make it pickable for gizmo interaction
  camera.isPickable = true;

  // Mark as editor-only so it doesn't appear in render view
  markAsEditorOnly(camera);

  return camera;
};

/**
 * Creates a camera indicator that directly represents camera position and orientation
 *
 * @param scene - The scene to add the indicator to
 * @param position - Initial position vector
 * @param rotation - Initial rotation vector
 * @param lookAtTarget - Target position to look at
 * @returns Camera indicator configuration
 */
export const createCameraIndicator = (
  scene: Scene,
  position: Vector3,
  rotation: Vector3,
  lookAtTarget: Vector3
): CameraIndicatorConfig => {
  const indicator = createIndicatorBox(scene);

  // Set initial position
  indicator.position.copyFrom(position);

  // Orient to look at target
  indicator.lookAt(lookAtTarget);

  // Apply any additional rotation if needed
  indicator.rotation.addInPlace(rotation);

  return {
    indicator,
  };
};
