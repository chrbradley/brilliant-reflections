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
import {
  createInitialSelectionState,
  selectObject,
  clearSelection,
  isSelected,
} from './state/selectionState';
import { createPickHandler } from './editor/handlePicking';
import { applyHighlight, removeHighlight } from './effects/highlightEffect';
import {
  createInitialTransformState,
  updateObjectPosition,
  updateObjectRotation,
} from './state/transformState';
import { applyPositionConstraints } from './transforms/positionTransforms';
import { applyRotationConstraints } from './transforms/rotationTransforms';
import { createRotationGizmo } from './gizmos/createRotationGizmo';
import { GizmoManager, UtilityLayerRenderer } from 'babylonjs';
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
    const editorCamera = createOrthographicCamera(
      'editorCamera',
      editorConfig.scene
    );
    attachCamera(editorCamera, editorConfig.scene, editorCanvas, true); // Lock editor camera

    const renderCamera = createPerspectiveCamera(
      'renderCamera',
      renderConfig.scene
    );
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
    console.log('🔧 Creating GizmoManager...');
    
    // CRITICAL FIX: Create utility layer explicitly with editor scene
    const utilityLayer = new UtilityLayerRenderer(editorConfig.scene);
    gizmoManager = new GizmoManager(editorConfig.scene, undefined, utilityLayer);
    
    console.log('✅ GizmoManager created with editor scene utility layer:', gizmoManager);
    console.log('🎯 Utility layer scene engine canvas:', gizmoManager.utilityLayer.utilityLayerScene.getEngine().getRenderingCanvas().id);
    
    gizmoManager.attachableMeshes = [editorCube, cameraRig.coneIndicator]; // Cube and camera rig cone are draggable
    gizmoManager.clearGizmoOnEmptyPointerEvent = true; // Auto-clear on empty click
    console.log('📦 EditorCube for gizmo:', editorCube);

    // Bootstrap once so gizmo sub-objects exist
    console.log('🔗 Attaching to editorCube...');
    gizmoManager.attachToMesh(editorCube);
    console.log('✅ Attached mesh:', gizmoManager.attachedMesh);

    // ── TRANSLATE ── (following exact reference pattern)
    console.log('⚡ Enabling position gizmo...');
    gizmoManager.positionGizmoEnabled = true; // arrows visible
    console.log('✅ Position gizmo enabled:', gizmoManager.positionGizmoEnabled);
    
    // ── ROTATE ── (Y-axis only)
    console.log('⚡ Enabling rotation gizmo...');
    gizmoManager.rotationGizmoEnabled = true; // Y-ring visible
    console.log('✅ Rotation gizmo enabled:', gizmoManager.rotationGizmoEnabled);
    
    // Wait for gizmo to be ready then configure
    setTimeout(() => {
      if (gizmoManager.gizmos.positionGizmo) {
        console.log('🔧 Configuring position gizmo after delay...');
        gizmoManager.gizmos.positionGizmo.snapDistance = 1; // 1-unit grid
        gizmoManager.gizmos.positionGizmo.yGizmo.isEnabled = false; // lock Y-move
        gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = false; // world-aligned
        console.log('✅ Position gizmo configured with delay');
        
        console.log('✅ Position gizmo ready for manipulation');
      } else {
        console.error('❌ Position gizmo still null after delay!');
      }
      
      // Configure rotation gizmo
      if (gizmoManager.gizmos.rotationGizmo) {
        console.log('🔧 Configuring rotation gizmo...');
        const rotGizmo = gizmoManager.gizmos.rotationGizmo;
        rotGizmo.snapDistance = Math.PI / 12; // 15 degrees in radians
        rotGizmo.updateGizmoRotationToMatchAttachedMesh = false; // world-aligned
        rotGizmo.xGizmo.isEnabled = false; // hide X ring
        rotGizmo.zGizmo.isEnabled = false; // hide Z ring
        console.log('✅ Rotation gizmo configured (Y-axis only)');
      } else {
        console.error('❌ Rotation gizmo is null or undefined!');
      }
    }, 100);

    // Add constraint callbacks for position and rotation
    const limitToRoom = (): void => {
      if (gizmoManager?.attachedMesh) {
        const attachedMesh = gizmoManager.attachedMesh;
        
        if (attachedMesh === editorCube && editorCube.position) {
          // Handle cube position constraints
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
        } else if (attachedMesh === cameraRig.rigNode && cameraRig.rigNode.position) {
          // Handle camera rig position constraints (rig selected directly)  
          const constrained = applyPositionConstraints(cameraRig.rigNode.position, 1, 8);
          cameraRig.rigNode.position.copyFrom(constrained);

          // Update transform state
          transformState = updateObjectPosition(
            transformState,
            'cameraRig',
            cameraRig.rigNode.position
          );
        }
      }
    };
    
    const constrainRotation = (): void => {
      if (gizmoManager?.attachedMesh) {
        const attachedMesh = gizmoManager.attachedMesh;
        
        if (attachedMesh === editorCube && editorCube.rotation) {
          // Handle cube rotation constraints
          const constrained = applyRotationConstraints(editorCube.rotation, 15);
          editorCube.rotation.copyFrom(constrained);

          // Update transform state
          transformState = updateObjectRotation(
            transformState,
            'colorCube',
            editorCube.rotation
          );

          // Sync to render scene
          if (renderCube.rotation) {
            renderCube.rotation.copyFrom(editorCube.rotation);
          }
        } else if (attachedMesh === cameraRig.rigNode && cameraRig.pivotNode.rotation) {
          // Handle camera rig rotation constraints (Y-axis only)
          // Apply Y rotation to pivot, not rig (matches reference behavior)
          const constrained = applyRotationConstraints(cameraRig.pivotNode.rotation, 15);
          cameraRig.pivotNode.rotation.copyFrom(constrained);

          // Update transform state
          transformState = updateObjectRotation(
            transformState,
            'cameraRig',
            cameraRig.pivotNode.rotation
          );
        }
      }
    };

    // Apply constraints on drag (delayed to ensure gizmos are ready)
    setTimeout(() => {
      if (gizmoManager.gizmos.positionGizmo) {
        gizmoManager.gizmos.positionGizmo.xGizmo.dragBehavior.onDragObservable.add(
          limitToRoom
        );
        gizmoManager.gizmos.positionGizmo.zGizmo.dragBehavior.onDragObservable.add(
          limitToRoom
        );
        console.log('✅ Position drag constraints attached');
      }
      
      if (gizmoManager.gizmos.rotationGizmo) {
        gizmoManager.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragObservable.add(
          constrainRotation
        );
        console.log('✅ Rotation drag constraints attached');
      }
    }, 150);

    // Following reference pattern: start with nothing selected, then select cube
    setTimeout(() => {
      console.log('🔄 Detaching from cube to reset...');
      gizmoManager.attachToMesh(null);
      
      // Then immediately reattach to test
      setTimeout(() => {
        console.log('🔄 Reattaching to cube for gizmo visibility test...');
        gizmoManager.attachToMesh(editorCube);
      }, 50);
    }, 200);

    // Set up selection handling
    const handleSelection = (objectId: string | null): void => {
      if (editorConfig && renderConfig) {
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
            // If camera cone clicked, attach gizmo to the rig instead (matches reference)
            const target = editorMesh === cameraRig.coneIndicator ? cameraRig.rigNode : editorMesh;
            gizmoManager.attachToMesh(target);
          }
        } else {
          selectionState = clearSelection(selectionState);
          // Detach gizmo
          if (gizmoManager) {
            gizmoManager.attachToMesh(null);
          }
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

    // Keep Y positions locked (matches reference behavior)
    const lockYPositions = (): void => {
      if (editorCube) {
        editorCube.position.y = 1; // Keep cube 1 unit above ground
      }
      if (renderCube) {
        renderCube.position.y = 1; // Keep render cube synced
      }
      if (cameraRig.rigNode) {
        cameraRig.rigNode.position.y = 0; // Keep rig base on ground
      }
    };

    // Initial sync
    syncRenderCamera();

    // Set up render loops
    editorConfig.engine.runRenderLoop(() => {
      // Keep Y positions locked before each render
      lockYPositions();
      
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

    // Add Babylon.js scene inspector for debugging
    if (window.location.search.includes('inspector')) {
      import('@babylonjs/inspector').then(() => {
        editorConfig.scene.debugLayer.show({
          embedMode: true,
        });
      });
    }

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
