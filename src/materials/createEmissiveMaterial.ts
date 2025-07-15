// ABOUTME: Creates an emissive material for light-emitting surfaces
// ABOUTME: Used for the ceiling to provide even illumination

import { StandardMaterial, Color3, Scene } from 'babylonjs';

/**
 * Creates an emissive material
 * @param name - Material name
 * @param scene - The scene to add the material to
 * @param emissiveColor - The emissive color (defaults to bright white)
 * @returns The created emissive material
 */
export const createEmissiveMaterial = (
  name: string,
  scene: Scene,
  emissiveColor: Color3 = new Color3(1, 1, 1)
): StandardMaterial => {
  const material = new StandardMaterial(name, scene);
  
  // Set emissive properties for self-illumination
  material.emissiveColor = emissiveColor;
  material.diffuseColor = emissiveColor;
  
  // Disable lighting so it appears fully bright
  material.disableLighting = true;
  
  return material;
};