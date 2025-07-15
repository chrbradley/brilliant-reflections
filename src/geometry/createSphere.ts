// ABOUTME: Pure function to create an interactive sphere with smooth color gradient
// ABOUTME: Returns configured sphere mesh with seamless color transitions

import { MeshBuilder, Scene, Mesh, Vector3, StandardMaterial, Color3, DynamicTexture } from 'babylonjs';
import * as BABYLON from 'babylonjs';
import { markAsRenderable } from '../utils/applyLayerMask';

/**
 * Sphere dimensions
 */
const SPHERE_DIAMETER = 2;
const SPHERE_SEGMENTS = 32; // Higher segments for smooth appearance

/**
 * Creates a gradient texture for the sphere
 * Simple horizontal gradient that wraps seamlessly around the sphere
 */
const createGradientTexture = (scene: Scene): DynamicTexture => {
  const textureSize = 512;
  const texture = new DynamicTexture('sphereGradient', textureSize, scene);
  const context = texture.getContext();
  
  // Create a horizontal gradient with CMY colors
  const gradient = context.createLinearGradient(0, 0, textureSize, 0);
  
  // Add color stops for smooth CMY transition
  gradient.addColorStop(0, '#00FFFF');     // Cyan
  gradient.addColorStop(0.33, '#FF00FF');  // Magenta
  gradient.addColorStop(0.67, '#FFFF00');  // Yellow
  gradient.addColorStop(1, '#00FFFF');     // Back to Cyan for seamless wrap
  
  // Fill with gradient
  context.fillStyle = gradient;
  context.fillRect(0, 0, textureSize, textureSize);
  
  texture.update();
  return texture;
};

/**
 * Creates and configures the interactive sphere
 *
 * @param scene - The scene to add the sphere to
 * @param position - Initial position vector
 * @param rotation - Initial rotation vector
 * @returns Configured sphere mesh
 */
export const createSphere = (
  scene: Scene,
  position: Vector3,
  rotation: Vector3
): Mesh => {
  const sphere = MeshBuilder.CreateSphere(
    'colorSphere',
    {
      diameter: SPHERE_DIAMETER,
      segments: SPHERE_SEGMENTS,
    },
    scene
  );

  // Set position and rotation
  sphere.position.copyFrom(position);
  sphere.rotation.copyFrom(rotation);

  // Create material with gradient texture
  const material = new StandardMaterial('sphereMaterial', scene);
  material.diffuseTexture = createGradientTexture(scene);
  material.specularColor = new Color3(0.5, 0.5, 0.5);
  material.specularPower = 32;
  material.emissiveColor = new Color3(0.1, 0.1, 0.1); // Slight glow
  sphere.material = material;

  // Make sphere pickable for interaction
  sphere.isPickable = true;

  // Mark as renderable so it appears in both views
  markAsRenderable(sphere);

  return sphere;
};
