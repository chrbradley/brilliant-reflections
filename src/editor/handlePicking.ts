// ABOUTME: Pure function factory for creating pick event handlers
// ABOUTME: Uses functional composition to handle object selection in the editor

import { Scene, PointerEventTypes, PointerInfo } from 'babylonjs';

/**
 * Pick handler function type
 */
export type PickHandler = (pointerInfo: PointerInfo) => void;

/**
 * Callback for when an object is picked
 */
export type OnPickCallback = (objectId: string | null) => void;

/**
 * Creates a pick handler function for the scene
 * 
 * @param scene - The scene to handle picks in
 * @param onPick - Callback when object is picked
 * @param clearOnEmpty - Whether to call onPick(null) when clicking empty space
 * @returns Pick handler function
 */
export const createPickHandler = (
  scene: Scene,
  onPick: OnPickCallback,
  clearOnEmpty: boolean = false
): PickHandler => {
  // Return the event handler function
  return (pointerInfo: PointerInfo): void => {
    // Only handle pick events
    if (pointerInfo.type !== PointerEventTypes.POINTERPICK) {
      return;
    }

    const pickInfo = pointerInfo.pickInfo;
    
    // Check if we hit something
    if (pickInfo?.hit && pickInfo.pickedMesh?.isPickable) {
      // Call callback with mesh name/id
      onPick(pickInfo.pickedMesh.name);
    } else if (clearOnEmpty) {
      // Clear selection when clicking empty space
      onPick(null);
    }
  };
};