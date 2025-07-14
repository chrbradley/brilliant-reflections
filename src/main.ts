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
import { applyPositionConstraints } from './transforms/positionTransforms';
import { GizmoManager } from 'babylonjs';
import type { SceneConfig } from './types';
import type { SelectionState } from './state/selectionState';
import type { TransformState } from './state/transformState';

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
let gizmoManager: GizmoManager | null = null;

/**
 * Cleanup function for disposing resources
 */
const cleanup = (): void => {
  if (gizmoManager) {
    gizmoManager.dispose();
    gizmoManager = null;
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

    // Create and configure gizmo manager following reference pattern
    gizmoManager = new GizmoManager(editorConfig.scene);
    gizmoManager.attachableMeshes = [editorCube]; // Only cube is draggable
    gizmoManager.clearGizmoOnEmptyPointerEvent = true; // Auto-clear on empty click
    
    // Bootstrap once so gizmo sub-objects exist
    gizmoManager.attachToMesh(editorCube);
    
    // Enable and configure position gizmo WHILE ATTACHED
    gizmoManager.positionGizmoEnabled = true; // arrows visible
    gizmoManager.gizmos.positionGizmo.snapDistance = 1; // 1-unit grid
    gizmoManager.gizmos.positionGizmo.yGizmo.isEnabled = false; // lock Y-move
    gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = false; // world-aligned
    
    // Add constraint callbacks to X and Z gizmos
    const limitToRoom = (): void => {
      if (gizmoManager?.attachedMesh && editorCube.position) {
        const constrained = applyPositionConstraints(editorCube.position, 1, 8);
        editorCube.position.copyFrom(constrained);
        
        // Update transform state
        transformState = updateObjectPosition(
          transformState,
          'colorCube',
          editorCube.position
        );
        
        // Sync to render scene
        if (renderCube.position) {
          renderCube.position.copyFrom(editorCube.position);
        }
      }
    };
    
    // Apply constraints on drag
    gizmoManager.gizmos.positionGizmo.xGizmo.dragBehavior.onDragObservable.add(limitToRoom);
    gizmoManager.gizmos.positionGizmo.zGizmo.dragBehavior.onDragObservable.add(limitToRoom);
    
    // Start with cube selected to test gizmo visibility
    // gizmoManager.attachToMesh(null);

    // Set up selection handling
    const handleSelection = (objectId: string | null): void => {
      // Remove highlight from previously selected object
      if (selectionState.selectedObjectId) {
        removeHighlight(editorConfig.scene, selectionState.selectedObjectId);
        removeHighlight(renderConfig.scene, selectionState.selectedObjectId);
      }

      // Update selection state
      if (objectId) {
        selectionState = selectObject(selectionState, objectId);
        // Apply highlight to newly selected object
        applyHighlight(editorConfig.scene, objectId);
        applyHighlight(renderConfig.scene, objectId);
        
        // Attach gizmo to selected object
        const editorMesh = editorConfig.scene.getMeshByName(objectId);
        if (editorMesh && gizmoManager) {
          gizmoManager.attachToMesh(editorMesh);
        }
      } else {
        selectionState = clearSelection(selectionState);
        // Detach gizmo
        if (gizmoManager) {
          gizmoManager.attachToMesh(null);
        }
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