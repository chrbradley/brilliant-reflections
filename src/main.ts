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
import { createInitialSelectionState, selectObject, clearSelection, isSelected } from './state/selectionState';
import { createPickHandler } from './editor/handlePicking';
import { applyHighlight, removeHighlight } from './effects/highlightEffect';
import { createInitialTransformState, updateObjectPosition } from './state/transformState';
import { createPositionGizmo } from './gizmos/createPositionGizmo';
import type { SceneConfig } from './types';
import type { SelectionState } from './state/selectionState';
import type { TransformState } from './state/transformState';
import type { PositionGizmoConfig } from './gizmos/createPositionGizmo';

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
let selectionState: SelectionState = createInitialSelectionState();
let transformState: TransformState = createInitialTransformState();
let currentGizmo: PositionGizmoConfig | null = null;

/**
 * Cleanup function for disposing resources
 */
const cleanup = (): void => {
  if (currentGizmo) {
    currentGizmo.gizmo.dispose();
    currentGizmo = null;
  }
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
    const editorCube = createCube(editorConfig.scene);
    const renderCube = createCube(renderConfig.scene);

    // Create camera rig in editor scene only (shows render camera position)
    const cameraRig = createCameraRig(editorConfig.scene);

    // Set up selection handling
    const handleSelection = (objectId: string | null): void => {
      // Remove highlight from previously selected object
      if (selectionState.selectedObjectId) {
        removeHighlight(editorConfig.scene, selectionState.selectedObjectId);
        removeHighlight(renderConfig.scene, selectionState.selectedObjectId);
      }

      // Dispose current gizmo
      if (currentGizmo) {
        currentGizmo.gizmo.dispose();
        currentGizmo = null;
      }

      // Update selection state
      if (objectId) {
        selectionState = selectObject(selectionState, objectId);
        // Apply highlight to newly selected object
        applyHighlight(editorConfig.scene, objectId);
        applyHighlight(renderConfig.scene, objectId);
        
        // Create position gizmo for selected object in editor
        const editorMesh = editorConfig.scene.getMeshByName(objectId);
        if (editorMesh) {
          currentGizmo = createPositionGizmo(editorConfig.scene, editorMesh);
          
          // Add observer for position changes
          const originalCallback = currentGizmo.constraints.updateCallback;
          currentGizmo.gizmo.xGizmo.dragBehavior?.onPositionChangedObservable.add(() => {
            originalCallback();
            
            // Update transform state
            transformState = updateObjectPosition(
              transformState,
              objectId,
              editorMesh.position
            );
            
            // Sync position to render scene
            const renderMesh = renderConfig.scene.getMeshByName(objectId);
            if (renderMesh) {
              renderMesh.position.copyFrom(editorMesh.position);
            }
          });
          
          currentGizmo.gizmo.zGizmo.dragBehavior?.onPositionChangedObservable.add(() => {
            originalCallback();
            
            // Update transform state
            transformState = updateObjectPosition(
              transformState,
              objectId,
              editorMesh.position
            );
            
            // Sync position to render scene
            const renderMesh = renderConfig.scene.getMeshByName(objectId);
            if (renderMesh) {
              renderMesh.position.copyFrom(editorMesh.position);
            }
          });
        }
      } else {
        selectionState = clearSelection(selectionState);
      }
    };

    // Create pick handler for editor scene
    const pickHandler = createPickHandler(
      editorConfig.scene,
      handleSelection,
      true // Clear selection when clicking empty space
    );

    // Register pick handler
    editorConfig.scene.onPointerObservable.add(pickHandler);

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