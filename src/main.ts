// ABOUTME: Entry point for the Mirror Room Reflection Interactive application
// ABOUTME: Initializes canvases and confirms they are accessible

import './style.css';
import { createEditorScene } from './editor/createEditorScene';
import { createRenderScene } from './render/createRenderScene';
import { createOrthographicCamera } from './cameras/createOrthographicCamera';
import { createPerspectiveCamera } from './cameras/createPerspectiveCamera';
import { attachCamera } from './cameras/attachCamera';
import { createRoom } from './geometry/createRoom';
import { createCube } from './geometry/createCube';
import { createCameraRig } from './editor/createCameraRig';
import { syncCameraWithRig } from './render/syncCameraWithRig';
import { createAmbientLight } from './lighting/createLighting';
import type { SceneConfig } from './types';

/**
 * Get canvas element by ID with type safety
 */
const getCanvas = (id: string): HTMLCanvasElement => {
  const canvas = document.getElementById(id);
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error(`Canvas element with id "${id}" not found`);
  }
  return canvas;
};

/**
 * Application state
 */
let editorConfig: SceneConfig | null = null;
let renderConfig: SceneConfig | null = null;

/**
 * Cleanup function for disposing resources
 */
const cleanup = (): void => {
  if (editorConfig) {
    editorConfig.dispose();
    editorConfig = null;
  }
  if (renderConfig) {
    renderConfig.dispose();
    renderConfig = null;
  }
};

/**
 * Initialize the application
 */
const initialize = (): void => {
  try {
    // Get canvas elements
    const editorCanvas = getCanvas('editorCanvas');
    const renderCanvas = getCanvas('renderCanvas');

    // Create scene configurations
    editorConfig = createEditorScene(editorCanvas);
    renderConfig = createRenderScene(renderCanvas);

    // Create and attach cameras
    const editorCamera = createOrthographicCamera('editorCamera', editorConfig.scene);
    attachCamera(editorCamera, editorConfig.scene, editorCanvas);

    const renderCamera = createPerspectiveCamera('renderCamera', renderConfig.scene);
    attachCamera(renderCamera, renderConfig.scene, renderCanvas);

    // Create lighting for both scenes
    createAmbientLight('editorLight', editorConfig.scene);
    createAmbientLight('renderLight', renderConfig.scene);

    // Create room geometry in both scenes
    createRoom(editorConfig.scene);
    createRoom(renderConfig.scene);

    // Create the interactive cube in both scenes
    createCube(editorConfig.scene);
    createCube(renderConfig.scene);

    // Create camera rig in editor scene only (shows render camera position)
    const cameraRig = createCameraRig(editorConfig.scene);

    // Sync render camera with rig position
    const syncRenderCamera = (): void => {
      const transform = syncCameraWithRig(
        cameraRig.rigNode.position,
        cameraRig.rigNode.rotation
      );
      renderCamera.position.copyFrom(transform.position);
      renderCamera.rotation.copyFrom(transform.rotation);
    };

    // Initial sync
    syncRenderCamera();

    // Set up render loops
    editorConfig.engine.runRenderLoop(() => {
      // Only render if scene has active cameras
      if (editorConfig?.scene.activeCamera) {
        editorConfig.scene.render();
      }
    });

    renderConfig.engine.runRenderLoop(() => {
      // Only render if scene has active cameras
      if (renderConfig?.scene.activeCamera) {
        renderConfig.scene.render();
      }
    });

    // Handle window resize
    const handleResize = (): void => {
      editorConfig?.engine.resize();
      renderConfig?.engine.resize();
    };

    window.addEventListener('resize', handleResize);

    // Handle cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // Log successful initialization
    console.log('Application initialized successfully');
    console.log('Cameras attached. Ready for rendering.');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    cleanup();
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}