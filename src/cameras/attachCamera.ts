// ABOUTME: Function to attach a camera to a scene and handle canvas interaction
// ABOUTME: Manages camera activation and aspect ratio handling

import { Camera, Scene } from 'babylonjs';

/**
 * Updates orthographic camera bounds based on canvas aspect ratio
 */
const updateOrthographicAspectRatio = (
  camera: Camera,
  canvas: HTMLCanvasElement
): void => {
  if (camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
    const aspectRatio = canvas.width / canvas.height;
    const halfHeight = 10; // Half of our 20-unit view height
    const halfWidth = halfHeight * aspectRatio;
    
    // Update bounds to maintain aspect ratio
    (camera as any).orthoLeft = -halfWidth;
    (camera as any).orthoRight = halfWidth;
    (camera as any).orthoTop = halfHeight;
    (camera as any).orthoBottom = -halfHeight;
  }
};

/**
 * Attaches a camera to the scene and canvas
 * 
 * @param camera - The camera to attach
 * @param scene - The scene to attach to
 * @param canvas - The canvas element for controls
 * @param preventDefaultEvents - Whether to prevent default control events
 */
export const attachCamera = (
  camera: Camera,
  scene: Scene,
  canvas: HTMLCanvasElement,
  preventDefaultEvents: boolean = false
): void => {
  // Set as active camera
  scene.activeCamera = camera;
  
  // Handle aspect ratio for orthographic cameras
  updateOrthographicAspectRatio(camera, canvas);
  
  // Attach controls to canvas unless prevented
  if (!preventDefaultEvents) {
    camera.attachControl(canvas, true);
  }
};