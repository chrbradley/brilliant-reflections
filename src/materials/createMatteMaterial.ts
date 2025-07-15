// ABOUTME: Pure function to create matte (non-reflective) materials
// ABOUTME: Returns standard material with low specular properties

import { StandardMaterial, Color3, Scene } from 'babylonjs';

/**
 * Color configuration for materials
 */
export interface MaterialColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Default matte gray color
 */
const DEFAULT_MATTE_COLOR: MaterialColor = {
  r: 0.6,
  g: 0.6,
  b: 0.6,
};

/**
 * Creates a Color3 from color configuration
 */
const createColor3 = (color: MaterialColor): Color3 => {
  return new Color3(color.r, color.g, color.b);
};

/**
 * Configures material for matte appearance
 */
const configureMatteSurface = (
  material: StandardMaterial,
  color: MaterialColor,
  alpha: number = 1
): void => {
  // Set diffuse color
  material.diffuseColor = createColor3(color);

  // Make it matte by reducing specular reflection
  material.specularColor = new Color3(0.05, 0.05, 0.05);
  material.specularPower = 1;

  // Set transparency
  material.alpha = alpha;
  
  // If highly transparent, reduce diffuse contribution
  if (alpha < 0.1) {
    material.diffuseColor = new Color3(0, 0, 0);
    material.emissiveColor = new Color3(0, 0, 0);
    material.specularColor = new Color3(0, 0, 0);
  }
};

/**
 * Creates a matte material with specified color
 *
 * @param name - The name for the material
 * @param scene - The scene to add the material to
 * @param color - Optional color configuration (defaults to gray)
 * @param alpha - Optional transparency value (defaults to 1.0 for opaque)
 * @returns Configured matte material
 */
export const createMatteMaterial = (
  name: string,
  scene: Scene,
  color: MaterialColor = DEFAULT_MATTE_COLOR,
  alpha: number = 1
): StandardMaterial => {
  const material = new StandardMaterial(name, scene);

  configureMatteSurface(material, color, alpha);

  return material;
};
