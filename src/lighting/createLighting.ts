// ABOUTME: Pure functions to create lighting for scenes
// ABOUTME: Provides ambient and directional lighting for visibility

import { HemisphericLight, Vector3, Scene, Color3 } from 'babylonjs';

/**
 * Creates ambient lighting for a scene
 * 
 * @param name - The name for the light
 * @param scene - The scene to add the light to
 * @returns Configured hemispheric light
 */
export const createAmbientLight = (name: string, scene: Scene): HemisphericLight => {
  // Create light pointing up for ambient illumination
  const light = new HemisphericLight(name, new Vector3(0, 1, 0), scene);
  
  // Set intensity for good visibility
  light.intensity = 0.7;
  
  // Set ground color to be slightly darker than sky
  light.groundColor = new Color3(0.2, 0.2, 0.2);
  
  return light;
};