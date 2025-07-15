// ABOUTME: Pure functions for applying and removing highlight effects on meshes
// ABOUTME: Uses edge rendering and emissive color for selection feedback

import { Scene, Mesh, StandardMaterial, Color3, Color4 } from 'babylonjs';

/**
 * Map to store original emissive colors for restoration
 */
const originalEmissiveColors = new Map<string, Color3>();

/**
 * Highlight configuration
 */
const HIGHLIGHT_CONFIG = {
  edgeWidth: 6.0,
  edgeColor: new Color4(1, 0.843, 0, 1), // Gold
  emissiveBoost: 0.15,
};

/**
 * Applies highlight effect to a mesh
 *
 * @param scene - The scene containing the mesh
 * @param objectId - ID of the mesh to highlight
 */
export const applyHighlight = (scene: Scene, objectId: string): void => {
  const mesh = scene.getMeshByName(objectId);

  if (!mesh || !(mesh instanceof Mesh)) {
    return;
  }

  // Enable edge rendering for outline effect
  mesh.enableEdgesRendering();
  mesh.edgesWidth = HIGHLIGHT_CONFIG.edgeWidth;
  mesh.edgesColor = HIGHLIGHT_CONFIG.edgeColor;

  // Boost emissive color if mesh has StandardMaterial
  if (mesh.material && mesh.material instanceof StandardMaterial) {
    const material = mesh.material as StandardMaterial;

    // Store original emissive color
    if (!originalEmissiveColors.has(objectId)) {
      originalEmissiveColors.set(objectId, material.emissiveColor.clone());
    }

    // Add emissive boost
    const boostedColor = material.emissiveColor.add(
      new Color3(
        HIGHLIGHT_CONFIG.emissiveBoost,
        HIGHLIGHT_CONFIG.emissiveBoost,
        HIGHLIGHT_CONFIG.emissiveBoost
      )
    );

    material.emissiveColor = boostedColor;
  }
};

/**
 * Removes highlight effect from a mesh
 *
 * @param scene - The scene containing the mesh
 * @param objectId - ID of the mesh to unhighlight
 */
export const removeHighlight = (scene: Scene, objectId: string): void => {
  const mesh = scene.getMeshByName(objectId);

  if (!mesh || !(mesh instanceof Mesh)) {
    return;
  }

  // Disable edge rendering
  mesh.disableEdgesRendering();

  // Restore original emissive color if stored
  if (mesh.material && mesh.material instanceof StandardMaterial) {
    const originalColor = originalEmissiveColors.get(objectId);

    if (originalColor) {
      const material = mesh.material as StandardMaterial;
      material.emissiveColor = originalColor;
      originalEmissiveColors.delete(objectId);
    }
  }
};
